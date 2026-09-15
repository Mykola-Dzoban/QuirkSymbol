import type { BoardElement } from './board';

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

/** Нормалізує довільну пару точок (drag від будь-якого кута) у прямокутник з додатними width/height. */
export function normalizeRect(x0: number, y0: number, x1: number, y1: number): Rect {
	return {
		x: Math.min(x0, x1),
		y: Math.min(y0, y1),
		width: Math.abs(x1 - x0),
		height: Math.abs(y1 - y0),
	};
}

/** Bounding box елемента у world-координатах (без урахування `angle` — досить для marquee/hit-тестів MVP). */
export function elementBounds(el: BoardElement): Rect {
	if (el.points && el.points.length >= 2) {
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;
		for (let i = 0; i < el.points.length; i += 2) {
			const px = el.x + el.points[i];
			const py = el.y + el.points[i + 1];
			if (px < minX) minX = px;
			if (py < minY) minY = py;
			if (px > maxX) maxX = px;
			if (py > maxY) maxY = py;
		}
		const pad = el.strokeWidth;
		return { x: minX - pad, y: minY - pad, width: maxX - minX + pad * 2, height: maxY - minY + pad * 2 };
	}
	return { x: el.x, y: el.y, width: el.width, height: el.height };
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
	return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function pointInRect(px: number, py: number, r: Rect): boolean {
	return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}

/** Чи повністю лежить `inner` всередині `outer` — Frame tool використовує це для "дітей" кадру (BoardCanvas). */
export function rectContains(outer: Rect, inner: Rect): boolean {
	return inner.x >= outer.x && inner.y >= outer.y && inner.x + inner.width <= outer.x + outer.width && inner.y + inner.height <= outer.y + outer.height;
}

/** Bounding box, що охоплює всі `rects` — використовує "Вирівнювання" (align відносно bbox виділення). */
export function unionBounds(rects: Rect[]): Rect {
	const minX = Math.min(...rects.map((r) => r.x));
	const minY = Math.min(...rects.map((r) => r.y));
	const maxX = Math.max(...rects.map((r) => r.x + r.width));
	const maxY = Math.max(...rects.map((r) => r.y + r.height));
	return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export type AlignMode = 'left' | 'right' | 'top' | 'bottom' | 'centerX' | 'centerY';

/** Зсув (dx,dy), який вирівнює прямокутник `b` за `mode` відносно `bbox` (bounding box усього виділення). */
export function alignOffset(b: Rect, bbox: Rect, mode: AlignMode): { dx: number; dy: number } {
	switch (mode) {
		case 'left':
			return { dx: bbox.x - b.x, dy: 0 };
		case 'right':
			return { dx: bbox.x + bbox.width - (b.x + b.width), dy: 0 };
		case 'centerX':
			return { dx: bbox.x + bbox.width / 2 - (b.x + b.width / 2), dy: 0 };
		case 'top':
			return { dx: 0, dy: bbox.y - b.y };
		case 'bottom':
			return { dx: 0, dy: bbox.y + bbox.height - (b.y + b.height) };
		case 'centerY':
			return { dx: 0, dy: bbox.y + bbox.height / 2 - (b.y + b.height / 2) };
	}
}

/**
 * Рівномірно розподіляє прямокутники вздовж осі, зберігаючи крайні позиції (перший і останній
 * лишаються на місці, проміжні розсуваються на однакову відстань між краями) — повертає зсув на
 * кожен `id`. Менше 3 елементів розподіляти нема сенсу (нема "проміжних") — повертає порожній об'єкт.
 */
export function distributeOffsets(rects: { id: string; b: Rect }[], axis: 'horizontal' | 'vertical'): Record<string, { dx: number; dy: number }> {
	if (rects.length < 3) return {};
	const key = axis === 'horizontal' ? 'x' : 'y';
	const size = axis === 'horizontal' ? 'width' : 'height';
	const sorted = [...rects].sort((a, b) => a.b[key] - b.b[key]);
	const first = sorted[0];
	const last = sorted[sorted.length - 1];
	const totalSpan = last.b[key] + last.b[size] - first.b[key];
	const totalSize = sorted.reduce((s, r) => s + r.b[size], 0);
	const gap = (totalSpan - totalSize) / (sorted.length - 1);
	const result: Record<string, { dx: number; dy: number }> = {};
	let cursor = first.b[key];
	for (const { id, b } of sorted) {
		const delta = cursor - b[key];
		result[id] = axis === 'horizontal' ? { dx: delta, dy: 0 } : { dx: 0, dy: delta };
		cursor += b[size] + gap;
	}
	return result;
}

export interface SnapResult {
	dx: number;
	dy: number;
	guideX: number | null;
	guideY: number | null;
}

/**
 * Магнітить перетягування (`movingBoxes` зсунуті на `dx,dy`) до країв/центрів `others` у межах
 * `threshold` (world-одиниці) — X і Y обробляються незалежно. Повертає скоригований зсув і
 * world-координату лінії-підказки для кожної осі, що спрацювала (або `null`, якщо не прив'язалось).
 */
export function snapMove(movingBoxes: Rect[], dx: number, dy: number, others: Rect[], threshold: number): SnapResult {
	if (movingBoxes.length === 0 || others.length === 0) return { dx, dy, guideX: null, guideY: null };
	const moved = movingBoxes.map((b) => ({ ...b, x: b.x + dx, y: b.y + dy }));
	const bbox = unionBounds(moved);
	const xCandidates = [bbox.x, bbox.x + bbox.width / 2, bbox.x + bbox.width];
	const yCandidates = [bbox.y, bbox.y + bbox.height / 2, bbox.y + bbox.height];

	let bestDx = 0;
	let bestDistX = threshold;
	let guideX: number | null = null;
	let bestDy = 0;
	let bestDistY = threshold;
	let guideY: number | null = null;

	for (const other of others) {
		for (const ox of [other.x, other.x + other.width / 2, other.x + other.width]) {
			for (const xc of xCandidates) {
				const dist = Math.abs(ox - xc);
				if (dist < bestDistX) {
					bestDistX = dist;
					bestDx = ox - xc;
					guideX = ox;
				}
			}
		}
		for (const oy of [other.y, other.y + other.height / 2, other.y + other.height]) {
			for (const yc of yCandidates) {
				const dist = Math.abs(oy - yc);
				if (dist < bestDistY) {
					bestDistY = dist;
					bestDy = oy - yc;
					guideY = oy;
				}
			}
		}
	}

	return { dx: dx + bestDx, dy: dy + bestDy, guideX, guideY };
}
