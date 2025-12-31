<script lang="ts">
	type Props = {
		onClick: () => void;
	};

	let { onClick }: Props = $props();
</script>

<button
	onclick={onClick}
	class="absolute top-1/2 right-2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-gray-400 hover:text-white focus:outline-none"
	aria-label="Clear"
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
