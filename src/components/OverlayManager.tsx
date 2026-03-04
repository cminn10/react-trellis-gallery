import type { ReactNode, RefObject } from 'react'
import { useMemo } from 'react'

import { DEFAULT_FLOATING_PANEL } from '../core/constants'
import type { FloatingPanelDefaults, PanelHeaderAPI, PanelManagerAPI } from '../core/types'
import { PanelLayer } from './PanelLayer'

export interface OverlayManagerProps<T> {
	panels: PanelManagerAPI
	items: T[]
	containerRef: RefObject<HTMLElement | null>
	panelBoundary: 'viewport' | RefObject<HTMLElement | null>
	panelDefaults?: Partial<FloatingPanelDefaults>
	renderContent: (item: T, index: number) => ReactNode
	renderTitle?: (item: T, index: number) => ReactNode
	renderHeader?: (item: T, api: PanelHeaderAPI) => ReactNode
}

export function OverlayManager<T>({
	panels,
	items,
	containerRef,
	panelBoundary,
	panelDefaults,
	renderContent,
	renderTitle,
	renderHeader,
}: OverlayManagerProps<T>) {
	const resolvedDefaults = useMemo<FloatingPanelDefaults>(
		() => ({
			size: panelDefaults?.size ?? DEFAULT_FLOATING_PANEL.size,
			minSize: panelDefaults?.minSize ?? DEFAULT_FLOATING_PANEL.minSize,
			maxSize: panelDefaults?.maxSize ?? DEFAULT_FLOATING_PANEL.maxSize,
		}),
		[panelDefaults],
	)
	const orderedPanels = useMemo(() => {
		const unpinned = panels.openPanels.filter((panel) => !panel.pinned)
		const pinned = panels.openPanels.filter((panel) => panel.pinned)
		return [...unpinned, ...pinned]
	}, [panels.openPanels])

	return (
		<PanelLayer
			containerRef={containerRef}
			defaults={resolvedDefaults}
			items={items}
			onActivate={panels.activate}
			onClose={panels.close}
			onTogglePin={panels.togglePin}
			orderedPanels={orderedPanels}
			panelBoundary={panelBoundary}
			renderContent={renderContent}
			renderHeader={renderHeader}
			renderTitle={renderTitle}
		/>
	)
}
