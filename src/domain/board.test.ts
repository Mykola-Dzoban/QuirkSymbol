import { describe, expect, it } from 'vitest';
import { createEmbedElement, isEmbeddableUrl } from './board';

describe('isEmbeddableUrl', () => {
	it('accepts http and https URLs', () => {
		expect(isEmbeddableUrl('https://example.com')).toBe(true);
		expect(isEmbeddableUrl('http://example.com/page?x=1')).toBe(true);
	});

	it('rejects non-http(s) schemes', () => {
		expect(isEmbeddableUrl('javascript:alert(1)')).toBe(false);
		expect(isEmbeddableUrl('data:text/html,hi')).toBe(false);
		expect(isEmbeddableUrl('file:///etc/passwd')).toBe(false);
	});

	it('rejects malformed input', () => {
		expect(isEmbeddableUrl('not a url')).toBe(false);
		expect(isEmbeddableUrl('')).toBe(false);
	});
});

describe('createEmbedElement', () => {
	it('centers a default-sized box on (centerX, centerY) and stores the URL as src', () => {
		const el = createEmbedElement('https://example.com', 100, 200, 'uid1', 3);
		expect(el.type).toBe('embed');
		expect(el.src).toBe('https://example.com');
		expect(el.x + el.width / 2).toBeCloseTo(100);
		expect(el.y + el.height / 2).toBeCloseTo(200);
		expect(el.zIndex).toBe(3);
		expect(el.updatedByUid).toBe('uid1');
	});
});
