import type { CSSProperties, ReactNode } from 'react'

import type { CellActivationPredicate, CellIndicatorConfig, LayoutResult } from '../core/types'
import { CellContent } from './CellContent'

export interface PaginationGridProps<T> {
	items: T[]
	layout: LayoutResult
	startIndex: number
	endIndex: number
	gap: number
	className?: string
	style?: CSSProperties
	renderItem: (item: T, index: number) => ReactNode
	onCellActivate: (index: number) => void
	activationPredicate?: CellActivationPredicate
	indicatorConfig: false | CellIndicatorConfig
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
	onCellActivate,
	activationPredicate,
	indicatorConfig,
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
					<CellContent
						activationPredicate={activationPredicate}
						indicatorConfig={indicatorConfig}
						key={itemIndex}
						index={itemIndex}
						item={item}
						onCellActivate={onCellActivate}
						renderItem={renderItem as (item: unknown, index: number) => ReactNode}
					/>
				)
			})}
		</div>
	)
}
