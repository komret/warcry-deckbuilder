<script lang="ts">
	import { faq, type FAQ } from '$lib/data/faq';
	import Header from '$lib/components/Header.svelte';
	import SearchInput from '$lib/components/SearchInput.svelte';
	import { highlightSearchTerms } from '$lib/utils/highlight';

	let searchQuery = $state('');

	// Filter FAQs based on search query
	const filteredFAQs = $derived.by(() => {
		if (!searchQuery.trim()) return faq;

		const query = searchQuery.toLowerCase();
		const hasOperators = query.includes('&') || query.includes('|');

		return faq.filter((item) => {
			if (hasOperators) {
				// Split by | first (OR has lower precedence)
				const orGroups = query.split('|').map((orTerm) => orTerm.trim());

				// Each OR group passes if all its AND terms match
				const orGroupMatches = orGroups.some((orGroup) => {
					// Split by & (AND has higher precedence)
					const andTerms = orGroup
						.split('&')
						.map((term) => term.trim())
						.filter((t) => t);

					// All AND terms must match
					return andTerms.every((term) => {
						const questionMatch = item.question.toLowerCase().includes(term);
						const answerMatch = item.answer.toLowerCase().includes(term);
						return questionMatch || answerMatch;
					});
				});

				return orGroupMatches;
			} else {
				// Simple search without operators
				const questionMatch = item.question.toLowerCase().includes(query);
				const answerMatch = item.answer.toLowerCase().includes(query);
				return questionMatch || answerMatch;
			}
		});
	});
</script>

<div class="min-h-screen bg-gray-900 text-white">
	<div class="mx-auto max-w-7xl px-4 py-8">
		<Header currentPage="faq" />

		<!-- Search Bar -->
		<div class="mb-6">
			<SearchInput bind:value={searchQuery} placeholder="Search FAQ (use & for AND, | for OR)..." />
			{#if searchQuery}
				<p class="mt-2 text-sm text-gray-400">
					Found {filteredFAQs.length} result{filteredFAQs.length !== 1 ? 's' : ''}
				</p>
			{/if}
		</div>

		<!-- FAQ List -->
		<div class="space-y-6">
			{#each filteredFAQs as item (item.id)}
				<article class="rounded-lg border border-gray-700 bg-gray-800 p-6">
					<h2 class="mb-3 text-lg font-semibold text-blue-400">
						{@html highlightSearchTerms(item.question, searchQuery)}
					</h2>
					<div class="relative">
						<p class="pr-8 text-gray-300">
							{@html highlightSearchTerms(item.answer, searchQuery)}
						</p>
						<a
							href={item.source}
							target="_blank"
							rel="noopener noreferrer"
							class="absolute right-0 bottom-0 text-gray-500 hover:text-blue-400"
							aria-label="View source"
						>
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
						</a>
					</div>
				</article>
			{/each}
		</div>

		{#if filteredFAQs.length === 0}
			<div class="text-center text-gray-400">
				<p>No FAQs found matching your search.</p>
			</div>
		{/if}
	</div>
</div>
