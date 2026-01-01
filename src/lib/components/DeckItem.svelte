<script lang="ts">
	import type { Card as CardType } from '$lib/data/cards';
	import IconButton from './IconButton.svelte';

	type Props = {
		cardId: string;
		count: number;
		card: CardType;
		onRemoveCard: (cardId: string) => void;
		onAddCard: (cardId: string) => void;
		onOpenModal: (cardId: string) => void;
	};

	let { cardId, count, card, onRemoveCard, onAddCard, onOpenModal }: Props = $props();

	// Determine background color based on faction
	const getFactionBackgroundColor = (faction: string): string => {
		switch (faction) {
			case 'Neutral':
				return 'bg-[#723820]/30'; // Dark brown, less opaque
			case 'Hordes of Darkness':
				return 'bg-[#3F5146]/50'; // Dark green, less opaque
			case 'Grand Alliance':
				return 'bg-[#D7DCD5]/20'; // Light gray, less opaque
			default:
				return 'bg-gray-600'; // Fallback, less opaque
		}
	};

	const factionBgColor = $derived(getFactionBackgroundColor(card.faction));

	// Determine right border color based on faction (using background colors)
	const getFactionBorderColor = (faction: string): string => {
		switch (faction) {
			case 'Neutral':
				return 'border-r-4 border-r-[#723820]'; // Dark brown
			case 'Hordes of Darkness':
				return 'border-r-4 border-r-[#3F5146]'; // Dark green
			case 'Grand Alliance':
				return 'border-r-4 border-r-[#D7DCD5]'; // Light gray
			default:
				return ''; // No border for unknown factions
		}
	};

	const factionBorderColor = $derived(getFactionBorderColor(card.faction));

	const getTypeTextColor = (cardType: string): string => {
		switch (cardType) {
			case 'Unit':
			case 'Attachment':
				return 'text-[#FC922B]'; // Gold/orange
			case 'Tactic':
				return 'text-[#C6C144]'; // Yellow
			case 'Command':
				return 'text-[#538DB2]'; // Blue
			case 'Reaction':
				return 'text-[#BD362C]'; // Red
			default:
				return 'text-white'; // Fallback
		}
	};

	const typeTextColor = $derived(getTypeTextColor(card.type));

	// Determine left border color based on card type and uniqueness
	const getBorderColor = (cardType: string, unique: boolean | undefined): string => {
		// Unique cards get orange border regardless of type
		if (unique) {
			return 'border-l-4 border-l-[#FC922B]'; // Orange
		}

		switch (cardType) {
			case 'Tactic':
				return 'border-l-4 border-l-[#C6C144]'; // Yellow
			case 'Command':
				return 'border-l-4 border-l-[#538DB2]'; // Blue
			case 'Reaction':
				return 'border-l-4 border-l-[#BD362C]'; // Red
			default:
				return 'border-l-4 border-l-transparent'; // No border for Unit/Attachment
		}
	};

	const borderColor = $derived(getBorderColor(card.type, card.unique));
</script>

<div class="flex items-center justify-between rounded {factionBgColor} {borderColor} py-1 pl-1.5">
	<div class="min-w-0 flex-1 overflow-hidden">
		<button
			class="max-w-full cursor-pointer truncate text-left text-sm font-medium text-white hover:text-blue-400 focus:text-blue-400 focus:outline-none"
			onclick={() => onOpenModal(cardId)}
			title="Click to view card image"
		>
			{card.name}
		</button>
	</div>
	<div class="ml-2 flex items-center">
		<IconButton
			icon={count === 0 ? '×' : '−'}
			variant={count === 0 ? 'danger' : 'primary'}
			size="lg"
			title={count === 0 ? 'Remove from deck' : 'Remove one copy'}
			onClick={() => onRemoveCard(cardId)}
		/>
		<span class="flex h-6 w-3 items-center justify-center text-lg text-gray-300">{count}</span>
		<IconButton
			icon="+"
			variant="primary"
			size="lg"
			title="Add one copy"
			disabled={count >= (card.maxCopies || 3)}
			onClick={() => onAddCard(cardId)}
		/>
	</div>
</div>
