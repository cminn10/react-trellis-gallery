import type { SVGProps } from 'react'

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'height' | 'width'> {
	size?: number
}

function BaseIcon({ size = 16, children, ...props }: IconProps) {
	return (
		<svg
			aria-hidden="true"
			fill="none"
			height={size}
			stroke="currentColor"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.8}
			viewBox="0 0 24 24"
			width={size}
			{...props}
		>
			{children}
		</svg>
	)
}

export function ChevronLeftIcon(props: IconProps) {
	return (
		<BaseIcon {...props}>
			<path d="M15 18l-6-6 6-6" />
		</BaseIcon>
	)
}

export function ChevronRightIcon(props: IconProps) {
	return (
		<BaseIcon {...props}>
			<path d="M9 18l6-6-6-6" />
		</BaseIcon>
	)
}

export function PinIcon(props: IconProps) {
	return (
		<BaseIcon {...props}>
			<path d="M8 4h8l-1.7 4.7v4.3l2 2v1H7.7v-1l2-2V8.7L8 4z" />
			<path d="M12 16v4" />
		</BaseIcon>
	)
}

export function UnpinIcon(props: IconProps) {
	return (
		<BaseIcon {...props}>
			<path d="M4 4l16 16" />
			<path d="M8 4h8l-1.7 4.7v4.3l2 2v1H7.7v-1l2-2V8.7L8 4z" />
			<path d="M12 16v4" />
		</BaseIcon>
	)
}

export function MinimizeIcon(props: IconProps) {
	return (
		<BaseIcon {...props}>
			<path d="M6 12h12" />
		</BaseIcon>
	)
}

export function MaximizeIcon(props: IconProps) {
	return (
		<BaseIcon {...props}>
			<rect height="10" rx="1.5" width="10" x="7" y="7" />
		</BaseIcon>
	)
}

export function RestoreIcon(props: IconProps) {
	return (
		<BaseIcon {...props}>
			<rect height="8" rx="1.25" width="8" x="9" y="9" />
			<path d="M7 15H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1" />
		</BaseIcon>
	)
}

export function CloseIcon(props: IconProps) {
	return (
		<BaseIcon {...props}>
			<path d="M6 6l12 12" />
			<path d="M18 6L6 18" />
		</BaseIcon>
	)
}
