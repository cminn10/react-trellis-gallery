import { EMPTY_LAYOUT } from './constants'
import type { LayoutConfig, LayoutResult } from './types'

function clampPositiveInt(value: number): number {
	if (!Number.isFinite(value)) return 1
	return Math.max(1, Math.floor(value))
}

function sanitizeGap(gap: number): number {
	if (!Number.isFinite(gap)) return 0
	return Math.max(0, gap)
}

/**
 * Finds a best-fit grid for a bounded row/column capacity.
 * Preference order:
 * 1) smallest area (rows * cols)
 * 2) fewer rows
 * 3) fewer cols
 */
export function fitGrid(itemCount: number, maxRows: number, maxCols: number): { rows: number; cols: number } {
	const count = Math.max(0, Math.floor(itemCount))
	if (count <= 0) return { rows: 0, cols: 0 }

	const boundedRows = clampPositiveInt(maxRows)
	const boundedCols = clampPositiveInt(maxCols)

	let bestRows = boundedRows
	let bestCols = boundedCols
	let bestArea = Number.POSITIVE_INFINITY

	for (let rows = 1; rows <= boundedRows; rows += 1) {
		const cols = Math.ceil(count / rows)
		if (cols > boundedCols) continue

		const area = rows * cols
		const isBetter =
			area < bestArea ||
			(area === bestArea && rows < bestRows) ||
			(area === bestArea && rows === bestRows && cols < bestCols)

		if (isBetter) {
			bestRows = rows
			bestCols = cols
			bestArea = area
		}
	}

	// Fallback path (should only happen for invalid bounded values).
	if (!Number.isFinite(bestArea)) {
		return {
			rows: boundedRows,
			cols: boundedCols,
		}
	}

	return { rows: bestRows, cols: bestCols }
}

function resolveCapacity(
	config: LayoutConfig,
	containerWidth: number,
	containerHeight: number,
	gap: number,
): { maxRows: number; maxCols: number } {
	if (config.type === 'manual') {
		return {
			maxRows: clampPositiveInt(config.rows),
			maxCols: clampPositiveInt(config.cols),
		}
	}

	const minWidth = Math.max(1, config.minItemWidth)
	const minHeight = Math.max(1, config.minItemHeight)
	const maxCols = clampPositiveInt((containerWidth + gap) / (minWidth + gap))
	const maxRows = clampPositiveInt((containerHeight + gap) / (minHeight + gap))

	return { maxRows, maxCols }
}

function buildLayout(
	itemCount: number,
	containerWidth: number,
	containerHeight: number,
	gap: number,
	rows: number,
	cols: number,
): LayoutResult {
	const itemsPerPage = rows * cols
	const totalPages = itemsPerPage === 0 ? 0 : Math.ceil(itemCount / itemsPerPage)
	const cellWidth = cols === 0 ? 0 : Math.max(0, (containerWidth - gap * (cols - 1)) / cols)
	const cellHeight = rows === 0 ? 0 : Math.max(0, (containerHeight - gap * (rows - 1)) / rows)

	return {
		rows,
		cols,
		cellWidth,
		cellHeight,
		itemsPerPage,
		totalPages,
	}
}

export function calculateLayout(
	containerWidth: number,
	containerHeight: number,
	itemCount: number,
	config: LayoutConfig,
	gap: number,
): LayoutResult {
	if (containerWidth <= 0 || containerHeight <= 0) return EMPTY_LAYOUT

	const normalizedItemCount = Math.max(0, Math.floor(itemCount))
	if (normalizedItemCount === 0) return EMPTY_LAYOUT

	const normalizedGap = sanitizeGap(gap)
	const { maxRows, maxCols } = resolveCapacity(config, containerWidth, containerHeight, normalizedGap)
	const capacity = maxRows * maxCols

	if (normalizedItemCount <= capacity) {
		const { rows, cols } = fitGrid(normalizedItemCount, maxRows, maxCols)
		return buildLayout(normalizedItemCount, containerWidth, containerHeight, normalizedGap, rows, cols)
	}

	return buildLayout(normalizedItemCount, containerWidth, containerHeight, normalizedGap, maxRows, maxCols)
}
