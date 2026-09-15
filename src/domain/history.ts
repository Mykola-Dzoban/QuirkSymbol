/** Generic commit-based undo/redo стек (за зразком usePlannerStore у floor-planner) — тримає знімки всього стану. */
export interface History<T> {
	past: T[];
	future: T[];
}

export const MAX_HISTORY = 100;

export function emptyHistory<T>(): History<T> {
	return { past: [], future: [] };
}

/** Фіксує `previous` (стан ДО зміни) у `past` і очищує `future` — новий commit обриває redo-гілку. */
export function commit<T>(history: History<T>, previous: T): History<T> {
	const past = [...history.past, previous].slice(-MAX_HISTORY);
	return { past, future: [] };
}

export function undo<T>(history: History<T>, current: T): { history: History<T>; value: T } | null {
	if (history.past.length === 0) return null;
	const value = history.past[history.past.length - 1];
	const past = history.past.slice(0, -1);
	const future = [current, ...history.future].slice(0, MAX_HISTORY);
	return { history: { past, future }, value };
}

export function redo<T>(history: History<T>, current: T): { history: History<T>; value: T } | null {
	if (history.future.length === 0) return null;
	const value = history.future[0];
	const future = history.future.slice(1);
	const past = [...history.past, current].slice(-MAX_HISTORY);
	return { history: { past, future }, value };
}
