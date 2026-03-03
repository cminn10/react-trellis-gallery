import type { KeyboardEventHandler } from 'react'
import { useMemo } from 'react'

interface CellInteractionProps {
	role: 'button'
	tabIndex: number
	onDoubleClick: () => void
	onKeyDown: KeyboardEventHandler<HTMLElement>
}

export function useCellInteraction(onActivate: () => void): CellInteractionProps {
	return useMemo(
		() => ({
			role: 'button' as const,
			tabIndex: 0,
			onDoubleClick: onActivate,
			onKeyDown: (event) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					onActivate()
				}
			},
		}),
		[onActivate],
	)
}
