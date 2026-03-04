import type { KeyboardEventHandler, MouseEventHandler } from 'react'
import { useCallback, useMemo } from 'react'
import type { CellActivationCallback, CellActivationEvent } from '../core/types'

export interface CellInteractionOptions {
	onActivate: () => void
	activationCallback?: CellActivationCallback
}

interface CellInteractionProps {
	role?: 'button'
	tabIndex?: number
	onClick?: MouseEventHandler<HTMLElement>
	onDoubleClick?: MouseEventHandler<HTMLElement>
	onKeyDown?: KeyboardEventHandler<HTMLElement>
}

const NO_INTERACTION_PROPS = {}

export function useCellInteraction({ onActivate, activationCallback }: CellInteractionOptions): CellInteractionProps {
	const handleEvent = useCallback(
		(event: CellActivationEvent) => {
			if (!activationCallback?.(event)) return
			event.preventDefault()
			onActivate()
		},
		[activationCallback, onActivate],
	)

	return useMemo(
		() =>
			activationCallback
				? {
						role: 'button' as const,
						tabIndex: 0,
						onClick: handleEvent,
						onDoubleClick: handleEvent,
						onKeyDown: handleEvent,
					}
				: NO_INTERACTION_PROPS,
		[activationCallback, handleEvent],
	)
}
