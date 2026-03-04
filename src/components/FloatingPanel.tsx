import * as floatingPanel from '@zag-js/floating-panel'
import { normalizeProps, useMachine } from '@zag-js/react'
import type { CSSProperties, ReactNode } from 'react'
import { memo, useEffect, useMemo, useState } from 'react'

import type { PanelHeaderAPI, Point, Size } from '../core/types'
import { IconButton } from './IconButton'
import { CloseIcon, MaximizeIcon, MinimizeIcon, PinIcon, RestoreIcon, UnpinIcon } from './icons'

interface FloatingPanelProps<T> {
	item: T
	itemIndex: number
	panelId: string
	pinned: boolean
	defaultSize: Size
	minSize: Size
	maxSize?: Size
	defaultPosition: Point
	getBoundaryEl?: () => HTMLElement | null
	renderContent: (item: T, index: number) => ReactNode
	renderTitle?: (item: T, index: number) => ReactNode
	renderHeader?: (item: T, api: PanelHeaderAPI) => ReactNode
	onActivate: (id: string) => void
	onClose: (id: string) => void
	onTogglePin: (id: string) => void
}

const RESIZE_AXES: floatingPanel.ResizeTriggerAxis[] = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw']
const RESIZE_HANDLE_THICKNESS = 10
const RESIZE_CORNER_SIZE = 16
const VISUALLY_HIDDEN_STYLE: CSSProperties = {
	position: 'absolute',
	width: 1,
	height: 1,
	padding: 0,
	margin: -1,
	overflow: 'hidden',
	clip: 'rect(0, 0, 0, 0)',
	whiteSpace: 'nowrap',
	border: 0,
}

function getResizeHandleStyle(axis: floatingPanel.ResizeTriggerAxis): CSSProperties {
	switch (axis) {
		case 'n':
			return { top: -RESIZE_HANDLE_THICKNESS / 2, left: 0, right: 0, height: RESIZE_HANDLE_THICKNESS }
		case 'e':
			return { top: 0, bottom: 0, right: -RESIZE_HANDLE_THICKNESS / 2, width: RESIZE_HANDLE_THICKNESS }
		case 's':
			return { bottom: -RESIZE_HANDLE_THICKNESS / 2, left: 0, right: 0, height: RESIZE_HANDLE_THICKNESS }
		case 'w':
			return { top: 0, bottom: 0, left: -RESIZE_HANDLE_THICKNESS / 2, width: RESIZE_HANDLE_THICKNESS }
		case 'ne':
			return {
				top: -RESIZE_CORNER_SIZE / 2,
				right: -RESIZE_CORNER_SIZE / 2,
				width: RESIZE_CORNER_SIZE,
				height: RESIZE_CORNER_SIZE,
			}
		case 'nw':
			return {
				top: -RESIZE_CORNER_SIZE / 2,
				left: -RESIZE_CORNER_SIZE / 2,
				width: RESIZE_CORNER_SIZE,
				height: RESIZE_CORNER_SIZE,
			}
		case 'se':
			return {
				bottom: -RESIZE_CORNER_SIZE / 2,
				right: -RESIZE_CORNER_SIZE / 2,
				width: RESIZE_CORNER_SIZE,
				height: RESIZE_CORNER_SIZE,
			}
		case 'sw':
			return {
				bottom: -RESIZE_CORNER_SIZE / 2,
				left: -RESIZE_CORNER_SIZE / 2,
				width: RESIZE_CORNER_SIZE,
				height: RESIZE_CORNER_SIZE,
			}
		default:
			return {}
	}
}

