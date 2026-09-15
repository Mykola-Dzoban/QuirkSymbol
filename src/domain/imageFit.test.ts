import { describe, expect, it } from 'vitest';
import { base64ByteSize, fitWithinDimension } from './imageFit';

describe('fitWithinDimension', () => {
	it('leaves an already-small image untouched', () => {
		expect(fitWithinDimension(400, 300, 800)).toEqual({ width: 400, height: 300 });
	});

	it('scales down a wide image so the longer side matches maxDim', () => {
		expect(fitWithinDimension(1600, 800, 800)).toEqual({ width: 800, height: 400 });
	});

	it('scales down a tall image so the longer side matches maxDim', () => {
		expect(fitWithinDimension(800, 1600, 800)).toEqual({ width: 400, height: 800 });
	});

	it('never rounds a dimension down to 0', () => {
		expect(fitWithinDimension(10000, 1, 800)).toEqual({ width: 800, height: 1 });
	});
});

describe('base64ByteSize', () => {
	it('estimates decoded size from a data URI', () => {
		// 'AAAA' (4 base64 chars) decodes to 3 bytes
		expect(base64ByteSize('data:image/jpeg;base64,AAAA')).toBe(3);
	});

	it('handles a raw base64 string with no data-URI prefix', () => {
		expect(base64ByteSize('AAAA')).toBe(3);
	});
});
