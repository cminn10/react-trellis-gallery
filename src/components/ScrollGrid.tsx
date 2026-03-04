import type { CSSProperties, ReactElement, ReactNode, RefObject } from 'react'
import { memo, useMemo, useRef } from 'react'
import { type CellComponentProps, Grid, type GridImperativeAPI } from 'react-window'

import type { CellActivationPredicate, CellIndicatorConfig, LayoutResult } from '../core/types'
import { CellContent } from './CellContent'

const EMPTY_SET: ReadonlySet<number> = new Set()

interface ScrollCellData {
	items: unknown[]
	itemCount: number
	cols: number
	rowCount: number
	gap: number
	renderItem: (item: unknown, index: number) => ReactNode
	onCellActivate: (index: number) => void
	activationPredicate?: CellActivationPredicate
	indicatorConfig: false | CellIndicatorConfig
	highlightSetRef: RefObject<ReadonlySet<number>>
	highlightClassName?: string
	highlightEpoch: number
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
	onCellActivate,
	activationPredicate,
	indicatorConfig,
	highlightSetRef,
	highlightClassName,
}: CellComponentProps<ScrollCellData>): ReactElement | null {
	const index = rowIndex * cols + columnIndex
	if (index >= itemCount) return null
	const isLastColumn = columnIndex === cols - 1
	const isLastRow = rowIndex === rowCount - 1
	const isHighlighted = highlightSetRef.current.has(index)

	return (
		<div
			{...ariaAttributes}
			style={{
				...style,
				overflow: 'hidden',
				background: 'transparent',
				boxSizing: 'border-box',
				paddingRight: isLastColumn ? 0 : gap,
				paddingBottom: isLastRow ? 0 : gap,
			}}
		>
			<CellContent
				activationPredicate={activationPredicate}
				highlightClassName={highlightClassName}
				indicatorConfig={indicatorConfig}
				index={index}
				isHighlighted={isHighlighted}
				item={items[index]}
				onCellActivate={onCellActivate}
				renderItem={renderItem}
			/>
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
	onCellActivate: (index: number) => void
	activationPredicate?: CellActivationPredicate
	indicatorConfig: false | CellIndicatorConfig
	gridRef: RefObject<GridImperativeAPI | null>
	highlightedIndices: ReadonlySet<number>
	highlightClassName?: string
	highlightEpoch: number
}

export function ScrollGrid<T>({
	items,
	layout,
	gap,
	overscanCount,
	className,
	style,
	renderItem,
	onCellActivate,
	activationPredicate,
	indicatorConfig,
	gridRef,
	highlightedIndices,
	highlightClassName,
	highlightEpoch,
}: ScrollGridProps<T>) {
	const resolvedGap = Math.max(0, gap)
	const highlightSetRef = useRef<ReadonlySet<number>>(EMPTY_SET)
	highlightSetRef.current = highlightedIndices

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
			onCellActivate,
			activationPredicate,
			indicatorConfig,
			highlightSetRef,
			highlightClassName,
			highlightEpoch,
		}),
		[
			items,
			cols,
			rowCount,
			resolvedGap,
			renderItem,
			onCellActivate,
			activationPredicate,
			indicatorConfig,
			highlightClassName,
			highlightEpoch,
		],
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
