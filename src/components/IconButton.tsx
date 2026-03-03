import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'
import { useState } from 'react'

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
	title: string
	children: ReactNode
	size?: number
}

export function IconButton({
	title,
	children,
	disabled,
	onPointerEnter,
	onPointerLeave,
	onPointerDown,
	onPointerUp,
	onPointerCancel,
	style,
	size = 24,
	...props
}: IconButtonProps) {
	const [hovered, setHovered] = useState(false)
	const [active, setActive] = useState(false)

	const resolvedBackground = active
		? 'var(--rtg-button-active-bg, rgba(0, 0, 0, 0.1))'
		: hovered
			? 'var(--rtg-button-hover-bg, rgba(0, 0, 0, 0.06))'
			: 'transparent'

	const baseStyle: CSSProperties = {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: size,
		height: size,
		padding: 0,
		border: '1px solid var(--rtg-border-color, rgba(0, 0, 0, 0.12))',
		borderRadius: 'var(--rtg-border-radius, 7px)',
		background: resolvedBackground,
		color: 'inherit',
		cursor: disabled ? 'not-allowed' : 'pointer',
		opacity: disabled ? 'var(--rtg-button-disabled-opacity, 0.35)' : 1,
		transition: 'background-color 120ms ease',
	}

	return (
		<button
			{...props}
			aria-label={props['aria-label'] ?? title}
			disabled={disabled}
			title={title}
			type="button"
			style={{
				...baseStyle,
				...style,
			}}
			onPointerEnter={(event) => {
				setHovered(true)
				onPointerEnter?.(event)
			}}
			onPointerLeave={(event) => {
				setHovered(false)
				setActive(false)
				onPointerLeave?.(event)
			}}
			onPointerDown={(event) => {
				setActive(true)
				onPointerDown?.(event)
			}}
			onPointerUp={(event) => {
				setActive(false)
				onPointerUp?.(event)
			}}
			onPointerCancel={(event) => {
				setActive(false)
				onPointerCancel?.(event)
			}}
		>
			{children}
		</button>
	)
}
