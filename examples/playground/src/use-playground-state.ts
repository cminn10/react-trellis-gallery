import { createElement, useCallback, useEffect, useMemo, useState } from 'react'

import {
	calculateLayout,
	type LayoutConfig,
	type PaginationAlign,
	type PaginationConfig,
	type PaginationPosition,
	type PaginationVM,
	type TrellisMode,
} from 'react-trellis-gallery'

import { generateItems, type SampleItem } from './sample-items'

export type LayoutType = 'auto' | 'manual'
export type PaginationRenderMode = 'default' | 'custom' | 'hidden'

export interface PlaygroundControls {
	itemCount: number
	containerWidth: number
	containerHeight: number
	mode: TrellisMode
	layoutType: LayoutType
	minItemWidth: number
	minItemHeight: number
	rows: number
	cols: number
	gap: number
	paginationRenderMode: PaginationRenderMode
	paginationPosition: PaginationPosition
	paginationAlign: PaginationAlign
	paginationDraggable: boolean
	paginationLabel: string
	externalControl: boolean
	externalPage: number
}

export interface PlaygroundSetters {
	setItemCount: (value: number) => void
	setContainerWidth: (value: number) => void
	setContainerHeight: (value: number) => void
	setMode: (value: TrellisMode) => void
	setLayoutType: (value: LayoutType) => void
	setMinItemWidth: (value: number) => void
	setMinItemHeight: (value: number) => void
	setRows: (value: number) => void
	setCols: (value: number) => void
	setGap: (value: number) => void
	setPaginationRenderMode: (value: PaginationRenderMode) => void
	setPaginationPosition: (value: PaginationPosition) => void
	setPaginationAlign: (value: PaginationAlign) => void
	setPaginationDraggable: (value: boolean) => void
	setPaginationLabel: (value: string) => void
	setExternalControl: (value: boolean) => void
	setExternalPage: (value: number) => void
}

export interface PlaygroundState {
	controls: PlaygroundControls
	setters: PlaygroundSetters
	items: SampleItem[]
	layoutConfig: LayoutConfig
	paginationConfig: PaginationConfig
	layoutInfo: ReturnType<typeof calculateLayout>
}

function clamp(value: number, min: number, max: number): number {
	if (!Number.isFinite(value)) return min
	return Math.min(Math.max(value, min), max)
}

function clampInt(value: number, min: number, max: number): number {
	return Math.floor(clamp(value, min, max))
}

function clampPage(page: number, totalPages: number): number {
	if (totalPages <= 0) return 0
	return clampInt(page, 0, totalPages - 1)
}

