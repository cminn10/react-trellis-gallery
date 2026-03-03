import type { ReactNode } from 'react'
import { createContext, createElement, useContext } from 'react'

import type { PaginationVM } from '../core/types'

const TrellisPaginationContext = createContext<PaginationVM | null>(null)

interface TrellisPaginationProviderProps {
	value: PaginationVM
	children: ReactNode
}

export function TrellisPaginationProvider({ value, children }: TrellisPaginationProviderProps) {
	return createElement(TrellisPaginationContext.Provider, { value }, children)
}

export function useTrellisPaginationContext(): PaginationVM {
	const value = useContext(TrellisPaginationContext)
	if (!value) {
		throw new Error('useTrellisPaginationContext must be used inside TrellisPaginationProvider')
	}
	return value
}
