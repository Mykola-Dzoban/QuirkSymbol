import { describe, expect, it } from 'vitest';
import type { BoardElement } from './board';
import { elementsToSvg, elementToSvg } from './svgExport';

function baseEl(overrides: Partial<BoardElement>): BoardElement {
	return {
		id: 'a',
		type: 'rectangle',
		x: 10,
		y: 20,
		width: 30,
		height: 40,
		angle: 0,
		stroke: '#111',
		fill: '#fff',
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

describe('elementToSvg', () => {
	it('renders a rectangle with rounded corners, positioned via a translate transform', () => {
		const svg = elementToSvg(baseEl({ type: 'rectangle', cornerRadius: 6 }));
		expect(svg).toContain('<rect');
		expect(svg).toContain('rx="6"');
		expect(svg).toContain('width="30"');
		expect(svg).toContain('height="40"');
		expect(svg).toContain('transform="translate(10 20)"');
	});

	it('rotates around its own anchor point when angle is set', () => {
		const svg = elementToSvg(baseEl({ type: 'rectangle', angle: 45 }));
		expect(svg).toContain('rotate(45)');
	});

	it('renders an ellipse centered on x+width/2, y+height/2', () => {
		const svg = elementToSvg(baseEl({ type: 'ellipse' }));
		expect(svg).toContain('<ellipse');
		expect(svg).toContain('rx="15"');
		expect(svg).toContain('ry="20"');
		expect(svg).toContain('transform="translate(25 40)"');
	});

	it('renders a diamond as a 4-point polygon', () => {
		const svg = elementToSvg(baseEl({ type: 'diamond' }));
		expect(svg).toContain('<polygon');
		expect(svg).toContain('15,0 30,20 15,40 0,20');
	});

	it('renders an arrow as a polyline plus a triangular head', () => {
		const svg = elementToSvg(baseEl({ type: 'arrow', points: [0, 0, 100, 0] }));
		expect(svg).toContain('<polyline points="0,0 100,0"');
		expect(svg).toContain('<polygon points="100,0');
	});

	it('renders a line as a plain polyline with no fill', () => {
		const svg = elementToSvg(baseEl({ type: 'line', points: [0, 0, 50, 50] }));
		expect(svg).toContain('<polyline points="0,0 50,50"');
		expect(svg).toContain('fill="none"');
	});

	it('renders draw strokes as a smoothed path starting at the first point', () => {
		const svg = elementToSvg(baseEl({ type: 'draw', points: [0, 0, 10, 5, 20, 0] }));
		expect(svg).toMatch(/<path d="M 0 0 C /);
	});

	it('escapes text content and offsets the baseline', () => {
		const svg = elementToSvg(baseEl({ type: 'text', text: '<b>&"</b>', fontSize: 20 }));
		expect(svg).toContain('&lt;b&gt;&amp;&quot;&lt;/b&gt;');
		expect(svg).toContain('y="16"');
	});
});

describe('elementsToSvg', () => {
	it('returns a placeholder document for an empty scene', () => {
		expect(elementsToSvg([])).toContain('<svg');
	});

	it('sizes the viewBox to the union bounds plus padding', () => {
		const svg = elementsToSvg([baseEl({ x: 0, y: 0, width: 10, height: 10 })]);
		// bbox 0,0,10,10 padded by 24 on each side -> viewBox "-24 -24 58 58"
		expect(svg).toContain('viewBox="-24 -24 58 58"');
		expect(svg).toContain('width="58"');
		expect(svg).toContain('height="58"');
	});
});
