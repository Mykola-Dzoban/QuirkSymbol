export const GRID_SIZE = 10;

/** Округлює значення до найближчої лінії сітки розміром `grid`. */
export function snapValue(value: number, grid: number = GRID_SIZE): number {
	return Math.round(value / grid) * grid;
}

export function snapPoint(x: number, y: number, enabled: boolean, grid: number = GRID_SIZE): { x: number; y: number } {
	if (!enabled) return { x, y };
	return { x: snapValue(x, grid), y: snapValue(y, grid) };
}
