import type { BoardElement } from './board';
import { elementBounds, unionBounds } from './geometry';

const EXPORT_PADDING = 24;

function escapeXml(s: string): string {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** `translate(x y)` + (за наявності) `rotate(angle)` навколо ЛОКАЛЬНОГО (0,0) — так само, як Konva
 *  обертає вузол навколо власних `x,y` до застосування внутрішньої геометрії фігури. */
function groupTransform(x: number, y: number, angle: number): string {
	return `translate(${x} ${y})${angle ? ` rotate(${angle})` : ''}`;
}

function pointsToAttr(points: number[]): string {
	const parts: string[] = [];
	for (let i = 0; i < points.length; i += 2) parts.push(`${points[i]},${points[i + 1]}`);
	return parts.join(' ');
}

/** Трикутник вістря стрілки для останнього відрізка `points` — той самий розрахунок, що дає Konva `Arrow` (pointerLength/Width=10). */
function arrowHeadPoints(points: number[], pointerLength = 10, pointerWidth = 10): string {
	const n = points.length;
	if (n < 4) return '';
	const x2 = points[n - 2];
	const y2 = points[n - 1];
	const x1 = points[n - 4];
	const y1 = points[n - 3];
	const dx = x2 - x1;
	const dy = y2 - y1;
	const len = Math.hypot(dx, dy) || 1;
	const ux = dx / len;
	const uy = dy / len;
	const bx = x2 - ux * pointerLength;
	const by = y2 - uy * pointerLength;
	const px = -uy;
	const py = ux;
	const half = pointerWidth / 2;
	return `${x2},${y2} ${bx + px * half},${by + py * half} ${bx - px * half},${by - py * half}`;
}

/**
 * Катмул-Ром → кубічний Безьє — наближення того самого візуального згладжування, що дає Konva
 * `Line tension=0.4 bezier` для інструмента "Малювання" (не побітово ідентично, але дуже близько).
 */
function smoothedPath(points: number[]): string {
	const pts: { x: number; y: number }[] = [];
	for (let i = 0; i < points.length; i += 2) pts.push({ x: points[i], y: points[i + 1] });
	if (pts.length === 0) return '';
	if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
	let d = `M ${pts[0].x} ${pts[0].y}`;
	for (let i = 0; i < pts.length - 1; i++) {
		const p0 = pts[i - 1] ?? pts[i];
		const p1 = pts[i];
		const p2 = pts[i + 1];
		const p3 = pts[i + 2] ?? p2;
		const cp1x = p1.x + (p2.x - p0.x) / 6;
		const cp1y = p1.y + (p2.y - p0.y) / 6;
		const cp2x = p2.x - (p3.x - p1.x) / 6;
		const cp2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
	}
	return d;
}

/** Один `BoardElement` → SVG-розмітка в тому самому візуальному стилі, що й Konva-рендер (`ElementShape.tsx`). */
export function elementToSvg(el: BoardElement): string {
	const opacity = el.opacity;
	switch (el.type) {
		case 'rectangle':
			return `<rect x="0" y="0" width="${el.width}" height="${el.height}" rx="${el.cornerRadius ?? 6}" stroke="${el.stroke}" fill="${el.fill}" stroke-width="${el.strokeWidth}" stroke-linejoin="round" opacity="${opacity}" transform="${groupTransform(el.x, el.y, el.angle)}" />`;
		case 'ellipse': {
			const rx = Math.abs(el.width) / 2;
			const ry = Math.abs(el.height) / 2;
			return `<ellipse cx="0" cy="0" rx="${rx}" ry="${ry}" stroke="${el.stroke}" fill="${el.fill}" stroke-width="${el.strokeWidth}" opacity="${opacity}" transform="${groupTransform(el.x + el.width / 2, el.y + el.height / 2, el.angle)}" />`;
		}
		case 'diamond': {
			const w = el.width;
			const h = el.height;
			const pts = pointsToAttr([w / 2, 0, w, h / 2, w / 2, h, 0, h / 2]);
			return `<polygon points="${pts}" stroke="${el.stroke}" fill="${el.fill}" stroke-width="${el.strokeWidth}" stroke-linejoin="round" opacity="${opacity}" transform="${groupTransform(el.x, el.y, el.angle)}" />`;
		}
		case 'arrow': {
			const pts = el.points ?? [0, 0, el.width, el.height];
			return (
				`<g stroke="${el.stroke}" fill="none" stroke-width="${el.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" transform="${groupTransform(el.x, el.y, el.angle)}">` +
				`<polyline points="${pointsToAttr(pts)}" />` +
				`<polygon points="${arrowHeadPoints(pts)}" fill="${el.stroke}" stroke="none" />` +
				`</g>`
			);
		}
		case 'line': {
			const pts = el.points ?? [0, 0, el.width, el.height];
			return `<polyline points="${pointsToAttr(pts)}" stroke="${el.stroke}" fill="none" stroke-width="${el.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" transform="${groupTransform(el.x, el.y, el.angle)}" />`;
		}
		case 'draw':
			return `<path d="${smoothedPath(el.points ?? [])}" stroke="${el.stroke}" fill="none" stroke-width="${el.strokeWidth}" stroke-linecap="round" stroke-linejoin="round" opacity="${opacity}" transform="${groupTransform(el.x, el.y, el.angle)}" />`;
		case 'text': {
			const fontSize = el.fontSize ?? 20;
			return `<text x="0" y="${fontSize * 0.8}" font-size="${fontSize}" font-family="Inter, sans-serif" fill="${el.stroke}" opacity="${opacity}" transform="${groupTransform(el.x, el.y, el.angle)}">${escapeXml(el.text ?? '')}</text>`;
		}
		default:
			return '';
	}
}

/** Повний SVG-документ для видимих елементів — viewBox по bounding box + той самий відступ, що й PNG-експорт. */
export function elementsToSvg(elements: BoardElement[]): string {
	if (elements.length === 0) {
		return `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"></svg>`;
	}
	const bbox = unionBounds(elements.map(elementBounds));
	const minX = bbox.x - EXPORT_PADDING;
	const minY = bbox.y - EXPORT_PADDING;
	const width = bbox.width + EXPORT_PADDING * 2;
	const height = bbox.height + EXPORT_PADDING * 2;
	const body = elements.map(elementToSvg).join('\n');
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}">\n${body}\n</svg>`;
}
