import type { KeyboardEventHandler, MouseEventHandler } from 'react'
import { useCallback, useMemo } from 'react'
import type { CellActivationEvent, CellActivationPredicate } from '../core/types'

export interface CellInteractionOptions {
	onActivate: () => void
	activationPredicate?: CellActivationPredicate
}

interface CellInteractionProps {
	role?: 'button'
	tabIndex?: number
	onClick?: MouseEventHandler<HTMLElement>
	onDoubleClick?: MouseEventHandler<HTMLElement>
	onKeyDown?: KeyboardEventHandler<HTMLElement>
}

const NO_INTERACTION_PROPS = {}

export function useCellInteraction({ onActivate, activationPredicate }: CellInteractionOptions): CellInteractionProps {
	const handleEvent = useCallback(
		(event: CellActivationEvent) => {
			if (!activationPredicate?.(event)) return
			event.preventDefault()
			onActivate()
		},
		[activationPredicate, onActivate],
	)

	return useMemo(
		() =>
			activationPredicate
				? {
						role: 'button' as const,
						tabIndex: 0,
						onClick: handleEvent,
						onDoubleClick: handleEvent,
						onKeyDown: handleEvent,
					}
				: NO_INTERACTION_PROPS,
		[activationPredicate, handleEvent],
	)
}
