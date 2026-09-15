import { describe, expect, it } from 'vitest';
import { snapPoint, snapValue } from './snapping';

describe('snapValue', () => {
	it('rounds to the nearest grid line', () => {
		expect(snapValue(13, 10)).toBe(10);
		expect(snapValue(16, 10)).toBe(20);
	});
});

describe('snapPoint', () => {
	it('passes coordinates through unchanged when disabled', () => {
		expect(snapPoint(13, 27, false, 10)).toEqual({ x: 13, y: 27 });
	});

	it('snaps both coordinates when enabled', () => {
		expect(snapPoint(13, 27, true, 10)).toEqual({ x: 10, y: 30 });
	});
});
