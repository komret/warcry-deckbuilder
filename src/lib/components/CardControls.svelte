<script lang="ts">
	import type { Card as CardType } from '$lib/data/cards';

	type Props = {
		count: number;
		maxCopies: number;
		onRemove: () => void;
		onAdd: () => void;
		showRemoveAsCross?: boolean;
	};

	let { count, maxCopies, onRemove, onAdd, showRemoveAsCross = true }: Props = $props();
</script>

<div class="ml-2 flex items-center">
	<button
		onclick={onRemove}
		class="flex h-6 w-6 items-center justify-center text-lg {showRemoveAsCross && count <= 0
			? 'cursor-pointer text-red-400 hover:text-red-300'
			: count <= 0
				? 'cursor-default text-gray-400'
				: 'cursor-pointer text-blue-300 hover:text-blue-400'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
		disabled={count <= 0 && !showRemoveAsCross}
		aria-label={count === 0 ? 'Remove card from deck' : 'Remove one copy'}
	>
		{showRemoveAsCross && count === 0 ? '×' : '−'}
	</button>
	<span class="flex h-6 w-7 items-center justify-center text-lg text-gray-300">{count}</span>
	<button
		onclick={onAdd}
		class="flex h-6 w-6 items-center justify-center text-lg {count >= maxCopies
			? 'cursor-default text-gray-400'
			: 'cursor-pointer text-blue-300 hover:text-blue-400'} focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50"
		disabled={count >= maxCopies}
		aria-label="Add one copy"
	>
		+
	</button>
</div>
