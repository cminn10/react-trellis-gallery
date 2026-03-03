import { useRef } from 'react'

import { DEFAULT_GAP } from '../core/constants'
import type { UseTrellisGalleryOptions, UseTrellisGalleryResult } from '../core/types'
import { useContainerSize } from './use-container-size'
import { useTrellisLayout } from './use-trellis-layout'
import { useTrellisPagination } from './use-trellis-pagination'
import { useTrellisPanels } from './use-trellis-panels'

const DEFAULT_UNCONTROLLED_PAGINATION = { mode: 'uncontrolled' } as const

export function useTrellisGallery<T>(options: UseTrellisGalleryOptions<T>): UseTrellisGalleryResult {
	const containerRef = useRef<HTMLDivElement | null>(null)
	const containerSize = useContainerSize(containerRef)
	const layout = useTrellisLayout(containerSize, options.items.length, options.layout, options.gap ?? DEFAULT_GAP)
	const paginationConfig =
		options.mode === 'pagination' ? (options.pagination ?? DEFAULT_UNCONTROLLED_PAGINATION) : null
	const pagination = useTrellisPagination(layout, options.items.length, paginationConfig)
	const panels = useTrellisPanels({
		onOpen: options.onPanelOpen,
		onClose: options.onPanelClose,
	})

	return {
		containerRef,
		containerSize,
		layout,
		pagination,
		panels,
	}
}
