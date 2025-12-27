<script lang="ts">
	import type { Card as CardType } from '$lib/data/cards';
	import CardControls from './CardControls.svelte';

	type Props = {
		title: string;
		cards: [string, number][];
		total: number;
		required: number;
		getCard: (cardId: string) => CardType | undefined;
		onRemoveCard: (cardId: string) => void;
		onAddCard: (cardId: string) => void;
	};

	let { title, cards, total, required, getCard, onRemoveCard, onAddCard }: Props = $props();
</script>

<div class="rounded-lg bg-gray-700 p-4">
	<div class="mb-3 flex items-center justify-between">
		<h3 class="text-lg font-semibold text-white">{title}</h3>
		<span class="text-sm text-gray-400">{total}/{required} cards</span>
	</div>

	{#if cards.length === 0}
		<div class="py-8 text-center text-gray-500">No cards in {title.toLowerCase()} yet</div>
	{:else}
		<div class="max-h-96 space-y-2 overflow-y-auto">
			{#each cards as [cardId, count]}
				{@const card = getCard(cardId)}
				{#if card}
					<div class="flex items-center justify-between rounded bg-gray-600 p-2">
						<div class="min-w-0 flex-1">
							<div class="truncate text-sm font-medium text-white">{card.name}</div>
							<div class="text-xs text-gray-400">{card.type} • {card.faction}</div>
						</div>
						<CardControls
							{count}
							maxCopies={card.maxCopies || 3}
							onRemove={() => onRemoveCard(cardId)}
							onAdd={() => onAddCard(cardId)}
							showRemoveAsCross={true}
						/>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