function FloatingPanelInner<T>({
	item,
	itemIndex,
	panelId,
	pinned,
	defaultSize,
	minSize,
	maxSize,
	defaultPosition,
	getBoundaryEl,
	renderContent,
	renderTitle,
	renderHeader,
	onActivate,
	onClose,
	onTogglePin,
}: FloatingPanelProps<T>) {
	const [stage, setStage] = useState<floatingPanel.Stage>('default')
	const service = useMachine(floatingPanel.machine, {
		id: panelId,
		defaultOpen: true,
		strategy: 'fixed',
		allowOverflow: false,
		persistRect: true,
		defaultPosition,
		getBoundaryEl,
		closeOnEscape: true,
		defaultSize,
		minSize,
		maxSize,
		onOpenChange: ({ open }) => {
			if (!open) onClose(panelId)
		},
		onStageChange: ({ stage: nextStage }) => {
			setStage(nextStage)
		},
	})

	const api = floatingPanel.connect(service, normalizeProps)
	const minimize = api.minimize
	const maximize = api.maximize
	const restore = api.restore
	const titleProps = api.getTitleProps()

	const panelHeaderApi = useMemo<PanelHeaderAPI>(
		() => ({
			close: () => onClose(panelId),
			pin: () => {
				if (!pinned) onTogglePin(panelId)
			},
			unpin: () => {
				if (pinned) onTogglePin(panelId)
			},
			togglePin: () => onTogglePin(panelId),
			titleProps: titleProps as Record<string, unknown>,
			isPinned: pinned,
			minimize: () => minimize(),
			maximize: () => maximize(),
			restore: () => restore(),
			isMinimized: stage === 'minimized',
			isMaximized: stage === 'maximized',
		}),
		[maximize, minimize, onClose, onTogglePin, panelId, pinned, restore, stage, titleProps],
	)

	const positionerProps = api.getPositionerProps()
	const contentProps = api.getContentProps()
	const dragTriggerProps = api.getDragTriggerProps()
	const headerProps = api.getHeaderProps()
	const bodyProps = api.getBodyProps()
	const resolvedTitle = renderTitle ? renderTitle(item, itemIndex) : `Item ${itemIndex + 1}`
	const titleStyle: CSSProperties = {
		...(titleProps.style as CSSProperties | undefined),
		fontSize: 12,
		fontWeight: 600,
		overflow: 'hidden',
		textOverflow: 'ellipsis',
	}
	const isMinimized = stage === 'minimized'
	const isMaximized = stage === 'maximized'

	useEffect(() => {
		if (typeof document === 'undefined') return
		const contentId = contentProps.id
		if (!contentId) return
		const frame = requestAnimationFrame(() => {
			const content = document.getElementById(contentId)
			if (content instanceof HTMLElement) content.focus({ preventScroll: true })
		})
		return () => {
			cancelAnimationFrame(frame)
		}
	}, [contentProps.id])

	useEffect(() => {
		return () => {
			if (typeof document === 'undefined') return
			const cell = document.querySelector(`[data-rtg-cell][data-rtg-index="${itemIndex}"]`)
			if (cell instanceof HTMLElement) cell.focus({ preventScroll: true })
		}
	}, [itemIndex])

	return (
		<div
			{...positionerProps}
			style={{
				...(positionerProps.style ?? {}),
				pointerEvents: 'auto',
			}}
		>
			<div
				{...contentProps}
				style={{
					...(contentProps.style ?? {}),
					position: 'relative',
					border: '1px solid var(--rtg-border-color, rgba(0, 0, 0, 0.12))',
					borderRadius: 'var(--rtg-border-radius, 10px)',
					background: 'var(--rtg-bg, #ffffff)',
					color: 'var(--rtg-fg, #1a1a1a)',
					boxShadow: 'var(--rtg-shadow, 0 4px 20px rgba(0, 0, 0, 0.08))',
					overflow: 'hidden',
				}}
				onPointerDownCapture={(event) => {
					// Keep non-pinned panel topmost for click/drag interactions.
					if (pinned) return
					onActivate(panelId)
					event.currentTarget.focus({ preventScroll: true })
				}}
			>
				<div {...dragTriggerProps}>
					<div
						{...headerProps}
						style={{
							...(headerProps.style ?? {}),
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 4,
							padding: '4px 6px',
							borderBottom: '1px solid var(--rtg-header-border-color, rgba(0, 0, 0, 0.08))',
							cursor: 'move',
							userSelect: 'none',
						}}
					>
						{renderHeader ? (
							<>
								{renderHeader(item, panelHeaderApi)}
								<div {...titleProps} style={VISUALLY_HIDDEN_STYLE}>
									{resolvedTitle}
								</div>
							</>
						) : (
							<>
								<div {...titleProps} style={titleStyle}>
									{resolvedTitle}
								</div>
								<div style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}>
									<IconButton size={22} title={pinned ? 'Unpin panel' : 'Pin panel'} onClick={panelHeaderApi.togglePin}>
										{pinned ? <UnpinIcon size={12} /> : <PinIcon size={12} />}
									</IconButton>
									<IconButton
										size={22}
										title={isMinimized ? 'Restore panel' : 'Minimize panel'}
										{...api.getStageTriggerProps({
											stage: isMinimized ? 'default' : 'minimized',
										})}
									>
										{isMinimized ? <RestoreIcon size={12} /> : <MinimizeIcon size={12} />}
									</IconButton>
									<IconButton
										size={22}
										title={isMaximized ? 'Restore panel' : 'Maximize panel'}
										{...api.getStageTriggerProps({
											stage: isMaximized ? 'default' : 'maximized',
										})}
									>
										{isMaximized ? <RestoreIcon size={12} /> : <MaximizeIcon size={12} />}
									</IconButton>
									<IconButton size={22} title="Close panel" onClick={panelHeaderApi.close}>
										<CloseIcon size={12} />
									</IconButton>
								</div>
							</>
						)}
					</div>
				</div>

				<div
					{...bodyProps}
					style={{
						...(bodyProps.style ?? {}),
						width: '100%',
						height: '100%',
					}}
				>
					{renderContent(item, itemIndex)}
				</div>

				{RESIZE_AXES.map((axis) => {
					const resizeProps = api.getResizeTriggerProps({ axis })
					return (
						<div
							key={axis}
							{...resizeProps}
							style={{
								...(resizeProps.style ?? {}),
								...getResizeHandleStyle(axis),
								zIndex: 3,
							}}
						/>
					)
				})}
			</div>
		</div>
	)
}

export const FloatingPanel = memo(FloatingPanelInner) as typeof FloatingPanelInner
