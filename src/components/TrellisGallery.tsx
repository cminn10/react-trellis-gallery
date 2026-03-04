import { type CSSProperties, memo, useCallback, useImperativeHandle, useMemo } from 'react'
import { useGridRef } from 'react-window'
import { TrellisPaginationProvider } from '../context/trellis-pagination-context'
import {
	DEFAULT_CELL_INDICATOR,
	DEFAULT_GAP,
	DEFAULT_OVERSCAN_COUNT,
	DEFAULT_PAGINATION_ALIGN,
	DEFAULT_PAGINATION_POSITION,
} from '../core/constants'
import type { ItemMatchCallback, TrellisGalleryHandle, TrellisGalleryProps } from '../core/types'
import { useTrellisGallery } from '../hooks/use-trellis-gallery'
import { useTrellisHighlight } from '../hooks/use-trellis-highlight'
import { DefaultPagination } from './DefaultPagination'
import { GridRenderer } from './GridRenderer'
import { OverlayManager } from './OverlayManager'
import { PaginationOverlay } from './PaginationOverlay'

const MemoizedOverlayManager = memo(OverlayManager) as typeof OverlayManager
const RTG_HIGHLIGHT_COLOR = 'var(--rtg-highlight-color, #0078d4)'
const RTG_HIGHLIGHT_DURATION = 'var(--rtg-highlight-duration-ms, 1200ms)'
const RTG_HIGHLIGHT_EASING = 'ease-in-out'
const RTG_BORDER_RADIUS = 'var(--rtg-border-radius, 10px)'
const RTG_CELL_BORDER_COLOR = 'var(--rtg-cell-border-color, rgba(0, 0, 0, 0.15))'
const RTG_CELL_BORDER_COLOR_ACTIVE = 'var(--rtg-cell-border-color, rgba(0, 0, 0, 0.25))'
const CELL_INTERACTION_STYLES = `
[data-rtg-cell] { position: relative; isolation: isolate; }
[data-rtg-cell]::before {
	content: '';
	position: absolute;
	inset: 0;
	border-radius: ${RTG_BORDER_RADIUS};
	pointer-events: none;
	opacity: 0;
	box-shadow: 0 0 0 2px ${RTG_HIGHLIGHT_COLOR};
	transition: opacity ${RTG_HIGHLIGHT_DURATION} ${RTG_HIGHLIGHT_EASING};
	z-index: 1;
}
[data-rtg-cell]::after {
	content: '';
	position: absolute;
	inset: 0;
	border: 1px solid ${RTG_CELL_BORDER_COLOR};
	border-radius: ${RTG_BORDER_RADIUS};
	opacity: 0;
	pointer-events: none;
	transition: opacity 150ms ease;
	z-index: 2;
}
[data-rtg-cell] [data-rtg-indicator-trigger] {
	opacity: 0;
	pointer-events: none;
	transition: opacity 150ms ease;
	z-index: 3;
}
[data-rtg-cell]:hover [data-rtg-indicator-trigger],
[data-rtg-cell]:focus-within [data-rtg-indicator-trigger] { opacity: 1; pointer-events: auto; }
[data-rtg-cell] [data-rtg-indicator-trigger]:hover,
[data-rtg-cell] [data-rtg-indicator-trigger]:focus-visible {
	filter: contrast(1.08) saturate(1.08);
	border-color: ${RTG_CELL_BORDER_COLOR_ACTIVE};
}
[data-rtg-cell]:hover::after,
[data-rtg-cell]:focus-within::after { opacity: 1; }
[data-rtg-cell][data-rtg-highlighted]::before {
	opacity: 1;
}
[data-rtg-cell][data-rtg-highlighted]::after {
	opacity: 0 !important;
}
`

