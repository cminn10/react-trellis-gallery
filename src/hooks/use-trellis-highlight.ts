import { startTransition, useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_HIGHLIGHT_DURATION } from '../core/constants'
import type { GoToItemOptions, GoToItemResult } from '../core/types'

const EMPTY_SET: ReadonlySet<number> = new Set()
const LARGE_DATASET_THRESHOLD = 10_000

function setsEqual(a: ReadonlySet<number>, b: ReadonlySet<number>): boolean {
	if (a === b) return true
	if (a.size !== b.size) return false
	for (const value of a) {
		if (!b.has(value)) return false
	}
	return true
}

function findMatchIndices<T>(items: T[], predicate: (item: T) => boolean): number[] {
	const matchIndices: number[] = []
	for (const [index, item] of items.entries()) {
		if (predicate(item)) matchIndices.push(index)
	}
	return matchIndices
}

function resolveTargetIndex(matchIndices: number[], target: GoToItemOptions['target']): number {
	if (matchIndices.length === 0) return -1
	if (target === 'last') return matchIndices[matchIndices.length - 1] ?? -1
	if (typeof target === 'number') {
		const position = Math.min(Math.max(0, Math.floor(target)), matchIndices.length - 1)
		return matchIndices[position] ?? -1
	}
	return matchIndices[0] ?? -1
}

export interface UseTrellisHighlightOptions<T> {
	items: T[]
	itemsPerPage: number
	navigate: (targetIndex: number) => void
	highlightPredicate?: (item: T) => boolean
	/** Component-level auto-clear default (ms). `0` = keep indefinitely. Overridden by per-call `GoToItemOptions.highlightDuration`. */
	defaultDuration?: number
}

export interface UseTrellisHighlightResult<T> {
	highlightedIndices: ReadonlySet<number>
	highlightEpoch: number
	goToItem: (predicate: (item: T) => boolean, options?: GoToItemOptions) => GoToItemResult
	clearHighlights: () => void
}

interface HighlightState {
	highlightedIndices: ReadonlySet<number>
	highlightEpoch: number
}

export function useTrellisHighlight<T>({
	items,
	itemsPerPage,
	navigate,
	highlightPredicate,
	defaultDuration,
}: UseTrellisHighlightOptions<T>): UseTrellisHighlightResult<T> {
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
	const navigateRef = useRef(navigate)
	navigateRef.current = navigate
	const itemsPerPageRef = useRef(itemsPerPage)
	itemsPerPageRef.current = itemsPerPage
	const defaultDurationRef = useRef(defaultDuration)
	defaultDurationRef.current = defaultDuration
	const [state, setState] = useState<HighlightState>({
		highlightedIndices: EMPTY_SET,
		highlightEpoch: 0,
	})

	const updateHighlights = useCallback((nextSet: ReadonlySet<number>) => {
		setState((prevState) => {
			if (setsEqual(prevState.highlightedIndices, nextSet)) return prevState
			return {
				highlightedIndices: nextSet,
				highlightEpoch: prevState.highlightEpoch + 1,
			}
		})
	}, [])

	const clearTimer = useCallback(() => {
		if (timerRef.current === null) return
		clearTimeout(timerRef.current)
		timerRef.current = null
	}, [])

	const clearHighlights = useCallback(() => {
		clearTimer()
		updateHighlights(EMPTY_SET)
	}, [clearTimer, updateHighlights])

	const goToItem = useCallback(
		(predicate: (item: T) => boolean, options?: GoToItemOptions): GoToItemResult => {
			const matchIndices = findMatchIndices(items, predicate)
			if (matchIndices.length === 0) {
				clearHighlights()
				return {
					found: false,
					page: 0,
					matchIndices,
					matchCount: 0,
					targetIndex: -1,
				}
			}

			const targetIndex = resolveTargetIndex(matchIndices, options?.target ?? 'first')
			if (targetIndex >= 0) navigateRef.current(targetIndex)
			const nextSet = new Set(matchIndices)

			if (items.length > LARGE_DATASET_THRESHOLD) {
				startTransition(() => {
					updateHighlights(nextSet)
				})
			} else {
				updateHighlights(nextSet)
			}

			const highlightDuration =
				options?.highlightDuration ?? defaultDurationRef.current ?? DEFAULT_HIGHLIGHT_DURATION
			clearTimer()
			if (highlightDuration > 0 && Number.isFinite(highlightDuration)) {
				timerRef.current = setTimeout(
					() => {
						updateHighlights(EMPTY_SET)
						timerRef.current = null
					},
					highlightDuration,
				)
			}

			return {
				found: true,
				page: itemsPerPageRef.current > 0 ? Math.floor(targetIndex / itemsPerPageRef.current) : 0,
				matchIndices,
				matchCount: matchIndices.length,
				targetIndex,
			}
		},
		[clearHighlights, clearTimer, items, updateHighlights],
	)

	useEffect(() => {
		clearTimer()
		if (!highlightPredicate) {
			updateHighlights(EMPTY_SET)
			return
		}

		const matchIndices = findMatchIndices(items, highlightPredicate)
		if (matchIndices.length === 0) {
			updateHighlights(EMPTY_SET)
			return
		}

		const targetIndex = matchIndices[0] ?? -1
		if (targetIndex >= 0) navigateRef.current(targetIndex)
		const nextSet = new Set(matchIndices)
		if (items.length > LARGE_DATASET_THRESHOLD) {
			startTransition(() => {
				updateHighlights(nextSet)
			})
			return
		}
		updateHighlights(nextSet)
	}, [clearTimer, highlightPredicate, items, updateHighlights])

	useEffect(() => {
		return () => {
			clearTimer()
		}
	}, [clearTimer])

	return {
		highlightedIndices: state.highlightedIndices,
		highlightEpoch: state.highlightEpoch,
		goToItem,
		clearHighlights,
	}
}
