import type { CSSProperties, ReactNode } from 'react'
import { useTrellisPaginationContext } from '../context/trellis-pagination-context'
import { DEFAULT_GAP, DEFAULT_OVERSCAN_COUNT } from '../core/constants'
import type { CellActivationPredicate, CellIndicatorConfig, LayoutResult, TrellisMode } from '../core/types'
import { PaginationGrid } from './PaginationGrid'
import { ScrollGrid } from './ScrollGrid'

export interface GridRendererProps<T> {
	mode: TrellisMode
	items: T[]
	layout: LayoutResult
	renderItem: (item: T, index: number) => ReactNode
	onCellActivate: (index: number) => void
	activationPredicate?: CellActivationPredicate
	indicatorConfig: false | CellIndicatorConfig
	gap?: number
	overscanCount?: number
	className?: string
	style?: CSSProperties
}

export function GridRenderer<T>({
	mode,
	items,
	layout,
	renderItem,
	onCellActivate,
	activationPredicate,
	indicatorConfig,
	gap = DEFAULT_GAP,
	overscanCount = DEFAULT_OVERSCAN_COUNT,
	className,
	style,
}: GridRendererProps<T>) {
	const pagination = useTrellisPaginationContext()

	if (mode === 'pagination') {
		return (
			<PaginationGrid
				className={className}
				endIndex={pagination.endIndex}
				gap={gap}
				items={items}
				layout={layout}
				onCellActivate={onCellActivate}
				activationPredicate={activationPredicate}
				indicatorConfig={indicatorConfig}
				renderItem={renderItem}
				startIndex={pagination.startIndex}
				style={style}
			/>
		)
	}

	return (
		<ScrollGrid
			className={className}
			gap={gap}
			items={items}
			layout={layout}
			onCellActivate={onCellActivate}
			activationPredicate={activationPredicate}
			indicatorConfig={indicatorConfig}
			overscanCount={overscanCount}
			renderItem={renderItem}
			style={style}
		/>
	)
}
