import { useEffect, useRef } from 'react'

import { TrellisGallery } from 'react-trellis-gallery'

import { ControlPanel } from './control-panel'
import { renderExpandedItem, renderGridItem } from './sample-items'
import { usePlaygroundState } from './use-playground-state'

export default function App() {
	const state = usePlaygroundState()
	const containerRef = useRef<HTMLDivElement | null>(null)
	const containerWidthRef = useRef(state.controls.containerWidth)
	const containerHeightRef = useRef(state.controls.containerHeight)
	const setContainerWidth = state.setters.setContainerWidth
	const setContainerHeight = state.setters.setContainerHeight

	useEffect(() => {
		containerWidthRef.current = state.controls.containerWidth
		containerHeightRef.current = state.controls.containerHeight
	}, [state.controls.containerHeight, state.controls.containerWidth])

	useEffect(() => {
		const container = containerRef.current
		if (!container) return

		let rafId: number | null = null
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0]
			if (!entry) return

			let nextWidth = 0
			let nextHeight = 0
			const borderBoxSize = entry.borderBoxSize
			const borderBox = Array.isArray(borderBoxSize) ? borderBoxSize[0] : undefined
			if (borderBox) {
				nextWidth = Math.round(borderBox.inlineSize)
				nextHeight = Math.round(borderBox.blockSize)
			} else {
				// Fallback for older environments without borderBoxSize.
				const rect = container.getBoundingClientRect()
				nextWidth = Math.round(rect.width)
				nextHeight = Math.round(rect.height)
			}

			if (rafId !== null) cancelAnimationFrame(rafId)
			rafId = requestAnimationFrame(() => {
				if (nextWidth !== containerWidthRef.current) {
					containerWidthRef.current = nextWidth
					setContainerWidth(nextWidth)
				}
				if (nextHeight !== containerHeightRef.current) {
					containerHeightRef.current = nextHeight
					setContainerHeight(nextHeight)
				}
			})
		})

		observer.observe(container)
		return () => {
			observer.disconnect()
			if (rafId !== null) cancelAnimationFrame(rafId)
		}
	}, [setContainerHeight, setContainerWidth])
	const galleryProps = {
		items: state.items,
		layout: state.layoutConfig,
		gap: state.controls.gap,
		renderItem: renderGridItem,
		renderExpandedItem: renderExpandedItem,
		panelTitle: (item: (typeof state.items)[number]) => item.label,
	} as const

	return (
		<div className="app-root">
			<ControlPanel controls={state.controls} setters={state.setters} layoutInfo={state.layoutInfo} />

			<main className="preview-root">
				<div
					ref={containerRef}
					className="preview-container"
					style={{
						width: state.controls.containerWidth,
						height: state.controls.containerHeight,
					}}
				>
					{state.controls.mode === 'pagination' ? (
						<TrellisGallery {...galleryProps} mode="pagination" pagination={state.paginationConfig} />
					) : (
						<TrellisGallery {...galleryProps} mode="scroll" />
					)}
				</div>
			</main>
		</div>
	)
}
