import type {
	CellIndicatorConfig,
	FloatingPanelDefaults,
	LayoutResult,
	PaginationAlign,
	PaginationPosition,
} from './types'

export const DEFAULT_GAP = 0
export const DEFAULT_OVERSCAN_COUNT = 1
export const DEFAULT_HIGHLIGHT_DURATION = 3600
export const PANEL_CASCADE_OFFSET = 24
export const DEFAULT_TRIANGLE_SIZE = 20
export const DEFAULT_PAGINATION_POSITION: PaginationPosition = 'bottom'
export const DEFAULT_PAGINATION_ALIGN: PaginationAlign = 'center'
export const DEFAULT_CELL_INDICATOR: CellIndicatorConfig = {}

export const DEFAULT_FLOATING_PANEL: FloatingPanelDefaults = {
	size: { width: 600, height: 400 },
	minSize: { width: 300, height: 180 },
	maxSize: undefined,
}

export const RTG_PANEL_CSS_VARS = [
	'--rtg-bg',
	'--rtg-fg',
	'--rtg-shadow',
	'--rtg-border-color',
	'--rtg-border-radius',
	'--rtg-header-border-color',
	'--rtg-button-hover-bg',
	'--rtg-button-active-bg',
	'--rtg-button-disabled-opacity',
] as const

export const EMPTY_LAYOUT: LayoutResult = {
	rows: 0,
	cols: 0,
	cellWidth: 0,
	cellHeight: 0,
	itemsPerPage: 0,
	totalPages: 0,
}
