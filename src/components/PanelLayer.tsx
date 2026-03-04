import type { ReactNode, RefObject } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { PANEL_CASCADE_OFFSET, RTG_PANEL_CSS_VARS } from '../core/constants'
import type { FloatingPanelDefaults, PanelHeaderAPI, PanelState, Point } from '../core/types'
import { FloatingPanel } from './FloatingPanel'

interface PanelLayerProps<T> {
	orderedPanels: PanelState[]
	items: T[]
	containerRef: RefObject<HTMLElement | null>
	panelBoundary: 'viewport' | RefObject<HTMLElement | null>
	defaults: FloatingPanelDefaults
	renderContent: (item: T, index: number) => ReactNode
	renderTitle?: (item: T, index: number) => ReactNode
	renderHeader?: (item: T, api: PanelHeaderAPI) => ReactNode
	onActivate: (id: string) => void
	onClose: (id: string) => void
	onTogglePin: (id: string) => void
}

export function PanelLayer<T>({
	orderedPanels,
	items,
	containerRef,
	panelBoundary,
	defaults,
	renderContent,
	renderTitle,
	renderHeader,
	onActivate,
	onClose,
	onTogglePin,
}: PanelLayerProps<T>) {
	const layerRef = useRef<HTMLDivElement>(null)
	const boundaryRect = useMemo(() => {
		if (typeof window === 'undefined') {
			return { x: 0, y: 0, width: 0, height: 0 }
		}
		if (panelBoundary === 'viewport') {
			return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
		}
		const boundaryEl = panelBoundary.current ?? containerRef.current
		if (!boundaryEl) {
			return { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight }
		}
		const rect = boundaryEl.getBoundingClientRect()
		return { x: rect.x, y: rect.y, width: rect.width, height: rect.height }
	}, [containerRef, panelBoundary])
	const getBoundaryEl = useMemo(() => {
		if (panelBoundary === 'viewport') return undefined
		return () => panelBoundary.current
	}, [panelBoundary])

	useEffect(() => {
		const layer = layerRef.current
		const source = containerRef.current
		if (!layer || !source || typeof window === 'undefined') return
		const sourceStyle = window.getComputedStyle(source)
		for (const variable of RTG_PANEL_CSS_VARS) {
			const value = sourceStyle.getPropertyValue(variable)
			if (value) layer.style.setProperty(variable, value)
		}
	}, [containerRef])

	if (typeof document === 'undefined') return null

	return createPortal(
		<div
			ref={layerRef}
			data-rtg-panel-layer
			style={{
				position: 'fixed',
				inset: 0,
				pointerEvents: 'none',
				zIndex: 9999,
			}}
		>
			{orderedPanels.map((panel, stackIndex) => {
				const item = items[panel.itemIndex]
				if (item === undefined) return null
				const offset = stackIndex * PANEL_CASCADE_OFFSET
				const defaultPosition: Point = {
					x: boundaryRect.x + Math.max(16, (boundaryRect.width - defaults.size.width) / 2) + offset,
					y: boundaryRect.y + Math.max(16, (boundaryRect.height - defaults.size.height) / 2) + offset,
				}

				return (
					<FloatingPanel
						key={panel.id}
						defaultSize={defaults.size}
						defaultPosition={defaultPosition}
						getBoundaryEl={getBoundaryEl}
						item={item}
						itemIndex={panel.itemIndex}
						maxSize={defaults.maxSize}
						minSize={defaults.minSize}
						onActivate={onActivate}
						onClose={onClose}
						onTogglePin={onTogglePin}
						panelId={panel.id}
						pinned={panel.pinned}
						renderContent={renderContent}
						renderHeader={renderHeader}
						renderTitle={renderTitle}
					/>
				)
			})}
		</div>,
		document.body,
	)
}
