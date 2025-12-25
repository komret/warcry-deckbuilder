<script lang="ts">
	type Props = {
		value: string;
		placeholder?: string;
	};

	let { value = $bindable(''), placeholder = 'Search...' }: Props = $props();

	let inputElement: HTMLInputElement | undefined = $state();

	const insertCharacter = (char: string) => {
		if (inputElement) {
			const start = inputElement.selectionStart ?? value.length;
			const end = inputElement.selectionEnd ?? value.length;
			value = value.slice(0, start) + char + value.slice(end);
			// Set cursor position after inserted character
			setTimeout(() => {
				if (inputElement) {
					const newPos = start + char.length;
					inputElement.setSelectionRange(newPos, newPos);
					inputElement.focus();
				}
			}, 0);
		} else {
			value += char;
		}
	};
</script>

<div class="flex items-center gap-2">
	<div class="relative flex-1">
		<input
			bind:this={inputElement}
			type="text"
			bind:value
			{placeholder}
			class="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
		/>
		{#if value}
			<button
				onclick={() => (value = '')}
				class="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white"
				aria-label="Clear search"
			>
				<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>
	<button
		type="button"
		onclick={() => insertCharacter('|')}
		class="flex h-[42px] w-8 items-center justify-center rounded border border-gray-600 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
		aria-label="Insert OR operator"
		title="OR operator"
	>
		|
	</button>
	<button
		type="button"
		onclick={() => insertCharacter('&')}
		class="flex h-[42px] w-8 items-center justify-center rounded border border-gray-600 bg-gray-700 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
		aria-label="Insert AND operator"
		title="AND operator"
	>
		&
	</button>
</div>