export function usePlaygroundState(): PlaygroundState {
	const [itemCount, setItemCount] = useState(24)
	const [containerWidth, setContainerWidth] = useState(960)
	const [containerHeight, setContainerHeight] = useState(640)
	const [mode, setMode] = useState<TrellisMode>('pagination')
	const [layoutType, setLayoutType] = useState<LayoutType>('auto')
	const [minItemWidth, setMinItemWidth] = useState(200)
	const [minItemHeight, setMinItemHeight] = useState(150)
	const [rows, setRows] = useState(2)
	const [cols, setCols] = useState(3)
	const [gap, setGap] = useState(4)
	const [paginationRenderMode, setPaginationRenderMode] = useState<PaginationRenderMode>('default')
	const [paginationPosition, setPaginationPosition] = useState<PaginationPosition>('bottom')
	const [paginationAlign, setPaginationAlign] = useState<PaginationAlign>('center')
	const [paginationDraggable, setPaginationDraggable] = useState(false)
	const [paginationLabel, setPaginationLabel] = useState('')
	const [externalControl, setExternalControlState] = useState(false)
	const [externalPage, setExternalPageState] = useState(0)

	const effectiveExternalControl = paginationRenderMode === 'hidden' ? true : externalControl

	const controls = useMemo<PlaygroundControls>(
		() => ({
			itemCount: clampInt(itemCount, 0, 10000),
			containerWidth: clampInt(containerWidth, 100, 2000),
			containerHeight: clampInt(containerHeight, 100, 1500),
			mode,
			layoutType,
			minItemWidth: clampInt(minItemWidth, 1, 1200),
			minItemHeight: clampInt(minItemHeight, 1, 1200),
			rows: clampInt(rows, 1, 100),
			cols: clampInt(cols, 1, 100),
			gap: clampInt(gap, 0, 64),
			paginationRenderMode,
			paginationPosition,
			paginationAlign,
			paginationDraggable,
			paginationLabel,
			externalControl: effectiveExternalControl,
			externalPage,
		}),
		[
			itemCount,
			containerWidth,
			containerHeight,
			mode,
			layoutType,
			minItemWidth,
			minItemHeight,
			rows,
			cols,
			gap,
			paginationRenderMode,
			paginationPosition,
			paginationAlign,
			paginationDraggable,
			paginationLabel,
			effectiveExternalControl,
			externalPage,
		],
	)

	const items = useMemo(() => generateItems(controls.itemCount), [controls.itemCount])

	const layoutConfig = useMemo<LayoutConfig>(() => {
		if (controls.layoutType === 'auto') {
			return {
				type: 'auto',
				minItemWidth: controls.minItemWidth,
				minItemHeight: controls.minItemHeight,
			}
		}

		return {
			type: 'manual',
			rows: controls.rows,
			cols: controls.cols,
		}
	}, [controls.layoutType, controls.minItemWidth, controls.minItemHeight, controls.rows, controls.cols])

	const layoutInfo = useMemo(
		() =>
			calculateLayout(
				controls.containerWidth,
				controls.containerHeight,
				controls.itemCount,
				layoutConfig,
				controls.gap,
			),
		[controls.containerWidth, controls.containerHeight, controls.itemCount, controls.gap, layoutConfig],
	)

	const setExternalPage = useCallback(
		(value: number) => {
			const totalPages = layoutInfo.totalPages
			setExternalPageState((prev) => {
				const nextPage = clampPage(value, totalPages)
				const prevPage = clampPage(prev, totalPages)
				if (nextPage === prevPage) return prev
				return nextPage
			})
		},
		[layoutInfo.totalPages],
	)

	const setExternalControl = useCallback(
		(value: boolean) => {
			if (paginationRenderMode === 'hidden') return
			setExternalControlState(value)
		},
		[paginationRenderMode],
	)

	useEffect(() => {
		setExternalPageState((prev) => {
			const nextPage = clampPage(prev, layoutInfo.totalPages)
			return nextPage === prev ? prev : nextPage
		})
	}, [layoutInfo.totalPages])

	const paginationConfig = useMemo<PaginationConfig>(() => {
		const renderControl: PaginationConfig['renderControl'] =
			controls.paginationRenderMode === 'custom'
				? (vm: PaginationVM) =>
						createElement(
							'span',
							{
								style: {
									position: 'absolute',
									top: 12,
									right: 12,
									padding: '4px 9px',
									borderRadius: 9,
									background: 'oklch(1 0 0 / 94%)',
									border: '1px solid oklch(0.923 0.003 48.717)',
									color: 'oklch(0.216 0.006 56.043)',
									fontSize: 12,
									fontWeight: 600,
									boxShadow: '0 4px 16px oklch(0.147 0.004 49.25 / 12%)',
								},
							},
							`${vm.currentPage + 1} / ${vm.totalPages}`,
						)
				: controls.paginationRenderMode === 'hidden'
					? false
					: undefined

		const shared = {
			onPageChange: controls.externalControl
				? (page: number) => {
						setExternalPage(page)
					}
				: undefined,
			renderControl,
			position: controls.paginationPosition,
			align: controls.paginationAlign,
			draggable: controls.paginationDraggable,
			label: controls.paginationLabel.trim() || undefined,
		}

		if (controls.externalControl) {
			return {
				...shared,
				mode: 'controlled',
				page: clampPage(externalPage, layoutInfo.totalPages),
			}
		}

		return {
			...shared,
			mode: 'uncontrolled',
		}
	}, [
		controls.externalControl,
		controls.paginationAlign,
		controls.paginationDraggable,
		controls.paginationLabel,
		controls.paginationPosition,
		controls.paginationRenderMode,
		externalPage,
		layoutInfo.totalPages,
		setExternalPage,
	])

	return {
		controls,
		setters: {
			setItemCount,
			setContainerWidth,
			setContainerHeight,
			setMode,
			setLayoutType,
			setMinItemWidth,
			setMinItemHeight,
			setRows,
			setCols,
			setGap,
			setPaginationRenderMode,
			setPaginationPosition,
			setPaginationAlign,
			setPaginationDraggable,
			setPaginationLabel,
			setExternalControl,
			setExternalPage,
		},
		items,
		layoutConfig,
		paginationConfig,
		layoutInfo,
	}
}
