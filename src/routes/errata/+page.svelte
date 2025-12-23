<script lang="ts">
	import { cards } from '$lib/data/cards';
	import Card from '$lib/components/Card.svelte';
	import Header from '$lib/components/Header.svelte';

	// Filter cards with "Errata" in text
	const errataCards = cards.filter((card) => card.text.toLowerCase().includes('errata'));

	// Filter banned cards
	const bannedCards = cards.filter((card) => card.banned);
</script>

<div class="min-h-screen bg-gray-900 text-white">
	<div class="mx-auto max-w-7xl px-4 py-8">
		<Header currentPage="errata" />

		<!-- Errata Cards Section -->
		<section class="mb-8">
			<h2 class="mb-4 text-2xl font-bold">Cards with Errata</h2>
			{#if errataCards.length > 0}
				<div class="space-y-4">
					{#each errataCards as card}
						<Card {card} />
					{/each}
				</div>
			{:else}
				<p class="text-gray-400">No cards with errata found.</p>
			{/if}
		</section>

		<!-- Banned Cards Section -->
		<section>
			<h2 class="mb-4 text-2xl font-bold">Banned Cards</h2>
			{#if bannedCards.length > 0}
				<div class="space-y-4">
					{#each bannedCards as card}
						<Card {card} />
					{/each}
				</div>
			{:else}
				<p class="text-gray-400">No banned cards found.</p>
			{/if}
		</section>
	</div>
</div>
