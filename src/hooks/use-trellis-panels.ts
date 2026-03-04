import { useCallback, useMemo, useReducer, useRef } from 'react'

import type { PanelCallbacks, PanelManagerAPI, PanelState } from '../core/types'

let globalIdCounter = 0
let globalOpenCounter = 0
let globalActivationCounter = 0

type PanelAction =
	| { type: 'open'; panel: PanelState }
	| { type: 'activate'; id: string; activationOrder: number }
	| { type: 'close'; id: string }
	| { type: 'closeAll' }
	| { type: 'closeUnpinned' }
	| { type: 'togglePin'; id: string }

function panelReducer(state: PanelState[], action: PanelAction): PanelState[] {
	switch (action.type) {
		case 'open': {
			const alreadyOpen = state.some((panel) => panel.itemIndex === action.panel.itemIndex)
			if (alreadyOpen) return state
			return [...state, action.panel]
		}
		case 'activate': {
			const panel = state.find((entry) => entry.id === action.id)
			if (!panel) return state
			const updated = { ...panel, activationOrder: action.activationOrder }
			return [...state.filter((entry) => entry.id !== action.id), updated]
		}
		case 'close':
			return state.filter((panel) => panel.id !== action.id)
		case 'closeAll':
			return []
		case 'closeUnpinned':
			return state.filter((panel) => panel.pinned)
		case 'togglePin':
			return state.map((panel) =>
				panel.id === action.id
					? {
							...panel,
							pinned: !panel.pinned,
						}
					: panel,
			)
		default:
			return state
	}
}

export function useTrellisPanels(options?: PanelCallbacks): PanelManagerAPI {
	const [openPanels, dispatch] = useReducer(panelReducer, [])
	const callbacksRef = useRef(options)
	const openPanelsRef = useRef(openPanels)
	callbacksRef.current = options
	openPanelsRef.current = openPanels

	const open = useCallback((itemIndex: number) => {
		const existingPanel = openPanelsRef.current.find((panel) => panel.itemIndex === itemIndex)
		if (existingPanel) {
			globalActivationCounter += 1
			dispatch({ type: 'activate', id: existingPanel.id, activationOrder: globalActivationCounter })
			return
		}

		globalIdCounter += 1
		globalOpenCounter += 1
		globalActivationCounter += 1
		dispatch({
			type: 'open',
			panel: {
				id: `panel-${globalIdCounter}-${itemIndex}`,
				itemIndex,
				pinned: false,
				globalOpenOrder: globalOpenCounter,
				activationOrder: globalActivationCounter,
			},
		})
		callbacksRef.current?.onOpen?.(itemIndex)
	}, [])

	const activate = useCallback((id: string) => {
		globalActivationCounter += 1
		dispatch({ type: 'activate', id, activationOrder: globalActivationCounter })
	}, [])

	const close = useCallback((id: string) => {
		const panel = openPanelsRef.current.find((entry) => entry.id === id)
		if (!panel) return

		dispatch({ type: 'close', id })
		callbacksRef.current?.onClose?.(panel.itemIndex)
	}, [])

	const closeAll = useCallback(() => {
		openPanelsRef.current.forEach((panel) => {
			callbacksRef.current?.onClose?.(panel.itemIndex)
		})
		dispatch({ type: 'closeAll' })
	}, [])

	const closeUnpinned = useCallback(() => {
		openPanelsRef.current.forEach((panel) => {
			if (!panel.pinned) callbacksRef.current?.onClose?.(panel.itemIndex)
		})
		dispatch({ type: 'closeUnpinned' })
	}, [])

	const togglePin = useCallback((id: string) => {
		dispatch({ type: 'togglePin', id })
	}, [])

	const isOpen = useCallback((itemIndex: number) => {
		return openPanelsRef.current.some((panel) => panel.itemIndex === itemIndex)
	}, [])

	return useMemo(
		() => ({
			openPanels,
			open,
			activate,
			close,
			closeAll,
			closeUnpinned,
			togglePin,
			isOpen,
		}),
		[openPanels, open, activate, close, closeAll, closeUnpinned, togglePin, isOpen],
	)
}
