import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode, Ref, RefObject } from 'react'

export type TrellisMode = 'pagination' | 'scroll'

export interface AutoLayoutConfig {
	type: 'auto'
	minItemWidth: number
	minItemHeight: number
}

export interface ManualLayoutConfig {
	type: 'manual'
	rows: number
	cols: number
}

export type LayoutConfig = AutoLayoutConfig | ManualLayoutConfig

export interface LayoutResult {
	rows: number
	cols: number
	cellWidth: number
	cellHeight: number
	itemsPerPage: number
	totalPages: number
}

export interface ContainerSize {
	width: number
	height: number
}

export interface PaginationVM {
	enabled: boolean
	mode: TrellisMode
	currentPage: number
	totalPages: number
	totalItems: number
	itemsPerPage: number
	startIndex: number
	endIndex: number
	hasNext: boolean
	hasPrev: boolean
	goToPage: (page: number) => void
	next: () => void
	prev: () => void
}

export type PaginationPosition = 'top' | 'bottom'
export type PaginationAlign = 'start' | 'center' | 'end'

export interface PaginationConfigBase {
	onPageChange?: (page: number) => void
	renderControl?: ((vm: PaginationVM) => ReactNode) | false
	position?: PaginationPosition
	align?: PaginationAlign
	draggable?: boolean
	label?: ReactNode | ((vm: PaginationVM) => ReactNode)
}

export interface UncontrolledPaginationConfig extends PaginationConfigBase {
	mode: 'uncontrolled'
	defaultPage?: number
}

export interface ControlledPaginationConfig extends PaginationConfigBase {
	mode: 'controlled'
	page: number
}

export type PaginationConfig = UncontrolledPaginationConfig | ControlledPaginationConfig

export interface PanelState {
	id: string
	itemIndex: number
	pinned: boolean
}

export interface PanelHeaderAPI {
	close: () => void
	pin: () => void
	unpin: () => void
	togglePin: () => void
	isPinned: boolean
	minimize: () => void
	maximize: () => void
	restore: () => void
	isMinimized: boolean
	isMaximized: boolean
}

export interface PanelCallbacks {
	onOpen?: (itemIndex: number) => void
	onClose?: (itemIndex: number) => void
}

export interface PanelManagerAPI {
	openPanels: PanelState[]
	open: (itemIndex: number) => void
	activate: (id: string) => void
	close: (id: string) => void
	closeAll: () => void
	closeUnpinned: () => void
	togglePin: (id: string) => void
	isOpen: (itemIndex: number) => boolean
}

export interface Size {
	width: number
	height: number
}

export interface Point {
	x: number
	y: number
}

export interface FloatingPanelDefaults {
	size: Size
	minSize: Size
	maxSize?: Size
}

export interface CellIndicatorConfig {
	borderColor?: string
	triangleColor?: string
	triangleSize?: number
}

export type CellActivationEvent = MouseEvent<HTMLElement> | KeyboardEvent<HTMLElement>
export type CellActivationCallback = (event: CellActivationEvent) => boolean
export type ItemMatchCallback<T> = (item: T) => boolean

export interface GoToItemOptions {
	/** Auto-clear delay in ms. `0` = keep indefinitely. Overrides the component-level `highlightDuration` prop. */
	highlightDuration?: number
	target?: 'first' | 'last' | number
}

export interface GoToItemResult {
	found: boolean
	page: number
	matchIndices: number[]
	matchCount: number
	targetIndex: number
}

export interface TrellisGalleryHandle<T> {
	panels: {
		open: (callback: ItemMatchCallback<T>) => void
		close: (callback: ItemMatchCallback<T>) => void
		closeAll: () => void
		closeUnpinned: () => void
		isOpen: (callback: ItemMatchCallback<T>) => boolean
		openPanels: PanelState[]
	}
	goToItem: (callback: ItemMatchCallback<T>, options?: GoToItemOptions) => GoToItemResult
	clearHighlights: () => void
}

export interface TrellisGalleryBaseProps<T> {
	items: T[]
	layout: LayoutConfig
	gap?: number
	className?: string
	style?: CSSProperties
	overscanCount?: number
	panelDefaults?: Partial<FloatingPanelDefaults>
	renderItem: (item: T, index: number) => ReactNode
	renderExpandedItem: (item: T, index: number) => ReactNode
	panelTitle?: (item: T, index: number) => ReactNode
	renderPanelHeader?: (item: T, api: PanelHeaderAPI) => ReactNode
	onPanelOpen?: (item: T, index: number) => void
	onPanelClose?: (item: T, index: number) => void
	cellIndicator?: false | CellIndicatorConfig
	cellActivation?: CellActivationCallback
	/** CSS color for the highlight border. Defaults to `#0078d4`. */
	highlightColor?: string
	/** Auto-clear delay in ms. `0` = keep indefinitely. Defaults to 3600ms. */
	highlightDuration?: number
	highlightClassName?: string
	ref?: Ref<TrellisGalleryHandle<T>>
}

export interface PaginationModeProps<T> extends TrellisGalleryBaseProps<T> {
	mode: 'pagination'
	pagination: PaginationConfig
}

export interface ScrollModeProps<T> extends TrellisGalleryBaseProps<T> {
	mode: 'scroll'
	pagination?: PaginationConfig
}

export type TrellisGalleryProps<T> = PaginationModeProps<T> | ScrollModeProps<T>

export interface UseTrellisGalleryOptions<T> {
	items: T[]
	mode: TrellisMode
	layout: LayoutConfig
	gap?: number
	overscanCount?: number
	pagination?: PaginationConfig
	onPanelOpen?: (itemIndex: number) => void
	onPanelClose?: (itemIndex: number) => void
}

export interface UseTrellisGalleryResult {
	containerRef: RefObject<HTMLDivElement | null>
	containerSize: ContainerSize
	layout: LayoutResult
	pagination: PaginationVM
	panels: PanelManagerAPI
}
