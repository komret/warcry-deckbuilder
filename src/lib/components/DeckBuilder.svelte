<script lang="ts">
	import type { Card as CardType, Type } from '$lib/data/cards';
	import DeckSection from './DeckSection.svelte';
	import Box from './Box.svelte';
	import { cardMatchesFormat } from '$lib/utils/cardMatchesFormat';

	type Props = {
		deck: Map<string, number>;
		cards: CardType[];
		onRemoveCard: (cardId: string) => void;
		onAddCard: (cardId: string) => void;
	};

	let { deck, cards, onRemoveCard, onAddCard }: Props = $props();

	// Get card by ID
	function getCard(cardId: string): CardType | undefined {
		return cards.find((card) => card.id === cardId);
	}

	// Helper function to get filtered and sorted cards
	function getFilteredCards(cardTypes: Type[]): [string, number][] {
		return Array.from(deck.entries())
			.filter(([cardId]) => {
				const card = getCard(cardId);
				return card && cardTypes.includes(card.type);
			})
			.sort(([a], [b]) => {
				const cardA = getCard(a);
				const cardB = getCard(b);
				if (!cardA || !cardB) return 0;
				return cardA.name.localeCompare(cardB.name);
			});
	}

	// Calculate deck sections
	const armyCards = $derived(() => getFilteredCards(['Unit', 'Attachment']));
	const actionCards = $derived(() => getFilteredCards(['Tactic', 'Command', 'Reaction']));

	// Available cards for each section (not in deck)
	const availableArmyCards = $derived(() => {
		return cards.filter(
			(card) => (card.type === 'Unit' || card.type === 'Attachment') && !deck.has(card.id)
		);
	});

	const availableActionCards = $derived(() => {
		return cards.filter(
			(card) =>
				(card.type === 'Tactic' || card.type === 'Command' || card.type === 'Reaction') &&
				!deck.has(card.id)
		);
	});

	const armyTotal = $derived(() => {
		return armyCards().reduce((sum: number, [, count]: [string, number]) => sum + count, 0);
	});

	const actionTotal = $derived(() => {
		return actionCards().reduce((sum: number, [, count]: [string, number]) => sum + count, 0);
	});

	// Optimized format determination for deck validation
	function getDeckFormatOptimized(cards: CardType[]): string {
		if (cards.length === 0) return 'Open';

		let isOldSchool = true;
		let isWarcry = true;
		let isAttrition = true;

		for (const card of cards) {
			// Check Old School (skip if already ruled out)
			if (isOldSchool && !cardMatchesFormat(card, 'oldschool')) {
				isOldSchool = false;
			}

			// Check WarCry (skip if already ruled out)
			if (isWarcry && !cardMatchesFormat(card, 'warcry')) {
				isWarcry = false;
			}

			// Check Attrition (skip if already ruled out)
			if (isAttrition && !cardMatchesFormat(card, 'attrition')) {
				isAttrition = false;
			}

			// Early exit if all formats ruled out
			if (!isOldSchool && !isWarcry && !isAttrition) {
				break;
			}
		}

		if (isOldSchool) return 'Old School';
		if (isWarcry) return 'WarCry';
		if (isAttrition) return 'Attrition';
		return 'Open';
	}

	// Deck validation - returns validation message
	const getValidationStatus = $derived(() => {
		let validationMessages = [];

		// Check minimum card counts
		if (armyTotal() < 30 || actionTotal() < 30) {
			validationMessages.push(`not enough cards`);
		}

		// Check faction compatibility
		const allCardsInDeck = Array.from(deck.entries())
			.map(([cardId]) => getCard(cardId))
			.filter((card): card is CardType => card !== undefined);
		const factionsInDeck = new Set(allCardsInDeck.map((card) => card.faction));

		// Invalid if both Hordes of Darkness and Grand Alliance are present
		if (factionsInDeck.has('Hordes of Darkness') && factionsInDeck.has('Grand Alliance')) {
			validationMessages.push('mixed factions');
		}

		if (validationMessages.length > 0) {
			return `Invalid deck: ${validationMessages.join(', ')}.`;
		}

		// Valid deck - determine faction and format
		let faction = 'Neutral';
		if (factionsInDeck.has('Grand Alliance')) {
			faction = 'Grand Alliance';
		} else if (factionsInDeck.has('Hordes of Darkness')) {
			faction = 'Hordes of Darkness';
		}

		// Determine format using shared utility
		const format = getDeckFormatOptimized(allCardsInDeck);

		return `Faction: ${faction}, Format: ${format}`;
	});
</script>

<Box>
	<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
		<DeckSection
			title="Army Deck"
			cards={armyCards()}
			total={armyTotal()}
			{getCard}
			{onRemoveCard}
			{onAddCard}
			availableCards={availableArmyCards()}
		/>

		<DeckSection
			title="Action Deck"
			cards={actionCards()}
			total={actionTotal()}
			{getCard}
			{onRemoveCard}
			{onAddCard}
			availableCards={availableActionCards()}
		/>
	</div>

	{#if deck.size > 0}
		<div class="mt-2 flex items-center justify-between">
			<span class="text-sm font-medium text-gray-300">
				{getValidationStatus()}
			</span>
		</div>
	{/if}
</Box>
