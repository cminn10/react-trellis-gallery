import type { CSSProperties, MouseEventHandler, ReactNode } from 'react'
import { memo, useCallback, useMemo } from 'react'

import { DEFAULT_TRIANGLE_SIZE } from '../core/constants'
import type { CellActivationPredicate, CellIndicatorConfig } from '../core/types'
import { useCellInteraction } from '../hooks/use-cell-interaction'

interface CellContentProps {
	item: unknown
	index: number
	renderItem: (item: unknown, index: number) => ReactNode
	onCellActivate: (index: number) => void
	activationPredicate?: CellActivationPredicate
	indicatorConfig: false | CellIndicatorConfig
	isHighlighted?: boolean
	highlightClassName?: string
}

type CellStyleWithVars = CSSProperties & {
	'--rtg-cell-border-color'?: string
	'--rtg-cell-triangle-color'?: string
	'--rtg-cell-indicator-border-color'?: string
}

const BASE_CELL_STYLE: CSSProperties = {
	width: '100%',
	height: '100%',
	overflow: 'visible',
	background: 'transparent',
}
const CELL_CONTENT_STYLE: CSSProperties = {
	width: '100%',
	height: '100%',
	overflow: 'hidden',
	borderRadius: 'var(--rtg-border-radius, 10px)',
}

export const CellContent = memo(function CellContent({
	item,
	index,
	renderItem,
	onCellActivate,
	activationPredicate,
	indicatorConfig,
	isHighlighted = false,
	highlightClassName,
}: CellContentProps) {
	const onActivate = useCallback(() => {
		onCellActivate(index)
	}, [index, onCellActivate])
	const interactionProps = useCellInteraction({
		onActivate,
		activationPredicate,
	})
	const triangleSize =
		indicatorConfig === false ? DEFAULT_TRIANGLE_SIZE : (indicatorConfig.triangleSize ?? DEFAULT_TRIANGLE_SIZE)
	const cellStyle = useMemo<CellStyleWithVars>(() => {
		const style: CellStyleWithVars = { ...BASE_CELL_STYLE }
		if (indicatorConfig === false) return style
		if (indicatorConfig.borderColor) {
			style['--rtg-cell-border-color'] = indicatorConfig.borderColor
			style['--rtg-cell-indicator-border-color'] = indicatorConfig.borderColor
		}
		if (indicatorConfig.triangleColor) style['--rtg-cell-triangle-color'] = indicatorConfig.triangleColor
		return style
	}, [indicatorConfig])
	const triangleStyle = useMemo<CSSProperties>(
		() => ({
			position: 'absolute',
			top: 0,
			right: 0,
			width: triangleSize,
			height: triangleSize,
			padding: 0,
			border: '1px solid var(--rtg-cell-indicator-border-color, rgba(0, 0, 0, 0.18))',
			borderRadius: 0,
			appearance: 'none',
			backgroundColor: 'var(--rtg-cell-triangle-color, rgba(0, 0, 0, 0.08))',
			backgroundImage:
				'repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.22) 0 2px, rgba(255, 255, 255, 0) 2px 6px)',
			clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
			cursor: 'pointer',
			transition: 'filter 140ms ease, border-color 140ms ease',
		}),
		[triangleSize],
	)
	const onTriangleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
		(event) => {
			event.stopPropagation()
			onCellActivate(index)
		},
		[index, onCellActivate],
	)

	return (
		<div
			data-rtg-cell
			data-rtg-highlighted={isHighlighted ? '' : undefined}
			className={isHighlighted ? highlightClassName : undefined}
			{...interactionProps}
			style={cellStyle}
		>
			<div style={CELL_CONTENT_STYLE}>{renderItem(item, index)}</div>
			{indicatorConfig === false ? null : (
				<button
					aria-label="Open panel"
					data-rtg-indicator-trigger
					onClick={onTriangleClick}
					style={triangleStyle}
					type="button"
				/>
			)}
		</div>
	)
})
