import { describe, expect, it } from 'vitest';
import { colorForUid, newCommentMessage, newCommentThread } from './comment';

describe('newCommentThread', () => {
	it('creates a thread with one message from the author', () => {
		const t = newCommentThread(10, 20, 'u1', 'Марія', 'Привіт!');
		expect(t.x).toBe(10);
		expect(t.y).toBe(20);
		expect(t.resolved).toBe(false);
		expect(t.createdByUid).toBe('u1');
		expect(t.messages).toHaveLength(1);
		expect(t.messages[0]).toMatchObject({ authorUid: 'u1', authorName: 'Марія', text: 'Привіт!' });
	});

	it('gives every thread a unique id', () => {
		const a = newCommentThread(0, 0, 'u1', 'A', 'x');
		const b = newCommentThread(0, 0, 'u1', 'A', 'x');
		expect(a.id).not.toBe(b.id);
	});
});

describe('newCommentMessage', () => {
	it('builds a message with a unique id', () => {
		const a = newCommentMessage('u1', 'A', 'привіт');
		const b = newCommentMessage('u1', 'A', 'привіт');
		expect(a.id).not.toBe(b.id);
		expect(a.text).toBe('привіт');
	});
});

describe('colorForUid', () => {
	it('is deterministic for the same uid', () => {
		expect(colorForUid('abc123')).toBe(colorForUid('abc123'));
	});

	it('tends to differ across different uids', () => {
		expect(colorForUid('abc123')).not.toBe(colorForUid('xyz789'));
	});
});
