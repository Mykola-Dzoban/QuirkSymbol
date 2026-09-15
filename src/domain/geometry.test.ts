import { describe, expect, it } from 'vitest';
import type { BoardElement } from './board';
import { alignOffset, distributeOffsets, elementBounds, normalizeRect, pointInRect, rectContains, rectsIntersect, snapMove, unionBounds } from './geometry';

function rectEl(overrides: Partial<BoardElement> = {}): BoardElement {
	return {
		id: 'a',
		type: 'rectangle',
		x: 10,
		y: 10,
		width: 20,
		height: 30,
		angle: 0,
		stroke: '#000',
		fill: 'transparent',
		strokeWidth: 2,
		opacity: 1,
		zIndex: 1,
		deleted: false,
		updatedAt: 0,
		updatedByUid: 'u1',
		version: 1,
		...overrides,
	};
}

describe('normalizeRect', () => {
	it('normalizes a drag from bottom-right to top-left into positive width/height', () => {
		expect(normalizeRect(50, 50, 10, 20)).toEqual({ x: 10, y: 20, width: 40, height: 30 });
	});

	it('handles a zero-size drag', () => {
		expect(normalizeRect(5, 5, 5, 5)).toEqual({ x: 5, y: 5, width: 0, height: 0 });
	});
});

describe('elementBounds', () => {
	it('returns x/y/width/height directly for box-shaped elements', () => {
		expect(elementBounds(rectEl())).toEqual({ x: 10, y: 10, width: 20, height: 30 });
	});

	it('derives bounds from points for line-like elements, padded by strokeWidth', () => {
		const el = rectEl({ type: 'line', x: 0, y: 0, points: [0, 0, 10, 20], strokeWidth: 4 });
		expect(elementBounds(el)).toEqual({ x: -4, y: -4, width: 18, height: 28 });
	});
});

describe('rectsIntersect', () => {
	it('detects overlapping rects', () => {
		expect(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
	});

	it('detects non-overlapping rects', () => {
		expect(rectsIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: 20, width: 10, height: 10 })).toBe(false);
	});
});

describe('pointInRect', () => {
	it('is true for a point inside the rect, including the boundary', () => {
		const r = { x: 0, y: 0, width: 10, height: 10 };
		expect(pointInRect(5, 5, r)).toBe(true);
		expect(pointInRect(10, 10, r)).toBe(true);
	});

	it('is false for a point outside the rect', () => {
		expect(pointInRect(11, 5, { x: 0, y: 0, width: 10, height: 10 })).toBe(false);
	});
});

describe('unionBounds', () => {
	it('covers all given rects', () => {
		expect(unionBounds([{ x: 0, y: 0, width: 10, height: 10 }, { x: 20, y: -5, width: 10, height: 5 }])).toEqual({
			x: 0,
			y: -5,
			width: 30,
			height: 15,
		});
	});
});

describe('alignOffset', () => {
	const bbox = { x: 0, y: 0, width: 100, height: 50 };

	it('left aligns a rect to the bbox left edge', () => {
		expect(alignOffset({ x: 40, y: 10, width: 20, height: 10 }, bbox, 'left')).toEqual({ dx: -40, dy: 0 });
	});

	it('right aligns a rect to the bbox right edge', () => {
		expect(alignOffset({ x: 40, y: 10, width: 20, height: 10 }, bbox, 'right')).toEqual({ dx: 40, dy: 0 });
	});

	it('centerX aligns a rect to the bbox horizontal center', () => {
		expect(alignOffset({ x: 0, y: 10, width: 20, height: 10 }, bbox, 'centerX')).toEqual({ dx: 40, dy: 0 });
	});

	it('top/bottom/centerY move only y', () => {
		const b = { x: 10, y: 40, width: 10, height: 10 };
		expect(alignOffset(b, bbox, 'top')).toEqual({ dx: 0, dy: -40 });
		expect(alignOffset(b, bbox, 'bottom')).toEqual({ dx: 0, dy: 0 });
		expect(alignOffset(b, bbox, 'centerY')).toEqual({ dx: 0, dy: -20 });
	});
});

describe('distributeOffsets', () => {
	it('returns nothing for fewer than 3 rects', () => {
		expect(distributeOffsets([{ id: 'a', b: { x: 0, y: 0, width: 10, height: 10 } }], 'horizontal')).toEqual({});
	});

	it('evenly spaces the middle rect between the outer two, keeping the ends fixed', () => {
		const rects = [
			{ id: 'a', b: { x: 0, y: 0, width: 10, height: 10 } },
			{ id: 'b', b: { x: 15, y: 0, width: 10, height: 10 } },
			{ id: 'c', b: { x: 90, y: 0, width: 10, height: 10 } },
		];
		const offsets = distributeOffsets(rects, 'horizontal');
		expect(offsets.a).toEqual({ dx: 0, dy: 0 });
		expect(offsets.c).toEqual({ dx: 0, dy: 0 });
		// span 0..100, 3 items of width 10 (30 total), remaining 70 split into 2 gaps of 35 -> b moves to x=45
		expect(offsets.b.dx).toBeCloseTo(30);
	});
});

describe('rectContains', () => {
	const outer = { x: 0, y: 0, width: 100, height: 100 };

	it('is true for a rect fully inside', () => {
		expect(rectContains(outer, { x: 10, y: 10, width: 20, height: 20 })).toBe(true);
	});

	it('is true when touching the outer edges exactly', () => {
		expect(rectContains(outer, { x: 0, y: 0, width: 100, height: 100 })).toBe(true);
	});

	it('is false when partially outside', () => {
		expect(rectContains(outer, { x: 90, y: 10, width: 20, height: 20 })).toBe(false);
	});
});

describe('snapMove', () => {
	const others = [{ x: 100, y: 100, width: 20, height: 20 }];

	it('snaps to a nearby edge within threshold', () => {
		// moving box (width 10) dragged by dx=88 lands its right edge at 98 — within 3 of other's left edge 100
		const result = snapMove([{ x: 0, y: 0, width: 10, height: 10 }], 88, 0, others, 3);
		expect(result.dx).toBe(90);
		expect(result.guideX).toBe(100);
	});

	it('does not snap when nothing is within threshold', () => {
		const result = snapMove([{ x: 0, y: 0, width: 10, height: 10 }], 50, 0, others, 5);
		expect(result.dx).toBe(50);
		expect(result.guideX).toBeNull();
	});
});
