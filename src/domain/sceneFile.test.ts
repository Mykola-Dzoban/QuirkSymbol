import { describe, expect, it } from 'vitest';
import type { BoardElement } from './board';
import { parseScene, serializeScene } from './sceneFile';

function rectEl(): BoardElement {
	return {
		id: 'a',
		type: 'rectangle',
		x: 0,
		y: 0,
		width: 10,
		height: 10,
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
	};
}

describe('serializeScene / parseScene', () => {
	it('round-trips elements through JSON', () => {
		const file = serializeScene([rectEl()]);
		const parsed = parseScene(JSON.stringify(file));
		expect(parsed).toEqual([rectEl()]);
	});

	it('rejects invalid JSON', () => {
		expect(() => parseScene('{not json')).toThrow('Файл не є коректним JSON.');
	});

	it('rejects JSON that is not a QuirkSymbol scene file', () => {
		expect(() => parseScene(JSON.stringify({ hello: 'world' }))).toThrow('Це не файл сцени QuirkSymbol.');
	});

	it('rejects a scene file with a non-array elements field', () => {
		expect(() => parseScene(JSON.stringify({ type: 'quirksymbol/scene', version: 1, elements: 'nope' }))).toThrow(
			'Це не файл сцени QuirkSymbol.',
		);
	});
});
