import type { BoardElement } from '../domain/board';

const STORAGE_KEY = 'quirksymbol:guest-board';

/**
 * Гостьова дошка (без входу) — персистить локально в браузері, а не в Firestore, аналогічно
 * поведінці Excalidraw без акаунта. `localStorage` може бути недоступним (приватний режим,
 * заблоковані cookies) — тоді дошка просто не переживає перезавантаження сторінки, без падіння.
 */
export function loadLocalBoard(): Record<string, BoardElement> {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Record<string, BoardElement>) : {};
	} catch (error) {
		console.error('Не вдалося прочитати гостьову дошку з localStorage:', error);
		return {};
	}
}

export function saveLocalBoard(elements: Record<string, BoardElement>): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
	} catch (error) {
		console.error('Не вдалося зберегти гостьову дошку в localStorage:', error);
	}
}

export function clearLocalBoard(): void {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
}
