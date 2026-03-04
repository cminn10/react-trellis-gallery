export { DefaultPagination } from './components/DefaultPagination'
export { IconButton } from './components/IconButton'
export { TrellisGallery } from './components/TrellisGallery'
export { useTrellisPaginationContext } from './context/trellis-pagination-context'
export { calculateLayout, fitGrid } from './core/layout-engine'
export type {
	AutoLayoutConfig,
	CellActivationEvent,
	CellActivationPredicate,
	CellIndicatorConfig,
	ContainerSize,
	ControlledPaginationConfig,
	FloatingPanelDefaults,
	GoToItemOptions,
	GoToItemResult,
	LayoutConfig,
	LayoutResult,
	ManualLayoutConfig,
	PaginationAlign,
	PaginationConfig,
	PaginationConfigBase,
	PaginationModeProps,
	PaginationPosition,
	PaginationVM,
	PanelHeaderAPI,
	PanelManagerAPI,
	PanelState,
	Point,
	ScrollModeProps,
	Size,
	TrellisGalleryBaseProps,
	TrellisGalleryHandle,
	TrellisGalleryProps,
	TrellisMode,
	UncontrolledPaginationConfig,
	UseTrellisGalleryOptions,
	UseTrellisGalleryResult,
} from './core/types'
export { clampPage } from './core/utils'
export type { CellInteractionOptions } from './hooks/use-cell-interaction'
export { useCellInteraction } from './hooks/use-cell-interaction'
export { useContainerSize } from './hooks/use-container-size'
export { useTrellisGallery } from './hooks/use-trellis-gallery'
export type { UseTrellisHighlightOptions, UseTrellisHighlightResult } from './hooks/use-trellis-highlight'
export { useTrellisHighlight } from './hooks/use-trellis-highlight'
export { useTrellisLayout } from './hooks/use-trellis-layout'
export { useTrellisPagination } from './hooks/use-trellis-pagination'
export { useTrellisPanels } from './hooks/use-trellis-panels'
