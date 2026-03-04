export function clampPage(page: number, totalPages: number): number {
	if (totalPages <= 0) return 0
	return Math.min(Math.max(0, Math.floor(page)), totalPages - 1)
}
