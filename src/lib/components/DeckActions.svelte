<!-- Type declarations for Google API -->
<script lang="ts" module>
	interface TokenResponse {
		access_token: string;
		expires_in: number;
		token_type: string;
		scope: string;
		error?: string;
	}

	interface TokenClient {
		requestAccessToken(): void;
	}

	interface GoogleIdentity {
		accounts: {
			oauth2: {
				initTokenClient(config: {
					client_id: string;
					scope: string;
					callback: (response: TokenResponse) => void;
				}): TokenClient;
			};
		};
	}

	declare global {
		interface Window {
			google: GoogleIdentity;
		}
	}
</script>

<script lang="ts">
	import Toast from './Toast.svelte';
	import Button from './Button.svelte';
	import { browser } from '$app/environment';

	const google = browser ? window.google : null;

	type DeckData = {
		deck: [string, number][];
		sideboard: [string, number][];
		timestamp: string;
	};

	type Props = {
		onClearDeck?: () => void;
		hasCards: boolean;
		deck: Map<string, number>;
		sideboard: Map<string, number>;
		readOnly?: boolean;
		onOpenInDeckBuilder?: () => void;
		onLoadDeck?: (deck: Map<string, number>, sideboard: Map<string, number>) => void;
	};

	let {
		onClearDeck,
		hasCards,
		deck,
		sideboard,
		readOnly = false,
		onOpenInDeckBuilder,
		onLoadDeck
	}: Props = $props();

	let showToast = $state(false);
	let toastMessage = $state('');

	// Check if Google Drive integration is available
	const isGoogleDriveAvailable = $derived(
		!!(import.meta.env.VITE_GOOGLE_CLIENT_ID && import.meta.env.VITE_GOOGLE_API_KEY)
	);

	function showToastNotification(message: string) {
		toastMessage = message;
		showToast = true;
		setTimeout(() => {
			showToast = false;
		}, 3000); // Hide after 3 seconds
	}

	function shareDeck() {
		// Construct deck string: count + cardId, separated by commas
		const deckParts = Array.from(deck.entries())
			.map(([cardId, count]) => `${count}${cardId}`)
			.sort();

		const sideboardParts = Array.from(sideboard.entries())
			.map(([cardId, count]) => `${count}${cardId}`)
			.sort();

		// Build URL
		let url = '/shared';
		const params = new URLSearchParams();

		if (deckParts.length > 0) {
			params.set('deck', deckParts.join(','));
		}

		if (sideboardParts.length > 0) {
			params.set('sideboard', sideboardParts.join(','));
		}

		const paramString = params.toString();
		if (paramString) {
			url += '?' + paramString;
		}

		// Copy to clipboard
		navigator.clipboard
			.writeText(window.location.origin + url)
			.then(() => {
				showToastNotification('Deck URL copied to clipboard');
			})
			.catch(() => {
				// Fallback: show the URL in a prompt
				prompt('Copy this URL:', window.location.origin + url);
				// Fallback: show the URL in a prompt
				prompt('Copy this URL:', window.location.origin + url);
			});
	}

	// Google Drive integration
	let isGoogleApiLoaded = $state(false);
	let isSignedIn = $state(false);
	let tokenClient: TokenClient | null = $state(null);
	let accessToken: string | null = $state(null);

	// Initialize Google API
	function initGoogleApi() {
		if (!browser) return; // Only run on client side

		if (!isGoogleDriveAvailable) {
			showToastNotification('Google Drive integration not configured');
			return;
		}

		if (!google) {
			showToastNotification('Google API not loaded');
			return;
		}

		// Initialize the Google Identity Services
		tokenClient = google.accounts.oauth2.initTokenClient({
			client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
			scope: 'https://www.googleapis.com/auth/drive.file',
			callback: (tokenResponse: TokenResponse) => {
				if (tokenResponse.error !== undefined) {
					console.error('Error during token request:', tokenResponse);
					showToastNotification('Failed to authenticate with Google');
					return;
				}
				accessToken = tokenResponse.access_token;
				isSignedIn = true;
				isGoogleApiLoaded = true;
			}
		});

		isGoogleApiLoaded = true;
	}

	// Sign in to Google
	function signInToGoogle() {
		if (!browser) return;

		if (!isGoogleApiLoaded) {
			initGoogleApi();
			return;
		}

		if (!tokenClient) {
			showToastNotification('Google API not initialized');
			return;
		}

		tokenClient.requestAccessToken();
	}

	// Save deck to Google Drive
	async function saveDeckToDrive() {
		if (!browser) return;

		if (!isGoogleDriveAvailable) {
			showToastNotification('Google Drive integration not configured');
			return;
		}

		if (!isSignedIn || !accessToken) {
			signInToGoogle();
			return;
		}

		try {
			// Create deck data
			const deckData = {
				deck: Array.from(deck.entries()),
				sideboard: Array.from(sideboard.entries()),
				timestamp: new Date().toISOString()
			};

			const fileContent = JSON.stringify(deckData, null, 2);
			const fileName = `Warcry Deck - ${new Date().toLocaleDateString()}.json`;

			const file = new Blob([fileContent], { type: 'application/json' });
			const metadata = {
				name: fileName,
				mimeType: 'application/json',
				parents: ['appDataFolder'] // Save to app data folder
			};

			const form = new FormData();
			form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
			form.append('file', file);

			const response = await fetch(
				'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${accessToken}`
					},
					body: form
				}
			);

			if (response.ok) {
				showToastNotification('Deck saved to Google Drive');
			} else {
				throw new Error('Failed to save deck');
			}
		} catch (error) {
			console.error('Error saving deck:', error);
			showToastNotification('Failed to save deck to Google Drive');
		}
	}

	// Load deck from Google Drive
	async function loadDeckFromDrive() {
		if (!browser) return;

		if (!isGoogleDriveAvailable) {
			showToastNotification('Google Drive integration not configured');
			return;
		}

		if (!isSignedIn || !accessToken) {
			signInToGoogle();
			return;
		}

		try {
			// List files in app data folder
			const listResponse = await fetch(
				'https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&orderBy=modifiedTime%20desc',
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				}
			);

			if (!listResponse.ok) {
				throw new Error('Failed to list files');
			}

			const listData = await listResponse.json();
			const files = listData.files;

			if (!files || files.length === 0) {
				showToastNotification('No saved decks found');
				return;
			}

			// For now, load the most recent file
			const latestFile = files[0];

			const fileResponse = await fetch(
				`https://www.googleapis.com/drive/v3/files/${latestFile.id}?alt=media`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				}
			);

			if (!fileResponse.ok) {
				throw new Error('Failed to download file');
			}

			const fileContent = await fileResponse.text();
			const deckData: DeckData = JSON.parse(fileContent);
			const loadedDeck = new Map<string, number>(deckData.deck);
			const loadedSideboard = new Map<string, number>(deckData.sideboard);

			if (onLoadDeck) {
				onLoadDeck(loadedDeck, loadedSideboard);
				showToastNotification('Deck loaded from Google Drive');
			}
		} catch (error) {
			console.error('Error loading deck:', error);
			showToastNotification('Failed to load deck from Google Drive');
		}
	}

	// Initialize Google API on mount
	$effect(() => {
		if (browser) {
			initGoogleApi();
		}
	});
</script>

<div class="flex items-center justify-end gap-2">
	{#if readOnly}
		<Button variant="primary" onclick={onOpenInDeckBuilder}>
			<span>Open in Deck Builder</span>
		</Button>
	{:else}
		<Button
			variant="success"
			onclick={shareDeck}
			class="flex items-center gap-2 {hasCards ? '' : 'invisible'}"
			title="Copy deck URL"
		>
			<span>Share</span>
		</Button>
		<Button
			variant="primary"
			onclick={onClearDeck}
			class="flex items-center gap-2 {hasCards ? '' : 'invisible'}"
			title="Reset deck"
		>
			<span>Reset</span>
		</Button>
		{#if isGoogleDriveAvailable}
			<Button
				variant="secondary"
				onclick={saveDeckToDrive}
				class="flex items-center gap-2 {hasCards ? '' : 'invisible'}"
				title="Save deck to Google Drive"
			>
				<span>Save to Drive</span>
			</Button>
			<Button
				variant="secondary"
				onclick={loadDeckFromDrive}
				class="flex items-center gap-2"
				title="Load deck from Google Drive"
			>
				<span>Load from Drive</span>
			</Button>
		{/if}
	{/if}
</div>

<Toast message={toastMessage} show={showToast} />
