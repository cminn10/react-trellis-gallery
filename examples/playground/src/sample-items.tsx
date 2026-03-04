import type { CSSProperties, ReactNode } from 'react'

export interface SampleItem {
	id: number
	label: string
	color: string
	description: string
	category: 'stone' | 'marble' | 'slate' | 'granite' | 'quartz'
	createdAt: Date
}

const cardStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	justifyContent: 'center',
	gap: 8,
	width: '100%',
	height: '100%',
	borderRadius: 10,
	border: '1px solid oklch(0.923 0.003 48.717 / 90%)',
	color: 'oklch(0.216 0.006 56.043)',
	padding: 12,
	textAlign: 'center',
	boxShadow: 'inset 0 1px 0 oklch(1 0 0 / 60%)',
}

const expandedStyle: CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	gap: 12,
	width: '100%',
	height: '100%',
	padding: 16,
	boxSizing: 'border-box',
	background: 'oklch(1 0 0)',
	color: 'oklch(0.216 0.006 56.043)',
	overflow: 'auto',
}

const metaTextStyle: CSSProperties = {
	margin: 0,
	fontSize: 12,
	color: 'oklch(0.553 0.013 58.071)',
}

const categories: SampleItem['category'][] = ['stone', 'marble', 'slate', 'granite', 'quartz']

const descriptionFragments = [
	'Warm neutral tone with subtle texture.',
	'High-contrast veins and polished finish.',
	'Matte surface ideal for low-glare layouts.',
	'Dense mineral pattern with deep accents.',
	'Lightweight composition for modern spaces.',
]

export function generateItems(count: number): SampleItem[] {
	const safeCount = Math.max(0, Math.floor(count))
	const baseDateMs = Date.UTC(2024, 0, 1)
	return Array.from({ length: safeCount }, (_, index) => {
		const lightness = 0.93 - (index % 7) * 0.035
		const chroma = 0.008 + ((index * 3) % 4) * 0.004
		const hue = 52 + ((index * 19) % 26) - 13
		const color = `oklch(${lightness.toFixed(3)} ${chroma.toFixed(3)} ${hue.toFixed(3)})`
		const category = categories[index % categories.length] ?? 'stone'
		const description = descriptionFragments[index % descriptionFragments.length] ?? descriptionFragments[0] ?? ''
		const createdAt = new Date(baseDateMs + index * 86_400_000)
		return {
			id: index + 1,
			label: `Item ${index + 1}`,
			color,
			description,
			category,
			createdAt,
		}
	})
}

export function renderGridItem(item: SampleItem, index: number): ReactNode {
	return (
		<div style={{ ...cardStyle, background: item.color }}>
			<strong style={{ fontSize: 13 }}>{item.label}</strong>
			<p style={metaTextStyle}>{item.category}</p>
			<p style={metaTextStyle}>Index: {index}</p>
		</div>
	)
}

export function renderExpandedItem(item: SampleItem, index: number): ReactNode {
	return (
		<div style={expandedStyle}>
			<h3 style={{ margin: 0 }}>{item.label}</h3>
			<p style={metaTextStyle}>ID: {item.id}</p>
			<p style={metaTextStyle}>Category: {item.category}</p>
			<p style={metaTextStyle}>Created: {item.createdAt.toISOString().slice(0, 10)}</p>
			<p style={metaTextStyle}>{item.description}</p>
			<p style={metaTextStyle}>Index: {index}</p>
			<div
				style={{
					width: 80,
					height: 24,
					borderRadius: 6,
					border: '1px solid oklch(0.923 0.003 48.717)',
					background: item.color,
				}}
			/>
			<p style={metaTextStyle}>
				Use the cell corner triangle to open panels. In this demo, double-click or Shift+click also opens. Drag the
				header to move.
			</p>
		</div>
	)
}
