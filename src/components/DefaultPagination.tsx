import type { ReactNode } from 'react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { useTrellisPaginationContext } from '../context/trellis-pagination-context'
import { IconButton } from './IconButton'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

interface DefaultPaginationProps {
	label?: ReactNode | ((vm: ReturnType<typeof useTrellisPaginationContext>) => ReactNode)
}

function parsePage(value: string): number | null {
	const trimmed = value.trim()
	if (!/^\d+$/.test(trimmed)) return null
	const parsed = Number.parseInt(trimmed, 10)
	return Number.isFinite(parsed) ? parsed : null
}

export const DefaultPagination = memo(function DefaultPagination({ label }: DefaultPaginationProps) {
	const pagination = useTrellisPaginationContext()
	const { enabled, currentPage, totalPages, hasNext, hasPrev, goToPage, next, prev } = pagination
	const displayPage = currentPage + 1
	const [pageInput, setPageInput] = useState(() => String(displayPage))

	useEffect(() => {
		setPageInput(String(displayPage))
	}, [displayPage])

	const commitInput = useCallback(() => {
		const parsed = parsePage(pageInput)
		if (parsed === null || totalPages <= 0) {
			setPageInput(String(displayPage))
			return
		}

		const clamped = Math.min(Math.max(parsed, 1), totalPages)
		goToPage(clamped - 1)
		setPageInput(String(clamped))
	}, [displayPage, goToPage, pageInput, totalPages])

	const inputWidth = useMemo(() => {
		const totalDigits = String(Math.max(1, totalPages)).length
		const currentDigits = pageInput.trim().length
		const ch = Math.max(2, totalDigits, currentDigits)
		return `calc(${ch + 0.4}ch + 7px)`
	}, [pageInput, totalPages])
	const labelNode = useMemo(() => {
		if (label === undefined || label === null || label === '') return null
		return typeof label === 'function' ? label(pagination) : label
	}, [label, pagination])

	if (!enabled || totalPages <= 1) return null

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
			{labelNode ? (
				<div style={{ fontWeight: 600, color: 'var(--rtg-fg, #1a1a1a)', userSelect: 'none', fontSize: 12 }}>
					{labelNode}
				</div>
			) : null}

			<div
				style={{
					display: 'inline-flex',
					alignItems: 'center',
					gap: 3,
					padding: 2,
					borderRadius: 'var(--rtg-border-radius, 6px)',
					border: '1px solid var(--rtg-border-color, rgba(0, 0, 0, 0.12))',
					background: 'var(--rtg-bg, #ffffff)',
					color: 'var(--rtg-fg, #1a1a1a)',
					boxShadow: 'var(--rtg-shadow, 0 4px 20px rgba(0, 0, 0, 0.08))',
					fontVariantNumeric: 'tabular-nums',
					fontSize: 12,
				}}
			>
				<IconButton disabled={!hasPrev} onClick={prev} size={22} title="Previous page">
					<ChevronLeftIcon size={12} />
				</IconButton>

				<div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '0 1px' }}>
					<input
						aria-label="Current page"
						inputMode="numeric"
						pattern="[0-9]*"
						type="text"
						value={pageInput}
						style={{
							width: inputWidth,
							minWidth: 32,
							padding: '2px 4px',
							textAlign: 'center',
							borderRadius: 4,
							border: '1px solid var(--rtg-input-border, rgba(0, 0, 0, 0.15))',
							background: 'var(--rtg-input-bg, #f5f5f5)',
							color: 'inherit',
							font: 'inherit',
							lineHeight: 1.1,
						}}
						onBlur={commitInput}
						onChange={(event) => {
							setPageInput(event.target.value)
						}}
						onKeyDown={(event) => {
							if (event.key === 'Enter') {
								commitInput()
								return
							}
							if (event.key === 'Escape') {
								setPageInput(String(displayPage))
							}
						}}
					/>
					<span style={{ opacity: 0.85 }}>{`/ ${totalPages}`}</span>
				</div>

				<IconButton disabled={!hasNext} onClick={next} size={22} title="Next page">
					<ChevronRightIcon size={12} />
				</IconButton>
			</div>
		</div>
	)
})
