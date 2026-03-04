import { createElement, useCallback, useEffect, useMemo, useState } from 'react'

import {
	calculateLayout,
	clampPage,
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
export type SearchField = 'label' | 'id' | 'description' | 'category' | 'createdAt'
export type StringOperator = 'contains' | 'equals' | 'startsWith'
export type NumberOperator = 'eq' | 'gt' | 'lt' | 'gte' | 'lte'
export type DateOperator = 'before' | 'after' | 'on'
export type SearchOperator = StringOperator | NumberOperator | DateOperator

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
	searchField: SearchField
	searchOperator: SearchOperator
	searchValue: string
	searchDuration: number
	highlightColor: string
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
	setSearchField: (value: SearchField) => void
	setSearchOperator: (value: SearchOperator) => void
	setSearchValue: (value: string) => void
	setSearchDuration: (value: number) => void
	setHighlightColor: (value: string) => void
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

function isValidDate(value: string): boolean {
	return Number.isFinite(Date.parse(value))
}

function normalizeDate(value: Date): string {
	return value.toISOString().slice(0, 10)
}

export function buildPredicate(
	field: SearchField,
	operator: SearchOperator,
	value: string,
): ((item: SampleItem) => boolean) | undefined {
	const normalizedValue = value.trim()
	if (normalizedValue.length === 0) return undefined

	if (field === 'id') {
		const target = Number(normalizedValue)
		if (!Number.isFinite(target)) return undefined
		switch (operator) {
			case 'eq':
				return (item) => item.id === target
			case 'gt':
				return (item) => item.id > target
			case 'lt':
				return (item) => item.id < target
			case 'gte':
				return (item) => item.id >= target
			case 'lte':
				return (item) => item.id <= target
			default:
				return undefined
		}
	}

	if (field === 'createdAt') {
		if (!isValidDate(normalizedValue)) return undefined
		const targetDate = new Date(normalizedValue)
		const targetDay = normalizeDate(targetDate)
		switch (operator) {
			case 'before':
				return (item) => item.createdAt < targetDate
			case 'after':
				return (item) => item.createdAt > targetDate
			case 'on':
				return (item) => normalizeDate(item.createdAt) === targetDay
			default:
				return undefined
		}
	}

	const searchText = normalizedValue.toLocaleLowerCase()
	const readFieldValue = (item: SampleItem): string => {
		switch (field) {
			case 'label':
				return item.label
			case 'description':
				return item.description
			case 'category':
				return item.category
			default:
				return ''
		}
	}

	switch (operator) {
		case 'contains':
			return (item) => readFieldValue(item).toLocaleLowerCase().includes(searchText)
		case 'equals':
			return (item) => readFieldValue(item).toLocaleLowerCase() === searchText
		case 'startsWith':
			return (item) => readFieldValue(item).toLocaleLowerCase().startsWith(searchText)
		default:
			return undefined
	}
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
	const [searchField, setSearchField] = useState<SearchField>('label')
	const [searchOperator, setSearchOperator] = useState<SearchOperator>('contains')
	const [searchValue, setSearchValue] = useState('')
	const [searchDuration, setSearchDuration] = useState(1800)
	const [highlightColor, setHighlightColor] = useState('#0078d4')

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
			searchField,
			searchOperator,
			searchValue,
			searchDuration: clampInt(searchDuration, 0, 60_000),
			highlightColor,
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
			searchField,
			searchOperator,
			searchValue,
			searchDuration,
			highlightColor,
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
			setSearchField,
			setSearchOperator,
			setSearchValue,
			setSearchDuration,
			setHighlightColor,
		},
		items,
		layoutConfig,
		paginationConfig,
		layoutInfo,
	}
}
