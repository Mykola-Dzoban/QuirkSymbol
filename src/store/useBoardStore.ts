import { create } from 'zustand';
import {
	createElement,
	createImageElement,
	DEFAULT_FILL,
	DEFAULT_STROKE,
	DEFAULT_STROKE_WIDTH,
	nextZIndex,
	newElementId,
	touchElement,
	visibleElements,
	type BoardElement,
	type ElementType,
	type Tool,
} from '../domain/board';
import { colorForUid, newCommentMessage, newCommentThread, type CommentThread, type PresenceEntry } from '../domain/comment';
import { alignOffset, distributeOffsets, elementBounds, unionBounds, type AlignMode } from '../domain/geometry';
import { commit, emptyHistory, redo as redoHistory, undo as undoHistory, type History } from '../domain/history';
import { serializeScene } from '../domain/sceneFile';
import { elementsToSvg } from '../domain/svgExport';
import { toScreen as toScreenPure, toWorld as toWorldPure, zoomAt as zoomAtPure, type View } from '../domain/view';
import { dbComments } from '../services/comments.service';
import { dbElements } from '../services/elements.service';
import { loadLocalBoard, saveLocalBoard } from '../services/localBoard.service';
import { dbPresence } from '../services/presence.service';
import { downloadJson, downloadText } from '../utils/downloadFile';

const WRITE_THROTTLE_MS = 120;
const LOCAL_SAVE_THROTTLE_MS = 300;
const PRESENCE_WRITE_THROTTLE_MS = 150;
const PRESENCE_HEARTBEAT_MS = 5000;
/** Фіксований "uid" для гостьової (без входу) дошки — потрібен лише як `updatedByUid` у локальних елементах. */
const GUEST_UID = 'guest';

type Elements = Record<string, BoardElement>;
/** `cloud` — проєкт у Firestore з реалтайм-співпрацею; `guest` — локальна дошка без входу (localStorage). */
type BoardMode = 'cloud' | 'guest';

interface StyleDefaults {
	stroke: string;
	fill: string;
	strokeWidth: number;
	opacity: number;
}

interface BoardState {
	mode: BoardMode | null;
	projectId: string | null;
	uid: string | null;
	displayName: string | null;
	elements: Elements;
	selected: string[];
	tool: Tool;
	view: View;
	/** Розмір видимої області канвасу в пікселях — потрібен, щоб кнопки +/- зумили відносно ЦЕНТРУ
	 *  видимого канвасу (як колесо миші зумить відносно курсора), а не відносно (0,0). */
	stageSize: { width: number; height: number };
	snapEnabled: boolean;
	styleDefaults: StyleDefaults;
	history: History<Elements>;
	dirty: boolean;
	helpOpen: boolean;

	/** Коментарі (Фаза 2) — лише для `cloud`-проєктів, гостьова дошка їх не має (нема з ким коментувати). */
	comments: Record<string, CommentThread>;
	commentsOpen: boolean;
	activeCommentId: string | null;
	/** Live-присутність учасників проєкту (курсори, "хто зараз тут") — теж лише `cloud`. */
	presence: Record<string, PresenceEntry>;

	subscribeToProject: (projectId: string, uid: string, displayName: string) => void;
	startGuestSession: () => void;
	leaveBoard: () => void;

	setTool: (tool: Tool) => void;
	setView: (patch: Partial<View>) => void;
	setStageSize: (size: { width: number; height: number }) => void;
	zoomAt: (pointerX: number, pointerY: number, scaleFactor: number) => void;
	zoomByFactor: (scaleFactor: number) => void;
	toggleSnap: () => void;
	toScreen: (worldX: number, worldY: number) => { x: number; y: number };
	toWorld: (screenX: number, screenY: number) => { x: number; y: number };

	select: (ids: string[]) => void;
	toggleSelect: (id: string) => void;
	clearSelection: () => void;

	startElement: (type: ElementType, x: number, y: number) => string;
	updateElementLive: (id: string, patch: Partial<BoardElement>) => void;
	finishElement: (id: string) => void;
	cancelElement: (id: string) => void;

