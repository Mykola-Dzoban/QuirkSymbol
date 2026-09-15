import { describe, expect, it } from 'vitest';
import { clampScale, toScreen, toWorld, zoomAt } from './view';

describe('toScreen / toWorld', () => {
	it('round-trips a point through screen and back to world coordinates', () => {
		const view = { offsetX: 50, offsetY: -20, scale: 2 };
		const screen = toScreen(30, 40, view);
		expect(screen).toEqual({ x: 110, y: 60 });
		expect(toWorld(screen.x, screen.y, view)).toEqual({ x: 30, y: 40 });
	});
});

describe('clampScale', () => {
	it('clamps to the min/max bounds', () => {
		expect(clampScale(0.001)).toBeCloseTo(0.1);
		expect(clampScale(50)).toBeCloseTo(5);
		expect(clampScale(1.5)).toBeCloseTo(1.5);
	});
});

describe('zoomAt', () => {
	it('keeps the world point under the pointer fixed on screen after zooming', () => {
		const view = { offsetX: 0, offsetY: 0, scale: 1 };
		const next = zoomAt(view, 100, 100, 2);
		expect(next.scale).toBe(2);
		expect(toScreen(100, 100, next)).toEqual(toScreen(100, 100, view));
	});
});
