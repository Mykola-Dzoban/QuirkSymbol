import { nanoid } from 'nanoid';

/** Одне повідомлення в треді коментаря — тред зберігається одним документом, повідомлення вкладені масивом. */
export interface CommentMessage {
	id: string;
	authorUid: string;
	authorName: string;
	text: string;
	createdAt: number;
}

/**
 * Тред коментарів, прикріплений до точки на канвасі — документ у `projects/{id}/comments/{threadId}`.
 * `x,y` — world-координати (як у `BoardElement`), тред рухається разом з паном/зумом, але не з фігурами.
 */
export interface CommentThread {
	id: string;
	x: number;
	y: number;
	resolved: boolean;
	createdAt: number;
	createdByUid: string;
	messages: CommentMessage[];
}

export function newCommentThread(x: number, y: number, authorUid: string, authorName: string, text: string): CommentThread {
	const now = Date.now();
	return {
		id: nanoid(10),
		x,
		y,
		resolved: false,
		createdAt: now,
		createdByUid: authorUid,
		messages: [{ id: nanoid(8), authorUid, authorName, text, createdAt: now }],
	};
}

export function newCommentMessage(authorUid: string, authorName: string, text: string): CommentMessage {
	return { id: nanoid(8), authorUid, authorName, text, createdAt: Date.now() };
}

const PRESENCE_PALETTE = ['#e03131', '#e8590c', '#f08c00', '#2f9e44', '#0c8599', '#1971c2', '#6c5ce7', '#ae3ec9', '#c2255c'];

/** Стабільний колір для курсора/аватарки учасника — детермінований хеш `uid`, без випадковості між рендерами. */
export function colorForUid(uid: string): string {
	let hash = 0;
	for (let i = 0; i < uid.length; i++) hash = (hash * 31 + uid.charCodeAt(i)) | 0;
	return PRESENCE_PALETTE[Math.abs(hash) % PRESENCE_PALETTE.length];
}

/** Присутність одного учасника в проєкті — документ у `projects/{id}/presence/{uid}`, live-курсор. */
export interface PresenceEntry {
	id: string;
	displayName: string;
	color: string;
	cursorX: number;
	cursorY: number;
	updatedAt: number;
}

/** Курсор вважається "живим", якщо оновився за останні N мс — інакше приховуємо (учасник закрив вкладку). */
export const PRESENCE_STALE_MS = 10_000;
