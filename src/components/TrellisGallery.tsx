import { memo, useCallback } from 'react'
import { TrellisPaginationProvider } from '../context/trellis-pagination-context'
import {
	DEFAULT_GAP,
	DEFAULT_OVERSCAN_COUNT,
	DEFAULT_PAGINATION_ALIGN,
	DEFAULT_PAGINATION_POSITION,
} from '../core/constants'
import type { TrellisGalleryProps } from '../core/types'
import { useTrellisGallery } from '../hooks/use-trellis-gallery'
import { DefaultPagination } from './DefaultPagination'
import { GridRenderer } from './GridRenderer'
import { OverlayManager } from './OverlayManager'
import { PaginationOverlay } from './PaginationOverlay'

const MemoizedOverlayManager = memo(OverlayManager) as typeof OverlayManager

export function TrellisGallery<T>(props: TrellisGalleryProps<T>) {
	const paginationConfig = props.mode === 'pagination' ? props.pagination : null
	const renderControl = paginationConfig?.renderControl
	const paginationPosition = paginationConfig?.position ?? DEFAULT_PAGINATION_POSITION
	const paginationAlign = paginationConfig?.align ?? DEFAULT_PAGINATION_ALIGN
	const paginationDraggable = paginationConfig?.draggable ?? false
	const paginationLabel = paginationConfig?.label
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
		gap: props.gap ?? DEFAULT_GAP,
		overscanCount: props.overscanCount ?? DEFAULT_OVERSCAN_COUNT,
		pagination: paginationConfig ?? undefined,
		onPanelOpen,
		onPanelClose,
	})
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
				<GridRenderer
					items={props.items}
					layout={layout}
					mode={props.mode}
					onItemDoubleClick={panels.open}
					overscanCount={props.overscanCount ?? DEFAULT_OVERSCAN_COUNT}
					renderItem={props.renderItem}
					style={{ width: '100%', height: '100%' }}
					gap={props.gap ?? DEFAULT_GAP}
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
