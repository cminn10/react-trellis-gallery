import { useCallback, useEffect, useRef, useState } from 'react'

import {
	type CellActivationEvent,
	type GoToItemResult,
	TrellisGallery,
	type TrellisGalleryHandle,
} from 'react-trellis-gallery'

import { ControlPanel } from './control-panel'
import { renderExpandedItem, renderGridItem } from './sample-items'
import { buildMatchCallback, usePlaygroundState } from './use-playground-state'

export default function App() {
	const state = usePlaygroundState()
	const galleryRef = useRef<TrellisGalleryHandle<(typeof state.items)[number]> | null>(null)
	const [indicatorEnabled, setIndicatorEnabled] = useState(true)
	const [searchResult, setSearchResult] = useState<GoToItemResult | null>(null)
	const containerRef = useRef<HTMLDivElement | null>(null)
	const containerWidthRef = useRef(state.controls.containerWidth)
	const containerHeightRef = useRef(state.controls.containerHeight)
	const setContainerWidth = state.setters.setContainerWidth
	const setContainerHeight = state.setters.setContainerHeight
	const openItem1 = useCallback(() => {
		galleryRef.current?.panels.open((item) => item.id === 1)
	}, [])
	const openFirst3 = useCallback(() => {
		galleryRef.current?.panels.open((item) => item.id <= 3)
	}, [])
	const closeAllPanels = useCallback(() => {
		galleryRef.current?.panels.closeAll()
	}, [])
	const goToItem = useCallback(
		(
			field: (typeof state.controls)['searchField'],
			operator: (typeof state.controls)['searchOperator'],
			value: string,
			duration: number,
		) => {
			const matchCallback = buildMatchCallback(field, operator, value)
			if (!matchCallback) {
				setSearchResult(null)
				return
			}
			const result = galleryRef.current?.goToItem(matchCallback, { highlightDuration: duration })
			setSearchResult(result ?? null)
		},
		[],
	)
	const clearHighlights = useCallback(() => {
		galleryRef.current?.clearHighlights()
		setSearchResult(null)
	}, [])
	const activationCallback = useCallback((event: CellActivationEvent) => {
		if (event.type === 'dblclick') return true
		return event.type === 'click' && event.shiftKey
	}, [])

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
		highlightColor: state.controls.highlightColor,
		renderItem: renderGridItem,
		renderExpandedItem: renderExpandedItem,
		panelTitle: (item: (typeof state.items)[number]) => item.label,
		cellActivation: activationCallback,
		cellIndicator: indicatorEnabled
			? {
					borderColor: 'oklch(0.709 0.01 56.259 / 55%)',
					triangleColor: 'oklch(0.923 0.003 48.717)',
					triangleSize: 20,
				}
			: false,
	} as const

	return (
		<div className="app-root">
			<nav className="top-links">
				<a
					href="https://github.com/cminn10/react-trellis-gallery"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub"
					className="top-link"
				>
					<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" role="img">
						<title>GitHub</title>
						<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
					</svg>
				</a>
				<a
					href="https://www.npmjs.com/package/react-trellis-gallery"
					target="_blank"
					rel="noopener noreferrer"
					aria-label="npm"
					className="top-link"
				>
					<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" role="img">
						<title>npm</title>
						<path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323h13.837v13.548h-3.464V8.691h-3.367v10.18H5.13z" />
					</svg>
				</a>
			</nav>

			<ControlPanel
				controls={state.controls}
				setters={state.setters}
				layoutInfo={state.layoutInfo}
				indicatorEnabled={indicatorEnabled}
				onIndicatorChange={setIndicatorEnabled}
				onOpenItem1={openItem1}
				onOpenFirst3={openFirst3}
				onCloseAll={closeAllPanels}
				onGoToItem={goToItem}
				onClearHighlights={clearHighlights}
				searchResult={searchResult}
			/>

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
						<TrellisGallery {...galleryProps} mode="pagination" pagination={state.paginationConfig} ref={galleryRef} />
					) : (
						<TrellisGallery {...galleryProps} mode="scroll" ref={galleryRef} />
					)}
				</div>
			</main>
		</div>
	)
}
