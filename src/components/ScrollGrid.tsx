import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { memo, useMemo } from 'react'
import { type CellComponentProps, Grid, useGridRef } from 'react-window'

import type { LayoutResult } from '../core/types'
import { useCellInteraction } from '../hooks/use-cell-interaction'

interface ScrollCellData {
	items: unknown[]
	itemCount: number
	cols: number
	rowCount: number
	gap: number
	renderItem: (item: unknown, index: number) => ReactNode
	onItemDoubleClick: (index: number) => void
}

function ScrollCellBase({
	ariaAttributes,
	columnIndex,
	rowIndex,
	style,
	items,
	itemCount,
	cols,
	rowCount,
	gap,
	renderItem,
	onItemDoubleClick,
}: CellComponentProps<ScrollCellData>): ReactElement | null {
	const index = rowIndex * cols + columnIndex
	const openItem = () => onItemDoubleClick(index)
	const interactionProps = useCellInteraction(openItem)
	if (index >= itemCount) return null
	const isLastColumn = columnIndex === cols - 1
	const isLastRow = rowIndex === rowCount - 1

	return (
		<div
			{...ariaAttributes}
			{...interactionProps}
			style={{
				...style,
				overflow: 'hidden',
				background: 'transparent',
				boxSizing: 'border-box',
				paddingRight: isLastColumn ? 0 : gap,
				paddingBottom: isLastRow ? 0 : gap,
			}}
		>
			{renderItem(items[index], index)}
		</div>
	)
}

const ScrollCell = memo(ScrollCellBase) as (props: CellComponentProps<ScrollCellData>) => ReactElement | null

export interface ScrollGridProps<T> {
	items: T[]
	layout: LayoutResult
	gap: number
	overscanCount: number
	className?: string
	style?: CSSProperties
	renderItem: (item: T, index: number) => ReactNode
	onItemDoubleClick: (index: number) => void
}

export function ScrollGrid<T>({
	items,
	layout,
	gap,
	overscanCount,
	className,
	style,
	renderItem,
	onItemDoubleClick,
}: ScrollGridProps<T>) {
	const gridRef = useGridRef(null)
	const resolvedGap = Math.max(0, gap)

	const cols = Math.max(1, layout.cols)
	const rowCount = Math.ceil(items.length / cols)
	const cellProps = useMemo<ScrollCellData>(
		() => ({
			items: items as unknown[],
			itemCount: items.length,
			cols,
			rowCount,
			gap: resolvedGap,
			renderItem: renderItem as (item: unknown, index: number) => ReactNode,
			onItemDoubleClick,
		}),
		[items, cols, rowCount, resolvedGap, renderItem, onItemDoubleClick],
	)
	const columnWidth = useMemo(() => {
		return (columnIndex: number) => layout.cellWidth + (columnIndex < cols - 1 ? resolvedGap : 0)
	}, [layout.cellWidth, cols, resolvedGap])
	const rowHeight = useMemo(() => {
		return (rowIndex: number) => layout.cellHeight + (rowIndex < rowCount - 1 ? resolvedGap : 0)
	}, [layout.cellHeight, rowCount, resolvedGap])

	if (layout.cellWidth <= 0 || layout.cellHeight <= 0 || rowCount <= 0) return null

	return (
		<Grid
			cellComponent={ScrollCell}
			cellProps={cellProps}
			className={className}
			columnCount={cols}
			columnWidth={columnWidth}
			gridRef={gridRef}
			overscanCount={overscanCount}
			rowCount={rowCount}
			rowHeight={rowHeight}
			style={{
				width: '100%',
				height: '100%',
				background: 'transparent',
				...style,
			}}
		/>
	)
}
