<script lang="ts">
	import type { Card as CardType } from '$lib/data/cards';

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
						<div class="ml-2 flex items-center">
							<button
								onclick={() => onRemoveCard(cardId)}
								class="flex h-6 w-6 items-center justify-center text-lg {count <= 0
									? 'cursor-pointer text-red-400 hover:text-red-300'
									: 'cursor-pointer text-blue-300 hover:text-blue-400'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
								disabled={false}
								aria-label={count === 0 ? 'Remove card from deck' : 'Remove one copy'}
							>
								{count === 0 ? '×' : '−'}
							</button>
							<span class="flex h-6 w-7 items-center justify-center text-lg text-gray-300"
								>{count}</span
							>
							<button
								onclick={() => onAddCard(cardId)}
								class="flex h-6 w-6 items-center justify-center text-lg {count >=
								(card.maxCopies || 3)
									? 'cursor-default text-gray-400'
									: 'cursor-pointer text-blue-300 hover:text-blue-400'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
								disabled={count >= (card.maxCopies || 3)}
								aria-label="Add one copy"
							>
								+
							</button>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>