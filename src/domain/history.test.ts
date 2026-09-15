import { describe, expect, it } from 'vitest';
import { commit, emptyHistory, redo, undo } from './history';

describe('history', () => {
	it('undo returns the last committed snapshot and moves current into future', () => {
		let h = emptyHistory<number>();
		h = commit(h, 0);
		h = commit(h, 1);
		const result = undo(h, 2);
		expect(result).not.toBeNull();
		expect(result!.value).toBe(1);
		expect(result!.history.past).toEqual([0]);
		expect(result!.history.future).toEqual([2]);
	});

	it('redo replays the undone snapshot and moves current back into past', () => {
		let h = emptyHistory<number>();
		h = commit(h, 0);
		const afterUndo = undo(h, 1)!;
		const afterRedo = redo(afterUndo.history, afterUndo.value);
		expect(afterRedo).not.toBeNull();
		expect(afterRedo!.value).toBe(1);
		expect(afterRedo!.history.past).toEqual([0]);
		expect(afterRedo!.history.future).toEqual([]);
	});

	it('undo on an empty stack returns null', () => {
		expect(undo(emptyHistory<number>(), 0)).toBeNull();
	});

	it('a new commit clears the redo branch', () => {
		let h = emptyHistory<number>();
		h = commit(h, 0);
		const afterUndo = undo(h, 1)!;
		const afterCommit = commit(afterUndo.history, afterUndo.value);
		expect(afterCommit.future).toEqual([]);
	});
});
