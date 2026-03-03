import type { ReactNode, RefObject } from 'react'

import type { PaginationAlign, PaginationPosition } from '../core/types'
import { useDraggable } from '../hooks/use-draggable'

interface PaginationOverlayProps {
	position: PaginationPosition
	align: PaginationAlign
	draggable: boolean
	containerRef: RefObject<HTMLElement | null>
	children: ReactNode
}

const JUSTIFY_BY_ALIGN: Record<PaginationAlign, 'flex-start' | 'center' | 'flex-end'> = {
	start: 'flex-start',
	center: 'center',
	end: 'flex-end',
}

export function PaginationOverlay({ position, align, draggable, containerRef, children }: PaginationOverlayProps) {
	const {
		dragRef,
		style: draggableStyle,
		onPointerDown,
	} = useDraggable({
		containerRef,
		enabled: draggable,
	})
	const gradientDirection = position === 'top' ? 'to bottom' : 'to top'

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				...(position === 'top' ? { top: 0 } : { bottom: 0 }),
				display: 'flex',
				justifyContent: JUSTIFY_BY_ALIGN[align],
				padding: '4px 8px',
				pointerEvents: 'none',
				background: `linear-gradient(${gradientDirection}, var(--rtg-overlay-gradient-start, rgba(0, 0, 0, 0.15)), transparent)`,
			}}
		>
			<div
				ref={dragRef}
				style={{
					pointerEvents: 'auto',
					...draggableStyle,
				}}
				onPointerDown={draggable ? onPointerDown : undefined}
			>
				{children}
			</div>
		</div>
	)
}
