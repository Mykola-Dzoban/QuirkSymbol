import type { BoardElement } from './board';

export const SCENE_FILE_TYPE = 'quirksymbol/scene';
export const SCENE_FILE_VERSION = 1;

/** Формат файлу JSON-експорту сцени — свій, не excalidraw-сумісний (не обіцяли сумісність, лише бекап/перенесення). */
export interface SceneFile {
	type: typeof SCENE_FILE_TYPE;
	version: number;
	elements: BoardElement[];
}

export function serializeScene(elements: BoardElement[]): SceneFile {
	return { type: SCENE_FILE_TYPE, version: SCENE_FILE_VERSION, elements };
}

/** Парсить JSON-файл сцени з людяними помилками — кидає замість повернення null, щоб виклик показав toast. */
export function parseScene(raw: string): BoardElement[] {
	let data: unknown;
	try {
		data = JSON.parse(raw);
	} catch {
		throw new Error('Файл не є коректним JSON.');
	}
	if (!data || typeof data !== 'object' || (data as Partial<SceneFile>).type !== SCENE_FILE_TYPE || !Array.isArray((data as Partial<SceneFile>).elements)) {
		throw new Error('Це не файл сцени QuirkSymbol.');
	}
	return (data as SceneFile).elements;
}