export function TrellisGallery<T>({ ref, ...props }: TrellisGalleryProps<T>) {
	const paginationConfig = props.mode === 'pagination' ? props.pagination : null
	const gap = props.gap ?? DEFAULT_GAP
	const overscanCount = props.overscanCount ?? DEFAULT_OVERSCAN_COUNT
	const renderControl = paginationConfig?.renderControl
	const paginationPosition = paginationConfig?.position ?? DEFAULT_PAGINATION_POSITION
	const paginationAlign = paginationConfig?.align ?? DEFAULT_PAGINATION_ALIGN
	const paginationDraggable = paginationConfig?.draggable ?? false
	const paginationLabel = paginationConfig?.label
	const gridRef = useGridRef(null)
	const resolvedIndicatorConfig = useMemo(() => {
		if (props.cellIndicator === false) return false
		return props.cellIndicator ?? DEFAULT_CELL_INDICATOR
	}, [props.cellIndicator])
	const onPanelOpen = useCallback(
		(itemIndex: number) => {
			const item = props.items[itemIndex]
			if (item === undefined) return
			props.onPanelOpen?.(item, itemIndex)
		},
		[props.items, props.onPanelOpen],
	)

	const onPanelClose = useCallback(
		(itemIndex: number) => {
			const item = props.items[itemIndex]
			if (item === undefined) return
			props.onPanelClose?.(item, itemIndex)
		},
		[props.items, props.onPanelClose],
	)

	const { containerRef, layout, pagination, panels } = useTrellisGallery({
		items: props.items,
		mode: props.mode,
		layout: props.layout,
		gap,
		overscanCount,
		pagination: paginationConfig ?? undefined,
		onPanelOpen,
		onPanelClose,
	})
	const navigateToIndex = useCallback(
		(targetIndex: number) => {
			if (pagination.enabled) {
				if (pagination.itemsPerPage <= 0) {
					pagination.goToPage(0)
					return
				}

				const page = Math.floor(targetIndex / pagination.itemsPerPage)
				pagination.goToPage(page)
				return
			}

			const cols = Math.max(1, layout.cols)
			gridRef.current?.scrollToCell({
				rowIndex: Math.floor(targetIndex / cols),
				columnIndex: targetIndex % cols,
				rowAlign: 'center',
				columnAlign: 'center',
				behavior: 'smooth',
			})
		},
		[gridRef, layout.cols, pagination.enabled, pagination.goToPage, pagination.itemsPerPage],
	)
	const highlight = useTrellisHighlight<T>({
		items: props.items,
		itemsPerPage: pagination.itemsPerPage,
		navigate: navigateToIndex,
		defaultDuration: props.highlightDuration,
	})
	const openPanelsByCallback = useCallback(
		(callback: ItemMatchCallback<T>) => {
			for (const [index, item] of props.items.entries()) {
				if (!callback(item) || panels.isOpen(index)) continue
				panels.open(index)
			}
		},
		[panels, props.items],
	)
	const closePanelsByCallback = useCallback(
		(callback: ItemMatchCallback<T>) => {
			for (const panel of panels.openPanels) {
				const item = props.items[panel.itemIndex]
				if (item === undefined || !callback(item)) continue
				panels.close(panel.id)
			}
		},
		[panels, props.items],
	)
	const isAnyPanelOpenByCallback = useCallback(
		(callback: ItemMatchCallback<T>) => {
			for (const [index, item] of props.items.entries()) {
				if (callback(item) && panels.isOpen(index)) return true
			}
			return false
		},
		[panels, props.items],
	)
	useImperativeHandle<TrellisGalleryHandle<T> | null, TrellisGalleryHandle<T> | null>(
		ref,
		() => ({
			panels: {
				open: openPanelsByCallback,
				close: closePanelsByCallback,
				closeAll: panels.closeAll,
				closeUnpinned: panels.closeUnpinned,
				isOpen: isAnyPanelOpenByCallback,
				openPanels: panels.openPanels,
			},
			goToItem: highlight.goToItem,
			clearHighlights: highlight.clearHighlights,
		}),
		[
			closePanelsByCallback,
			highlight.clearHighlights,
			highlight.goToItem,
			isAnyPanelOpenByCallback,
			openPanelsByCallback,
			panels.closeAll,
			panels.closeUnpinned,
			panels.openPanels,
		],
	)
	const showPagination = pagination.enabled && pagination.totalPages > 1

	return (
		<TrellisPaginationProvider value={pagination}>
			<div
				ref={containerRef}
				className={props.className}
				style={
					{
						position: 'relative',
						width: '100%',
						height: '100%',
						overflow: 'hidden',
						...(props.highlightColor !== undefined && { '--rtg-highlight-color': props.highlightColor }),
						...props.style,
					} as CSSProperties
				}
			>
				<style data-rtg-styles>{CELL_INTERACTION_STYLES}</style>

				<GridRenderer
					activationCallback={props.cellActivation}
					gridRef={gridRef}
					highlightClassName={props.highlightClassName}
					highlightEpoch={highlight.highlightEpoch}
					highlightedIndices={highlight.highlightedIndices}
					indicatorConfig={resolvedIndicatorConfig}
					items={props.items}
					layout={layout}
					mode={props.mode}
					onCellActivate={panels.open}
					overscanCount={overscanCount}
					renderItem={props.renderItem}
					style={{ width: '100%', height: '100%' }}
					gap={gap}
				/>

				{showPagination ? (
					renderControl === false ? null : typeof renderControl === 'function' ? (
						renderControl(pagination)
					) : (
						<PaginationOverlay
							align={paginationAlign}
							containerRef={containerRef}
							draggable={paginationDraggable}
							position={paginationPosition}
						>
							<DefaultPagination label={paginationLabel} />
						</PaginationOverlay>
					)
				) : null}

				<MemoizedOverlayManager
					boundaryRef={containerRef}
					items={props.items}
					panelDefaults={props.panelDefaults}
					panels={panels}
					renderContent={props.renderExpandedItem}
					renderTitle={props.panelTitle}
					renderHeader={props.renderPanelHeader}
				/>
			</div>
		</TrellisPaginationProvider>
	)
}
