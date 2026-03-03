import type { CSSProperties, PointerEvent as ReactPointerEvent, RefObject } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Position {
	x: number
	y: number
}

interface UseDraggableOptions {
	containerRef: RefObject<HTMLElement | null>
	enabled: boolean
}

interface DragState {
	pointerId: number
	startClientX: number
	startClientY: number
	startX: number
	startY: number
	minX: number
	maxX: number
	minY: number
	maxY: number
}

export interface UseDraggableResult {
	dragRef: RefObject<HTMLDivElement | null>
	style: CSSProperties
	isDragging: boolean
	onPointerDown: (event: ReactPointerEvent<HTMLDivElement>) => void
}

const ZERO_POSITION: Position = { x: 0, y: 0 }

function isInteractiveTarget(target: EventTarget | null): boolean {
	if (!(target instanceof Element)) return false
	return Boolean(target.closest('button, input, textarea, select, option, a, [contenteditable="true"]'))
}

export function useDraggable({ containerRef, enabled }: UseDraggableOptions): UseDraggableResult {
	const dragRef = useRef<HTMLDivElement>(null)
	const dragStateRef = useRef<DragState | null>(null)
	const positionRef = useRef<Position>(ZERO_POSITION)
	const [isDragging, setIsDragging] = useState(false)

	const applyTransform = useCallback((position: Position) => {
		const draggable = dragRef.current
		if (!draggable) return
		draggable.style.transform = `translate(${position.x}px, ${position.y}px)`
	}, [])

	const onPointerDown = useCallback(
		(event: ReactPointerEvent<HTMLDivElement>) => {
			if (!enabled || event.button !== 0) return
			if (isInteractiveTarget(event.target)) return

			const container = containerRef.current
			const draggable = dragRef.current
			if (!container || !draggable) return

			const containerRect = container.getBoundingClientRect()
			const dragRect = draggable.getBoundingClientRect()

			const startPosition = positionRef.current
			const baseLeft = dragRect.left - startPosition.x
			const baseTop = dragRect.top - startPosition.y
			const minX = containerRect.left - baseLeft
			const maxX = containerRect.right - baseLeft - dragRect.width
			const minY = containerRect.top - baseTop
			const maxY = containerRect.bottom - baseTop - dragRect.height

			dragStateRef.current = {
				pointerId: event.pointerId,
				startClientX: event.clientX,
				startClientY: event.clientY,
				startX: startPosition.x,
				startY: startPosition.y,
				minX,
				maxX,
				minY,
				maxY,
			}
			draggable.setPointerCapture(event.pointerId)
			setIsDragging(true)
			event.preventDefault()
		},
		[containerRef, enabled],
	)

	useEffect(() => {
		if (!enabled) {
			dragStateRef.current = null
			positionRef.current = ZERO_POSITION
			setIsDragging(false)
			const draggable = dragRef.current
			if (draggable) draggable.style.transform = 'translate(0px, 0px)'
		}
	}, [enabled])

	useEffect(() => {
		if (!enabled || !isDragging) return

		const onPointerMove = (event: PointerEvent) => {
			const dragState = dragStateRef.current
			if (!dragState || dragState.pointerId !== event.pointerId) return

			const deltaX = event.clientX - dragState.startClientX
			const deltaY = event.clientY - dragState.startClientY
			const next = {
				x: Math.min(Math.max(dragState.startX + deltaX, dragState.minX), dragState.maxX),
				y: Math.min(Math.max(dragState.startY + deltaY, dragState.minY), dragState.maxY),
			}
			positionRef.current = next
			applyTransform(next)
		}

		const onPointerEnd = (event: PointerEvent) => {
			const dragState = dragStateRef.current
			if (!dragState || dragState.pointerId !== event.pointerId) return

			const draggable = dragRef.current
			if (draggable?.hasPointerCapture(event.pointerId)) {
				draggable.releasePointerCapture(event.pointerId)
			}

			dragStateRef.current = null
			setIsDragging(false)
		}

		window.addEventListener('pointermove', onPointerMove)
		window.addEventListener('pointerup', onPointerEnd)
		window.addEventListener('pointercancel', onPointerEnd)

		return () => {
			window.removeEventListener('pointermove', onPointerMove)
			window.removeEventListener('pointerup', onPointerEnd)
			window.removeEventListener('pointercancel', onPointerEnd)
		}
	}, [applyTransform, enabled, isDragging])

	const style: CSSProperties = {
		transform: `translate(${positionRef.current.x}px, ${positionRef.current.y}px)`,
		touchAction: enabled ? 'none' : undefined,
		cursor: enabled ? (isDragging ? 'grabbing' : 'grab') : undefined,
	}

	return {
		dragRef,
		style,
		isDragging,
		onPointerDown,
	}
}