	beginDrag: (ids: string[], extraIds?: string[]) => void;
	dragBy: (dx: number, dy: number) => void;
	endDrag: () => void;

	setStyle: (patch: Partial<StyleDefaults>) => void;
	deleteSelected: () => void;
	clearBoard: () => void;
	duplicateSelected: () => void;
	/** `dataUrl` — уже стиснений на клієнті (див. `utils/imageCompress.ts`); (centerX, centerY) — world-точка центру. */
	insertImage: (dataUrl: string, width: number, height: number, centerX: number, centerY: number) => void;
	bringToFront: () => void;
	sendToBack: () => void;
	groupSelected: () => void;
	ungroupSelected: () => void;
	alignSelected: (mode: AlignMode) => void;
	distributeSelected: (axis: 'horizontal' | 'vertical') => void;
	renameFrame: (id: string, text: string) => void;

	undo: () => void;
	redo: () => void;

	setHelpOpen: (open: boolean) => void;
	/** BoardCanvas реєструє свою функцію рендеру Konva Stage у PNG — меню викликає її, не знаючи про Konva. */
	registerStageExport: (fn: (() => void) | null) => void;
	requestExport: () => void;

	exportJson: () => void;
	exportSvg: () => void;
	importScene: (imported: BoardElement[]) => void;

	setCommentsOpen: (open: boolean) => void;
	setActiveComment: (id: string | null) => void;
	addComment: (x: number, y: number, text: string) => void;
	addCommentReply: (commentId: string, text: string) => void;
	setCommentResolved: (commentId: string, resolved: boolean) => void;
	deleteComment: (commentId: string) => void;
	updateCursor: (worldX: number, worldY: number) => void;
}

let unsubscribeSnapshot: (() => void) | null = null;
/** Id елементів, які зараз малює/тягне ЦЕЙ клієнт — вхідний onSnapshot їх не чіпає, поки не відпустимо. */
const locallyOwned = new Set<string>();
/** Накопичені зміни, які ще не пішли в Firestore — злітають разом раз на WRITE_THROTTLE_MS. */
const dirtyIds = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let localSaveTimer: ReturnType<typeof setTimeout> | null = null;
/** Позиції елементів на початок поточного drag — потрібні, щоб commit'нути в історію ОДИН стан "до". */
let dragSnapshot: Elements | null = null;
/** Id елементів, що рухаються РАЗОМ із виділенням під час drag, але не входять у `selected` (напр.
 *  "діти" кадру, геометрично вкладені в Frame — див. `BoardCanvas.tsx`), щоб Transformer не намагався
 *  показати ручки для купи елементів одразу. */
let dragExtraIds: string[] = [];
/** Стан елементів ДО початку малювання нової фігури — те саме, але для startElement/finishElement. */
let drawSnapshot: Elements | null = null;
/** Функція рендеру Konva Stage у PNG, яку реєструє BoardCanvas — щоб меню могло експортувати, не знаючи про Konva. */
let stageExportFn: (() => void) | null = null;

let unsubscribeComments: (() => void) | null = null;
let unsubscribePresence: (() => void) | null = null;
let presenceHeartbeat: ReturnType<typeof setInterval> | null = null;
let cursorThrottleTimer: ReturnType<typeof setTimeout> | null = null;
/** Останні world-координати курсора — і те, що йде в наступний throttled запис, і те, що повторює heartbeat. */
let lastCursorPos = { x: 0, y: 0 };

function writePresence(get: () => BoardState) {
	const { projectId, uid, displayName } = get();
	if (!projectId || !uid) return;
	dbPresence(projectId)
		.set(uid, { displayName: displayName ?? 'Учасник', color: colorForUid(uid), cursorX: lastCursorPos.x, cursorY: lastCursorPos.y, updatedAt: Date.now() })
		.catch(() => {});
}

