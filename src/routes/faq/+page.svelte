<script lang="ts">
	import { faq, type FAQ } from '$lib/data/faq';
	import { cards } from '$lib/data/cards';
	import Header from '$lib/components/Header.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import FAQItem from '$lib/components/FAQItem.svelte';
	import CardImageModal from '$lib/components/CardImageModal.svelte';
	import { matchesSearch } from '$lib/utils/matchesSearch';

	let searchQuery = $state('');
	let selectedCardId = $state<string | null>(null);

	// Card name search state
	let cardNameInput = $state('');
	let selectedCard = $state<string | null>(null);
	let showCardSuggestions = $state(false);
	let selectedSuggestionIndex = $state(0);

	// Filtered card name suggestions
	const filteredCardSuggestions = $derived.by(() => {
		if (!cardNameInput.trim()) return [];
		const input = cardNameInput.toLowerCase();
		return cards
			.filter((card) => card.name.toLowerCase().includes(input))
			.slice(0, 10);
	});

	// Filter FAQs based on search query and selected card
	const filteredFAQs = $derived.by(() => {
		let filtered = faq;

		// Filter by search query
		if (searchQuery.trim()) {
			filtered = filtered.filter((item) => matchesSearch(searchQuery, () => [item.question, item.answer]));
		}

		// Filter by selected card
		if (selectedCard) {
			const card = cards.find((c) => c.id === selectedCard);
			if (card && card.faq) {
				filtered = filtered.filter((item) => card.faq.includes(item.id));
			}
		}

		return filtered;
	});

	function handleCardClick(cardId: string) {
		selectedCardId = cardId;
	}

	function selectCard(cardId: string) {
		selectedCard = cardId;
		cardNameInput = cards.find((c) => c.id === cardId)?.name || '';
		showCardSuggestions = false;
	}

	function handleCardInputKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (filteredCardSuggestions.length > 0) {
				selectCard(filteredCardSuggestions[selectedSuggestionIndex].id);
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, filteredCardSuggestions.length - 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
		} else if (e.key === 'Escape') {
			showCardSuggestions = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-900 text-white">
	<div class="mx-auto max-w-7xl px-4 py-8">
		<Header currentPage="faq" />

		<!-- Search Bars -->
		<div class="mb-6 space-y-4">
			<SearchInput bind:value={searchQuery} label="Search FAQs" />
			<div>
				<label for="card-name-input" class="mb-2 block text-sm font-medium">Filter by Card Name</label>
				<div class="relative">
					<input
						id="card-name-input"
						type="text"
						bind:value={cardNameInput}
						onkeydown={handleCardInputKeydown}
						onfocus={() => (showCardSuggestions = true)}
						onblur={() => setTimeout(() => (showCardSuggestions = false), 200)}
						oninput={() => {
							showCardSuggestions = true;
							selectedSuggestionIndex = 0;
							selectedCard = null; // Clear selection when typing
						}}
						placeholder="Enter card name..."
						class="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
					{#if showCardSuggestions && filteredCardSuggestions.length > 0}
						<div
							class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-600 bg-gray-700 shadow-lg"
						>
							{#each filteredCardSuggestions as suggestion, index}
								<button
									type="button"
									onclick={() => selectCard(suggestion.id)}
									class="w-full px-4 py-2 text-left text-sm text-white hover:bg-gray-600 focus:bg-gray-600 focus:outline-none {index ===
									selectedSuggestionIndex
										? 'bg-gray-600'
										: ''}"
								>
									{suggestion.name}
								</button>
							{/each}
						</div>
					{/if}
				</div>
				{#if selectedCard}
					<p class="mt-2 text-sm text-gray-400">
						Showing FAQ entries related to "{cards.find((c) => c.id === selectedCard)?.name}"
					</p>
				{/if}
			</div>
		</div>

		<!-- FAQ List -->
		<div class="space-y-3">
			{#each filteredFAQs as item (item.id)}
				<FAQItem {item} {searchQuery} onCardClick={handleCardClick} />
			{/each}
		</div>

		{#if filteredFAQs.length === 0}
			<div class="text-center text-gray-400">
				<p>No FAQs found matching your search.</p>
			</div>
		{/if}
	</div>

	<CardImageModal cardId={selectedCardId} onclose={() => (selectedCardId = null)} />
</div>
