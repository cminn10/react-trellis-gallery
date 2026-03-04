import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import type { LayoutResult, PaginationConfig, PaginationVM } from '../core/types'
import { clampPage } from '../core/utils'

export function useTrellisPagination(
	layout: LayoutResult,
	totalItems: number,
	config: PaginationConfig | null,
): PaginationVM {
	const [internalPage, setInternalPage] = useState(() => {
		const defaultPage = config?.mode === 'uncontrolled' ? (config.defaultPage ?? 0) : 0
		return clampPage(defaultPage, layout.totalPages)
	})
	const onPageChangeRef = useRef(config?.onPageChange)
	onPageChangeRef.current = config?.onPageChange

	const enabled = config !== null
	const currentPage =
		config?.mode === 'controlled'
			? clampPage(config.page, layout.totalPages)
			: clampPage(internalPage, layout.totalPages)

	const goToPage = useCallback(
		(page: number) => {
			if (!enabled) return

			const nextPage = clampPage(page, layout.totalPages)
			if (config?.mode === 'controlled') {
				if (nextPage !== currentPage) onPageChangeRef.current?.(nextPage)
				return
			}

			setInternalPage((prevPage) => {
				const prevClamped = clampPage(prevPage, layout.totalPages)
				if (prevClamped === nextPage) return prevPage
				onPageChangeRef.current?.(nextPage)
				return nextPage
			})
		},
		[config?.mode, currentPage, enabled, layout.totalPages],
	)

	const next = useCallback(() => {
		goToPage(currentPage + 1)
	}, [currentPage, goToPage])

	const prev = useCallback(() => {
		goToPage(currentPage - 1)
	}, [currentPage, goToPage])

	useEffect(() => {
		if (config?.mode !== 'uncontrolled') return

		const clamped = clampPage(internalPage, layout.totalPages)
		if (clamped === internalPage) return

		setInternalPage(clamped)
		onPageChangeRef.current?.(clamped)
	}, [config?.mode, internalPage, layout.totalPages])

	return useMemo(() => {
		const safeTotalItems = Math.max(0, totalItems)
		const safeItemsPerPage = Math.max(0, layout.itemsPerPage)
		const startIndex = safeItemsPerPage > 0 ? currentPage * safeItemsPerPage : 0
		const endIndex = safeItemsPerPage > 0 ? Math.min(safeTotalItems, startIndex + safeItemsPerPage) : 0
		const hasNext = enabled && layout.totalPages > 0 && currentPage < layout.totalPages - 1
		const hasPrev = enabled && currentPage > 0

		return {
			enabled,
			mode: enabled ? 'pagination' : 'scroll',
			currentPage,
			totalPages: layout.totalPages,
			totalItems: safeTotalItems,
			itemsPerPage: safeItemsPerPage,
			startIndex,
			endIndex,
			hasNext,
			hasPrev,
			goToPage,
			next,
			prev,
		}
	}, [currentPage, enabled, goToPage, layout.itemsPerPage, layout.totalPages, next, prev, totalItems])
}
