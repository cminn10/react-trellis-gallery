import { useMemo } from 'react'

import { DEFAULT_GAP, EMPTY_LAYOUT } from '../core/constants'
import { calculateLayout } from '../core/layout-engine'
import type { ContainerSize, LayoutConfig, LayoutResult } from '../core/types'

export function useTrellisLayout(
	containerSize: ContainerSize,
	itemCount: number,
	config: LayoutConfig,
	gap: number = DEFAULT_GAP,
): LayoutResult {
	const { type } = config
	const minW = type === 'auto' ? config.minItemWidth : undefined
	const minH = type === 'auto' ? config.minItemHeight : undefined
	const cfgRows = type === 'manual' ? config.rows : undefined
	const cfgCols = type === 'manual' ? config.cols : undefined
	const normalizedConfig = useMemo<LayoutConfig>(() => {
		if (type === 'auto') {
			return {
				type: 'auto',
				minItemWidth: minW ?? 1,
				minItemHeight: minH ?? 1,
			}
		}

		return {
			type: 'manual',
			rows: cfgRows ?? 1,
			cols: cfgCols ?? 1,
		}
	}, [cfgCols, cfgRows, minH, minW, type])

	return useMemo(() => {
		if (containerSize.width <= 0 || containerSize.height <= 0) return EMPTY_LAYOUT

		return calculateLayout(containerSize.width, containerSize.height, itemCount, normalizedConfig, gap)
	}, [containerSize.width, containerSize.height, itemCount, normalizedConfig, gap])
}