function scheduleFlush(get: () => BoardState) {
	if (flushTimer) return;
	flushTimer = setTimeout(() => {
		flushTimer = null;
		flushDirty(get);
	}, WRITE_THROTTLE_MS);
}

function flushDirty(get: () => BoardState) {
	const { projectId, elements } = get();
	if (!projectId || dirtyIds.size === 0) return;
	const ids = Array.from(dirtyIds);
	dirtyIds.clear();
	const db = dbElements(projectId);
	for (const id of ids) {
		const el = elements[id];
		if (el) db.set(el.id, el).catch((err) => console.error('Не вдалося зберегти фігуру:', err));
	}
}

/** Гостьова дошка — один локальний користувач, тож достатньо перезаписувати весь `elements` у localStorage. */
function scheduleLocalSave(get: () => BoardState) {
	if (localSaveTimer) return;
	localSaveTimer = setTimeout(() => {
		localSaveTimer = null;
		saveLocalBoard(get().elements);
	}, LOCAL_SAVE_THROTTLE_MS);
}

function markDirty(id: string, get: () => BoardState) {
	if (get().mode === 'cloud') {
		dirtyIds.add(id);
		scheduleFlush(get);
	} else if (get().mode === 'guest') {
		scheduleLocalSave(get);
	}
}

