<script lang="ts">
	import Card from './Card.svelte';
	import type { Card as CardType } from '$lib/data/cards';

	type Props = {
		resultsCount: number;
		onReset: () => void;
		children: any;
		selectedCard?: CardType;
		onCardClick?: (cardId: string) => void;
		hasActiveFilters?: boolean;
	};

	let {
		resultsCount,
		onReset,
		children,
		selectedCard,
		onCardClick,
		hasActiveFilters = false
	}: Props = $props();
</script>

<!-- Filters Section -->
<div class="mb-4 rounded-lg bg-gray-800 p-4 shadow-xl">
	{@render children()}
</div>

<!-- Selected Card Display -->
{#if selectedCard && onCardClick}
	<div class="mb-4">
		<Card card={selectedCard} onclick={() => onCardClick(selectedCard.id)} />
	</div>
{/if}

<!-- Results Count -->
<div class="mb-4 flex items-center justify-between">
	<div class="text-sm text-gray-400">
		{resultsCount} result{resultsCount !== 1 ? 's' : ''}
	</div>
	<button
		onclick={onReset}
		class="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none {hasActiveFilters
			? ''
			: 'invisible'}"
	>
		<span>Reset</span>
	</button>
</div>
