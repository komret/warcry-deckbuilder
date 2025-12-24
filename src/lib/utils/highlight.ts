/**
 * Highlights search terms in text with support for & (AND) and | (OR) operators
 * @param text - The text to highlight (can be plain text or HTML)
 * @param query - The search query
 * @returns Text with highlighted matches wrapped in <mark> tags
 */
export function highlightSearchTerms(text: string, query: string): string {
	if (!query.trim()) return text;

	// Parse search query for operators
	const hasOperators = query.includes('&') || query.includes('|');

	if (hasOperators) {
		// Split by | first (OR has lower precedence)
		const orGroups = query.split('|').map((orTerm) => orTerm.trim());

		// Collect all unique search terms
		const allTerms = new Set<string>();
		orGroups.forEach((orGroup) => {
			const andTerms = orGroup
				.split('&')
				.map((term) => term.trim())
				.filter((t) => t);
			andTerms.forEach((term) => allTerms.add(term));
		});

		// Highlight all terms
		let result = text;
		allTerms.forEach((term) => {
			const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			const regex = new RegExp(`(${escapedTerm})`, 'gi');
			result = result.replace(regex, '<mark class="bg-yellow-300 text-gray-900">$1</mark>');
		});
		return result;
	} else {
		// Simple search - highlight the query
		const escapedQuery = query.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const regex = new RegExp(`(${escapedQuery})`, 'gi');
		return text.replace(regex, '<mark class="bg-yellow-300 text-gray-900">$1</mark>');
	}
}
