<script lang="ts">
	import { cards } from '$lib/data/cards';
	import Card from '$lib/components/Card.svelte';
	import logo from '$lib/assets/warcry-logo.png';

	// Navigation menu state
	let showMenu = $state(false);

	// Filter cards with "Errata" in text
	const errataCards = cards.filter((card) => card.text.toLowerCase().includes('errata'));

	// Filter banned cards
	const bannedCards = cards.filter((card) => card.banned);
</script>

<div class="min-h-screen bg-gray-900 text-white">
	<div class="mx-auto max-w-7xl px-4 py-8">
		<header class="mb-4">
			<div class="mb-3 flex items-center justify-between">
				<a href="/" class="block">
					<img src={logo} alt="WarCry Logo" class="h-16" />
				</a>

				<!-- Hamburger Menu Button -->
				<button
					onclick={() => (showMenu = !showMenu)}
					class="rounded-lg p-2 hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					aria-label="Toggle menu"
					aria-expanded={showMenu}
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if showMenu}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						{:else}
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M4 6h16M4 12h16M4 18h16"
							/>
						{/if}
					</svg>
				</button>
			</div>

			<!-- Navigation Menu -->
			{#if showMenu}
				<nav class="mb-4 rounded-lg bg-gray-800 p-4 shadow-lg">
					<div class="flex flex-col gap-2">
						<a
							href="/"
							class="rounded-lg px-4 py-2 text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
						>
							Deck Builder
						</a>
						<a href="/errata" class="rounded-lg bg-gray-700 px-4 py-2 font-semibold text-white">
							Errata & Banned
						</a>
					</div>
				</nav>
			{/if}
		</header>

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
