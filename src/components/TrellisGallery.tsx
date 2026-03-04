import { memo, useCallback, useImperativeHandle, useMemo } from 'react'
import { TrellisPaginationProvider } from '../context/trellis-pagination-context'
import {
	DEFAULT_CELL_INDICATOR,
	DEFAULT_GAP,
	DEFAULT_OVERSCAN_COUNT,
	DEFAULT_PAGINATION_ALIGN,
	DEFAULT_PAGINATION_POSITION,
} from '../core/constants'
import type { TrellisGalleryHandle, TrellisGalleryProps } from '../core/types'
import { useTrellisGallery } from '../hooks/use-trellis-gallery'
import { DefaultPagination } from './DefaultPagination'
import { GridRenderer } from './GridRenderer'
import { OverlayManager } from './OverlayManager'
import { PaginationOverlay } from './PaginationOverlay'

const MemoizedOverlayManager = memo(OverlayManager) as typeof OverlayManager
const CELL_INTERACTION_STYLES = `
[data-rtg-cell] { position: relative; isolation: isolate; }
[data-rtg-cell]::after {
	content: '';
	position: absolute;
	inset: 0;
	border: 1px solid var(--rtg-cell-border-color, rgba(0, 0, 0, 0.15));
	border-radius: var(--rtg-border-radius, 10px);
	opacity: 0;
	pointer-events: none;
	transition: opacity 150ms ease;
	z-index: 1;
}
[data-rtg-cell] [data-rtg-indicator-trigger] {
	opacity: 0;
	pointer-events: none;
	transition: opacity 150ms ease;
	z-index: 2;
}
[data-rtg-cell]:hover [data-rtg-indicator-trigger],
[data-rtg-cell]:focus-within [data-rtg-indicator-trigger] { opacity: 1; pointer-events: auto; }
[data-rtg-cell] [data-rtg-indicator-trigger]:hover,
[data-rtg-cell] [data-rtg-indicator-trigger]:focus-visible {
	filter: contrast(1.08) saturate(1.08);
	border-color: var(--rtg-cell-border-color, rgba(0, 0, 0, 0.25));
}
[data-rtg-cell]:hover::after,
[data-rtg-cell]:focus-within::after { opacity: 1; }
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
	const openPanelsByPredicate = useCallback(
		(predicate: (item: T) => boolean) => {
			for (const [index, item] of props.items.entries()) {
				if (!predicate(item) || panels.isOpen(index)) continue
				panels.open(index)
			}
		},
		[panels, props.items],
	)
	const closePanelsByPredicate = useCallback(
		(predicate: (item: T) => boolean) => {
			for (const panel of panels.openPanels) {
				const item = props.items[panel.itemIndex]
				if (item === undefined || !predicate(item)) continue
				panels.close(panel.id)
			}
		},
		[panels, props.items],
	)
	const isAnyPanelOpenByPredicate = useCallback(
		(predicate: (item: T) => boolean) => {
			for (const [index, item] of props.items.entries()) {
				if (predicate(item) && panels.isOpen(index)) return true
			}
			return false
		},
		[panels, props.items],
	)
	useImperativeHandle<TrellisGalleryHandle<T> | null, TrellisGalleryHandle<T> | null>(
		ref,
		() => ({
			panels: {
				open: openPanelsByPredicate,
				close: closePanelsByPredicate,
				closeAll: panels.closeAll,
				closeUnpinned: panels.closeUnpinned,
				isOpen: isAnyPanelOpenByPredicate,
				openPanels: panels.openPanels,
			},
		}),
		[
			closePanelsByPredicate,
			isAnyPanelOpenByPredicate,
			openPanelsByPredicate,
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
				style={{
					position: 'relative',
					width: '100%',
					height: '100%',
					overflow: 'hidden',
					...props.style,
				}}
			>
				<style data-rtg-styles>{CELL_INTERACTION_STYLES}</style>

				<GridRenderer
					activationPredicate={props.cellActivation}
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