export const useBoardStore = create<BoardState>((set, get) => ({
	mode: null,
	projectId: null,
	uid: null,
	displayName: null,
	elements: {},
	selected: [],
	tool: 'select',
	view: { offsetX: 0, offsetY: 0, scale: 1 },
	stageSize: { width: 0, height: 0 },
	snapEnabled: true,
	styleDefaults: { stroke: DEFAULT_STROKE, fill: DEFAULT_FILL, strokeWidth: DEFAULT_STROKE_WIDTH, opacity: 1 },
	history: emptyHistory<Elements>(),
	dirty: false,
	helpOpen: false,
	comments: {},
	commentsOpen: false,
	activeCommentId: null,
	presence: {},

	subscribeToProject: (projectId, uid, displayName) => {
		get().leaveBoard();
		set({ mode: 'cloud', projectId, uid, displayName, elements: {}, selected: [], history: emptyHistory<Elements>() });
		unsubscribeSnapshot = dbElements(projectId).subscribeAll((remote) => {
			set((state) => {
				const next: Elements = { ...state.elements };
				for (const el of remote) {
					if (locallyOwned.has(el.id)) continue;
					const local = next[el.id];
					if (!local || el.version >= local.version) next[el.id] = el;
				}
				return { elements: next };
			});
		});
		unsubscribeComments = dbComments(projectId).subscribeAll((remote) => {
			const map: Record<string, CommentThread> = {};
			for (const c of remote) map[c.id] = c;
			set({ comments: map });
		});
		unsubscribePresence = dbPresence(projectId).subscribeAll((remote) => {
			const map: Record<string, PresenceEntry> = {};
			for (const p of remote) map[p.id] = p;
			set({ presence: map });
		});
		lastCursorPos = { x: 0, y: 0 };
		writePresence(get);
		presenceHeartbeat = setInterval(() => writePresence(get), PRESENCE_HEARTBEAT_MS);
	},

	/** Дошка без входу — аналог Excalidraw "guest mode": малюй одразу, зберігається лише в цьому браузері. */
	startGuestSession: () => {
		get().leaveBoard();
		set({ mode: 'guest', projectId: null, uid: GUEST_UID, displayName: null, elements: loadLocalBoard(), selected: [], history: emptyHistory<Elements>() });
	},

	leaveBoard: () => {
		const { mode, projectId, uid } = get();
		if (unsubscribeSnapshot) {
			unsubscribeSnapshot();
			unsubscribeSnapshot = null;
		}
		if (unsubscribeComments) {
			unsubscribeComments();
			unsubscribeComments = null;
		}
		if (unsubscribePresence) {
			unsubscribePresence();
			unsubscribePresence = null;
		}
		if (presenceHeartbeat) {
			clearInterval(presenceHeartbeat);
			presenceHeartbeat = null;
		}
		if (cursorThrottleTimer) {
			clearTimeout(cursorThrottleTimer);
			cursorThrottleTimer = null;
		}
		if (mode === 'cloud' && projectId && uid) {
			dbPresence(projectId).delete(uid).catch(() => {});
		}
		if (mode === 'guest') {
			if (localSaveTimer) {
				clearTimeout(localSaveTimer);
				localSaveTimer = null;
			}
			saveLocalBoard(get().elements);
		}
		locallyOwned.clear();
		dirtyIds.clear();
		if (flushTimer) {
			clearTimeout(flushTimer);
			flushTimer = null;
		}
		dragSnapshot = null;
		drawSnapshot = null;
		set({
			mode: null,
			projectId: null,
			uid: null,
			displayName: null,
			elements: {},
			selected: [],
			history: emptyHistory<Elements>(),
			comments: {},
			commentsOpen: false,
			activeCommentId: null,
			presence: {},
		});
	},

	setTool: (tool) => set({ tool, selected: tool === 'select' ? get().selected : [] }),
	setView: (patch) => set({ view: { ...get().view, ...patch } }),
	setStageSize: (size) => set({ stageSize: size }),
	zoomAt: (pointerX, pointerY, scaleFactor) => set({ view: zoomAtPure(get().view, pointerX, pointerY, scaleFactor) }),
	/** Кнопки +/- в TopBar — зумить відносно центру видимого канвасу, а не (0,0), інакше вміст вилітає за екран. */
	zoomByFactor: (scaleFactor) => {
		const { stageSize } = get();
		set({ view: zoomAtPure(get().view, stageSize.width / 2, stageSize.height / 2, scaleFactor) });
	},
	toggleSnap: () => set({ snapEnabled: !get().snapEnabled }),
	toScreen: (worldX, worldY) => toScreenPure(worldX, worldY, get().view),
	toWorld: (screenX, screenY) => toWorldPure(screenX, screenY, get().view),

	select: (ids) => set({ selected: ids }),
	toggleSelect: (id) => {
		const { selected } = get();
		set({ selected: selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id] });
	},
	clearSelection: () => set({ selected: [] }),

	startElement: (type, x, y) => {
		const { elements, uid, styleDefaults } = get();
		if (!uid) throw new Error('startElement called without an active project session');
		drawSnapshot = elements;
		const el = { ...createElement(type, x, y, uid, nextZIndex(elements)), ...styleDefaults };
		locallyOwned.add(el.id);
		set({ elements: { ...elements, [el.id]: el }, selected: [el.id] });
		return el.id;
	},

	updateElementLive: (id, patch) => {
		const { elements, uid } = get();
		const el = elements[id];
		if (!el || !uid) return;
		const next = touchElement({ ...el, ...patch }, uid);
		set({ elements: { ...elements, [id]: next } });
		markDirty(id, get);
	},

	finishElement: (id) => {
		locallyOwned.delete(id);
		flushDirty(get);
		const { history } = get();
		set({ history: commit(history, drawSnapshot ?? get().elements), dirty: true });
		drawSnapshot = null;
	},

	cancelElement: (id) => {
		locallyOwned.delete(id);
		dirtyIds.delete(id);
		drawSnapshot = null;
		const { elements } = get();
		const rest = { ...elements };
		delete rest[id];
		set({ elements: rest, selected: [] });
	},

	beginDrag: (ids, extraIds = []) => {
		dragSnapshot = get().elements;
		dragExtraIds = extraIds;
		for (const id of [...ids, ...extraIds]) locallyOwned.add(id);
	},

	dragBy: (dx, dy) => {
		const { elements, selected, uid } = get();
		if (!uid) return;
		const next: Elements = { ...elements };
		for (const id of [...selected, ...dragExtraIds]) {
			const el = next[id];
			if (!el) continue;
			next[id] = touchElement({ ...el, x: el.x + dx, y: el.y + dy }, uid);
			markDirty(id, get);
		}
		set({ elements: next });
	},

	endDrag: () => {
		const { selected, history } = get();
		for (const id of [...selected, ...dragExtraIds]) locallyOwned.delete(id);
		dragExtraIds = [];
		flushDirty(get);
		if (dragSnapshot) {
			set({ history: commit(history, dragSnapshot), dirty: true });
			dragSnapshot = null;
		}
	},

	setStyle: (patch) => {
		const { selected, elements, uid, styleDefaults, history } = get();
		set({ styleDefaults: { ...styleDefaults, ...patch } });
		if (selected.length === 0 || !uid) return;
		const next: Elements = { ...elements };
		for (const id of selected) {
			const el = next[id];
			if (!el) continue;
			next[id] = touchElement({ ...el, ...patch }, uid);
			markDirty(id, get);
		}
		set({ elements: next, history: commit(history, elements), dirty: true });
	},

	deleteSelected: () => {
		const { selected, elements, uid, history } = get();
		if (selected.length === 0 || !uid) return;
		const next: Elements = { ...elements };
		for (const id of selected) {
			const el = next[id];
			if (!el) continue;
			next[id] = touchElement({ ...el, deleted: true }, uid);
			markDirty(id, get);
		}
		set({ elements: next, selected: [], history: commit(history, elements), dirty: true });
	},

	clearBoard: () => {
		const { elements, uid, history } = get();
		const visibleIds = Object.values(elements)
			.filter((el) => !el.deleted)
			.map((el) => el.id);
		if (visibleIds.length === 0 || !uid) return;
		const next: Elements = { ...elements };
		for (const id of visibleIds) {
			next[id] = touchElement({ ...next[id], deleted: true }, uid);
			markDirty(id, get);
		}
		set({ elements: next, selected: [], history: commit(history, elements), dirty: true });
	},

	duplicateSelected: () => {
		const { selected, elements, uid, history } = get();
		if (selected.length === 0 || !uid) return;
		const next: Elements = { ...elements };
		const newIds: string[] = [];
		let z = nextZIndex(elements);
		for (const id of selected) {
			const el = elements[id];
			if (!el) continue;
			const copyId = newElementId();
			const copy: BoardElement = { ...el, id: copyId, x: el.x + 16, y: el.y + 16, zIndex: z++, version: 1, updatedAt: Date.now(), updatedByUid: uid };
			next[copyId] = copy;
			newIds.push(copyId);
			markDirty(copyId, get);
		}
		set({ elements: next, selected: newIds, history: commit(history, elements), dirty: true });
	},

	insertImage: (dataUrl, width, height, centerX, centerY) => {
		const { elements, uid, history } = get();
		if (!uid) return;
		const el = createImageElement(dataUrl, width, height, centerX, centerY, uid, nextZIndex(elements));
		const next = { ...elements, [el.id]: el };
		set({ elements: next, selected: [el.id], history: commit(history, elements), dirty: true });
		markDirty(el.id, get);
	},

	bringToFront: () => {
		const { selected, elements, uid, history } = get();
		if (selected.length === 0 || !uid) return;
		const next: Elements = { ...elements };
		let z = nextZIndex(elements);
		for (const id of selected) {
			const el = next[id];
			if (!el) continue;
			next[id] = touchElement({ ...el, zIndex: z++ }, uid);
			markDirty(id, get);
		}
		set({ elements: next, history: commit(history, elements), dirty: true });
	},

	sendToBack: () => {
		const { selected, elements, uid, history } = get();
		if (selected.length === 0 || !uid) return;
		const next: Elements = { ...elements };
		let z = Math.min(0, ...Object.values(elements).map((e) => e.zIndex)) - 1;
		for (const id of selected) {
			const el = next[id];
			if (!el) continue;
			next[id] = touchElement({ ...el, zIndex: z-- }, uid);
			markDirty(id, get);
		}
		set({ elements: next, history: commit(history, elements), dirty: true });
	},

	groupSelected: () => {
		const { selected, elements, uid, history } = get();
		if (selected.length < 2 || !uid) return;
		const groupId = newElementId();
		const next: Elements = { ...elements };
		for (const id of selected) {
			const el = next[id];
			if (!el) continue;
			next[id] = touchElement({ ...el, groupId }, uid);
			markDirty(id, get);
		}
		set({ elements: next, history: commit(history, elements), dirty: true });
	},

	ungroupSelected: () => {
		const { selected, elements, uid, history } = get();
		if (!uid) return;
		const groupIds = new Set(selected.map((id) => elements[id]?.groupId).filter((g): g is string => !!g));
		if (groupIds.size === 0) return;
		const next: Elements = { ...elements };
		for (const el of Object.values(elements)) {
			if (el.groupId && groupIds.has(el.groupId)) {
				next[el.id] = touchElement({ ...el, groupId: undefined }, uid);
				markDirty(el.id, get);
			}
		}
		set({ elements: next, history: commit(history, elements), dirty: true });
	},

	alignSelected: (mode) => {
		const { selected, elements, uid, history } = get();
		if (selected.length < 2 || !uid) return;
		const items = selected.map((id) => ({ id, b: elementBounds(elements[id]) })).filter((x) => elements[x.id]);
		const bbox = unionBounds(items.map((x) => x.b));
		const next: Elements = { ...elements };
		for (const { id, b } of items) {
			const { dx, dy } = alignOffset(b, bbox, mode);
			const el = next[id];
			next[id] = touchElement({ ...el, x: el.x + dx, y: el.y + dy }, uid);
			markDirty(id, get);
		}
		set({ elements: next, history: commit(history, elements), dirty: true });
	},

	distributeSelected: (axis) => {
		const { selected, elements, uid, history } = get();
		if (selected.length < 3 || !uid) return;
		const items = selected.map((id) => ({ id, b: elementBounds(elements[id]) })).filter((x) => elements[x.id]);
		const offsets = distributeOffsets(items, axis);
		const next: Elements = { ...elements };
		for (const [id, { dx, dy }] of Object.entries(offsets)) {
			const el = next[id];
			next[id] = touchElement({ ...el, x: el.x + dx, y: el.y + dy }, uid);
			markDirty(id, get);
		}
		set({ elements: next, history: commit(history, elements), dirty: true });
	},

	renameFrame: (id, text) => {
		const { elements, uid, history } = get();
		const el = elements[id];
		if (!el || !uid) return;
		const next = { ...elements, [id]: touchElement({ ...el, text }, uid) };
		set({ elements: next, history: commit(history, elements), dirty: true });
		markDirty(id, get);
	},

	undo: () => {
		const { history, elements, uid, projectId, mode } = get();
		const result = undoHistory(history, elements);
		if (!result || !uid) return;
		const value = mode === 'cloud' && projectId ? syncHistoryValue(result.value, elements, uid, projectId) : result.value;
		set({ history: result.history, elements: value });
		if (mode === 'guest') scheduleLocalSave(get);
	},

	redo: () => {
		const { history, elements, uid, projectId, mode } = get();
		const result = redoHistory(history, elements);
		if (!result || !uid) return;
		const value = mode === 'cloud' && projectId ? syncHistoryValue(result.value, elements, uid, projectId) : result.value;
		set({ history: result.history, elements: value });
		if (mode === 'guest') scheduleLocalSave(get);
	},

	setHelpOpen: (open) => set({ helpOpen: open }),
	registerStageExport: (fn) => {
		stageExportFn = fn;
	},
	requestExport: () => stageExportFn?.(),

	exportJson: () => {
		const list = visibleElements(get().elements);
		downloadJson(serializeScene(list), 'quirksymbol.json');
	},

	exportSvg: () => {
		const list = visibleElements(get().elements);
		downloadText(elementsToSvg(list), 'quirksymbol.svg', 'image/svg+xml');
	},

	/** Додає елементи з імпортованого JSON-файлу як нові (нові id/z-index), не чіпаючи наявні. */
	importScene: (imported) => {
		const { elements, uid, history } = get();
		if (!uid || imported.length === 0) return;
		const next: Elements = { ...elements };
		const newIds: string[] = [];
		let z = nextZIndex(elements);
		for (const el of imported) {
			const id = newElementId();
			next[id] = { ...el, id, zIndex: z++, deleted: false, version: 1, updatedAt: Date.now(), updatedByUid: uid };
			newIds.push(id);
			markDirty(id, get);
		}
		set({ elements: next, selected: newIds, history: commit(history, elements), dirty: true });
	},

	setCommentsOpen: (open) => set({ commentsOpen: open }),
	setActiveComment: (id) => set({ activeCommentId: id }),

	addComment: (x, y, text) => {
		const { projectId, uid, displayName, comments } = get();
		if (!projectId || !uid || !text.trim()) return;
		const thread = newCommentThread(x, y, uid, displayName ?? 'Учасник', text.trim());
		set({ comments: { ...comments, [thread.id]: thread }, activeCommentId: thread.id, commentsOpen: true });
		dbComments(projectId)
			.set(thread.id, thread)
			.catch((err) => console.error('Не вдалося зберегти коментар:', err));
	},

	addCommentReply: (commentId, text) => {
		const { projectId, uid, displayName, comments } = get();
		const thread = comments[commentId];
		if (!projectId || !uid || !thread || !text.trim()) return;
		const messages = [...thread.messages, newCommentMessage(uid, displayName ?? 'Учасник', text.trim())];
		set({ comments: { ...comments, [commentId]: { ...thread, messages } } });
		dbComments(projectId)
			.update({ id: commentId, messages })
			.catch((err) => console.error('Не вдалося надіслати відповідь:', err));
	},

	setCommentResolved: (commentId, resolved) => {
		const { projectId, comments } = get();
		const thread = comments[commentId];
		if (!projectId || !thread) return;
		set({ comments: { ...comments, [commentId]: { ...thread, resolved } } });
		dbComments(projectId)
			.update({ id: commentId, resolved })
			.catch((err) => console.error('Не вдалося оновити коментар:', err));
	},

	deleteComment: (commentId) => {
		const { projectId, comments, activeCommentId } = get();
		if (!projectId) return;
		const next = { ...comments };
		delete next[commentId];
		set({ comments: next, activeCommentId: activeCommentId === commentId ? null : activeCommentId });
		dbComments(projectId)
			.delete(commentId)
			.catch((err) => console.error('Не вдалося видалити коментар:', err));
	},

	/** Викликає BoardCanvas на кожен mousemove зі світовими координатами — throttled запис у presence. */
	updateCursor: (worldX, worldY) => {
		lastCursorPos = { x: worldX, y: worldY };
		if (get().mode !== 'cloud' || cursorThrottleTimer) return;
		cursorThrottleTimer = setTimeout(() => {
			cursorThrottleTimer = null;
			writePresence(get);
		}, PRESENCE_WRITE_THROTTLE_MS);
	},
}));

/**
 * Undo/redo відновлюють увесь `elements` локально одним рухом. Тут дописуємо в Firestore лише
 * елементи, що реально відрізняються від `previous`, з новим `version`/`updatedAt` — і повертаємо
 * НОВИЙ об'єкт (не мутуємо `target`, який є "живим" знімком усередині стеку history).
 */
function syncHistoryValue(target: Elements, previous: Elements, uid: string, projectId: string): Elements {
	const db = dbElements(projectId);
	const next: Elements = { ...target };
	const ids = new Set([...Object.keys(target), ...Object.keys(previous)]);
	for (const id of ids) {
		const before = previous[id];
		const after = target[id];
		if (before === after || !after) continue;
		const bumped = touchElement(after, uid);
		next[id] = bumped;
		db.set(id, bumped).catch((err) => console.error('Не вдалося зберегти зміну (undo/redo):', err));
	}
	return next;
}
