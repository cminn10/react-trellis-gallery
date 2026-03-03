import type { ReactNode, RefObject } from 'react'
import { useMemo } from 'react'

import { DEFAULT_FLOATING_PANEL } from '../core/constants'
import type { FloatingPanelDefaults, PanelHeaderAPI, PanelManagerAPI } from '../core/types'
import { FloatingPanel } from './FloatingPanel'

export interface OverlayManagerProps<T> {
	panels: PanelManagerAPI
	items: T[]
	boundaryRef: RefObject<HTMLElement | null>
	panelDefaults?: Partial<FloatingPanelDefaults>
	renderContent: (item: T, index: number) => ReactNode
	renderTitle?: (item: T, index: number) => ReactNode
	renderHeader?: (item: T, api: PanelHeaderAPI) => ReactNode
}

export function OverlayManager<T>({
	panels,
	items,
	boundaryRef,
	panelDefaults,
	renderContent,
	renderTitle,
	renderHeader,
}: OverlayManagerProps<T>) {
	const resolvedDefaults: FloatingPanelDefaults = {
		size: panelDefaults?.size ?? DEFAULT_FLOATING_PANEL.size,
		minSize: panelDefaults?.minSize ?? DEFAULT_FLOATING_PANEL.minSize,
		maxSize: panelDefaults?.maxSize ?? DEFAULT_FLOATING_PANEL.maxSize,
	}
	const orderedPanels = useMemo(() => {
		const unpinned = panels.openPanels.filter((panel) => !panel.pinned)
		const pinned = panels.openPanels.filter((panel) => panel.pinned)
		return [...unpinned, ...pinned]
	}, [panels.openPanels])

	return (
		<>
			{orderedPanels.map((panel, stackIndex) => {
				const item = items[panel.itemIndex]
				if (item === undefined) return null

				return (
					<FloatingPanel
						key={panel.id}
						boundaryRef={boundaryRef}
						defaultSize={resolvedDefaults.size}
						item={item}
						itemIndex={panel.itemIndex}
						maxSize={resolvedDefaults.maxSize}
						minSize={resolvedDefaults.minSize}
						onActivate={panels.activate}
						onClose={panels.close}
						onTogglePin={panels.togglePin}
						panelId={panel.id}
						pinned={panel.pinned}
						renderContent={renderContent}
						renderTitle={renderTitle}
						renderHeader={renderHeader}
						stackIndex={stackIndex}
					/>
				)
			})}
		</>
	)
}
