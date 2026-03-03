import type { CSSProperties, ReactNode } from 'react'
import { memo } from 'react'

import type { LayoutResult } from '../core/types'
import { useCellInteraction } from '../hooks/use-cell-interaction'

interface PaginationCellProps {
	item: unknown
	index: number
	renderItem: (item: unknown, index: number) => ReactNode
	onItemDoubleClick: (index: number) => void
}

const PaginationCell = memo(function PaginationCell({
	item,
	index,
	renderItem,
	onItemDoubleClick,
}: PaginationCellProps) {
	const openItem = () => onItemDoubleClick(index)
	const interactionProps = useCellInteraction(openItem)

	return (
		<div
			{...interactionProps}
			style={{
				width: '100%',
				height: '100%',
				overflow: 'hidden',
				background: 'transparent',
			}}
		>
			{renderItem(item, index)}
		</div>
	)
})

export interface PaginationGridProps<T> {
	items: T[]
	layout: LayoutResult
	startIndex: number
	endIndex: number
	gap: number
	className?: string
	style?: CSSProperties
	renderItem: (item: T, index: number) => ReactNode
	onItemDoubleClick: (index: number) => void
}

export function PaginationGrid<T>({
	items,
	layout,
	startIndex,
	endIndex,
	gap,
	className,
	style,
	renderItem,
	onItemDoubleClick,
}: PaginationGridProps<T>) {
	if (layout.itemsPerPage <= 0 || layout.cols <= 0 || layout.rows <= 0) return null

	const pageItems = items.slice(startIndex, endIndex)

	return (
		<div
			className={className}
			style={{
				display: 'grid',
				width: '100%',
				height: '100%',
				background: 'transparent',
				gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
				gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
				gap,
				...style,
			}}
		>
			{pageItems.map((item, offset) => {
				const itemIndex = startIndex + offset
				return (
					<PaginationCell
						key={itemIndex}
						index={itemIndex}
						item={item}
						onItemDoubleClick={onItemDoubleClick}
						renderItem={renderItem as (item: unknown, index: number) => ReactNode}
					/>
				)
			})}
		</div>
	)
}
