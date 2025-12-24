/**
 * Checks if an item matches a search query with support for & (AND) and | (OR) operators
 * @param query - The search query
 * @param getSearchableText - Function that returns searchable text from the item
 * @returns True if the item matches the search query
 */
export function matchesSearch(query: string, getSearchableText: () => string[]): boolean {
	if (!query.trim()) return true;

	const queryLower = query.toLowerCase();
	const hasOperators = queryLower.includes('&') || queryLower.includes('|');

	if (hasOperators) {
		// Split by | first (OR has lower precedence)
		const orGroups = queryLower.split('|').map((orTerm) => orTerm.trim());

		// Each OR group passes if all its AND terms match
		return orGroups.some((orGroup) => {
			// Split by & (AND has higher precedence)
			const andTerms = orGroup
				.split('&')
				.map((term) => term.trim())
				.filter((t) => t);

			// All AND terms must match at least one searchable field
			return andTerms.every((term) => {
				return getSearchableText().some((text) => text.toLowerCase().includes(term));
			});
		});
	} else {
		// Simple search without operators - at least one field must match
		return getSearchableText().some((text) => text.toLowerCase().includes(queryLower));
	}
}
