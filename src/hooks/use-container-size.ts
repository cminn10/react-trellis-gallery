import type { RefObject } from 'react'
import { useEffect, useLayoutEffect, useState } from 'react'

import type { ContainerSize } from '../core/types'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

export function useContainerSize(ref: RefObject<HTMLElement | null>): ContainerSize {
	const [size, setSize] = useState<ContainerSize>({ width: 0, height: 0 })

	useIsomorphicLayoutEffect(() => {
		const element = ref.current
		if (!element) return

		const rect = element.getBoundingClientRect()
		setSize({ width: rect.width, height: rect.height })
	}, [ref])

	useEffect(() => {
		const element = ref.current
		if (!element || typeof ResizeObserver === 'undefined') return

		let frameId = 0
		const observer = new ResizeObserver((entries) => {
			const entry = entries[0]
			if (!entry) return

			const { width, height } = entry.contentRect
			cancelAnimationFrame(frameId)
			frameId = requestAnimationFrame(() => {
				setSize((prev) => {
					if (prev.width === width && prev.height === height) return prev
					return { width, height }
				})
			})
		})

		observer.observe(element)

		return () => {
			cancelAnimationFrame(frameId)
			observer.disconnect()
		}
	}, [ref])

	return size
}
