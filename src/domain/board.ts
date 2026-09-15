import { nanoid } from 'nanoid';

/**
 * Інструмент, обраний у Toolbar. `select`/`pan`/`comment` не створюють елементів фігур. `image` теж
 * сюди не належить у сенсі "активного тулу" — зображення вставляються одноразовою дією (файл/paste),
 * а не drag-малюванням, тож `Toolbar` ніколи не викликає `setTool('image')`. Він у `Tool` лише щоб
 * `ElementType` (нижче) природно включав його через `Exclude`.
 */
export type Tool = 'select' | 'rectangle' | 'ellipse' | 'diamond' | 'arrow' | 'line' | 'draw' | 'text' | 'frame' | 'image' | 'eraser' | 'pan' | 'comment';

export type ElementType = Exclude<Tool, 'select' | 'eraser' | 'pan' | 'comment'>;

/**
 * Одна фігура на дошці — документ у `projects/{id}/elements/{elementId}`.
 * `x,y,width,height` — bounding box у world-координатах (до застосування `angle`).
 * `points` — відносні до `x,y` координати для line/arrow/draw (пари `[x0,y0,x1,y1,...]`).
 */
export interface BoardElement {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	width: number;
	height: number;
	angle: number;
	points?: number[];
	text?: string;
	/** Стиснене зображення як data URI (`type === 'image'`) — див. `utils/imageCompress.ts`. */
	src?: string;
	stroke: string;
	fill: string;
	strokeWidth: number;
	opacity: number;
	cornerRadius?: number;
	fontSize?: number;
	/** Спільний id для елементів, згрупованих через "Групувати" (Ctrl+G) — клік по одному виділяє всіх. */
	groupId?: string;
	zIndex: number;
	/** Soft-delete — щоб realtime-мердж і undo відрізняли "видалено" від "ще не долетіло". */
	deleted: boolean;
	updatedAt: number;
	updatedByUid: string;
	/** Інкрементується на кожен запис — echo-фільтр для локального dictionary-мерджу. */
	version: number;
}

export const DEFAULT_STROKE = '#1E1B2E';
export const DEFAULT_FILL = 'transparent';
export const DEFAULT_STROKE_WIDTH = 2;

export function newElementId(): string {
	return nanoid(10);
}

/** Створює новий елемент базового вигляду для типу `type` у точці `(x, y)` з нульовими розмірами. */
export function createElement(type: ElementType, x: number, y: number, updatedByUid: string, zIndex: number): BoardElement {
	return {
		id: newElementId(),
		type,
		x,
		y,
		width: 0,
		height: 0,
		angle: 0,
		points: type === 'line' || type === 'arrow' || type === 'draw' ? [0, 0, 0, 0] : undefined,
		text: type === 'text' ? '' : type === 'frame' ? 'Кадр' : undefined,
		stroke: DEFAULT_STROKE,
		fill: DEFAULT_FILL,
		strokeWidth: DEFAULT_STROKE_WIDTH,
		opacity: 1,
		cornerRadius: type === 'rectangle' ? 6 : undefined,
		fontSize: type === 'text' ? 20 : undefined,
		zIndex,
		deleted: false,
		updatedAt: Date.now(),
		updatedByUid,
		version: 1,
	};
}

/** Зображення вставляється готовим (уже стиснене на клієнті), не drag-малюванням — центроване в `(centerX, centerY)`. */
export function createImageElement(
	src: string,
	width: number,
	height: number,
	centerX: number,
	centerY: number,
	updatedByUid: string,
	zIndex: number,
): BoardElement {
	return {
		id: newElementId(),
		type: 'image',
		x: centerX - width / 2,
		y: centerY - height / 2,
		width,
		height,
		angle: 0,
		src,
		stroke: DEFAULT_STROKE,
		fill: DEFAULT_FILL,
		strokeWidth: DEFAULT_STROKE_WIDTH,
		opacity: 1,
		zIndex,
		deleted: false,
		updatedAt: Date.now(),
		updatedByUid,
		version: 1,
	};
}

export function touchElement(el: BoardElement, updatedByUid: string): BoardElement {
	return { ...el, updatedAt: Date.now(), updatedByUid, version: el.version + 1 };
}

/** Видимі (не-видалені) елементи, відсортовані для рендеру за z-порядком. */
export function visibleElements(elements: Record<string, BoardElement>): BoardElement[] {
	return Object.values(elements)
		.filter((el) => !el.deleted)
		.sort((a, b) => a.zIndex - b.zIndex);
}

export function nextZIndex(elements: Record<string, BoardElement>): number {
	let max = 0;
	for (const el of Object.values(elements)) if (el.zIndex > max) max = el.zIndex;
	return max + 1;
}

/** Id елемента `id` разом з усіма іншими видимими елементами тієї ж групи (або лише сам `id`, якщо не в групі). */
export function groupMembers(elements: Record<string, BoardElement>, id: string): string[] {
	const el = elements[id];
	if (!el || !el.groupId) return [id];
	const groupId = el.groupId;
	return Object.values(elements)
		.filter((e) => !e.deleted && e.groupId === groupId)
		.map((e) => e.id);
}
