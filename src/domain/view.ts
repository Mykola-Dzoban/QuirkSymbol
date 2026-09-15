/** Стан пан/зуму канвасу — переводить world-координати фігур у екранні пікселі й навпаки. */
export interface View {
	offsetX: number;
	offsetY: number;
	scale: number;
}

export const MIN_SCALE = 0.1;
export const MAX_SCALE = 5;

export function toScreen(worldX: number, worldY: number, view: View): { x: number; y: number } {
	return { x: worldX * view.scale + view.offsetX, y: worldY * view.scale + view.offsetY };
}

export function toWorld(screenX: number, screenY: number, view: View): { x: number; y: number } {
	return { x: (screenX - view.offsetX) / view.scale, y: (screenY - view.offsetY) / view.scale };
}

export function clampScale(scale: number): number {
	return Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));
}

/** Зумить навколо точки `(pointerX, pointerY)` (в екранних координатах), а не навколо (0,0). */
export function zoomAt(view: View, pointerX: number, pointerY: number, scaleFactor: number): View {
	const nextScale = clampScale(view.scale * scaleFactor);
	const worldPoint = toWorld(pointerX, pointerY, view);
	return {
		scale: nextScale,
		offsetX: pointerX - worldPoint.x * nextScale,
		offsetY: pointerY - worldPoint.y * nextScale,
	};
}
