import { MousePointer2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PRESENCE_STALE_MS, type PresenceEntry } from '../../../domain/comment';
import type { View } from '../../../domain/view';
import { toScreen } from '../../../domain/view';

interface PresenceCursorsProps {
	presence: Record<string, PresenceEntry>;
	selfUid: string | null;
	view: View;
}

/** Live-курсори інших учасників проєкту (Фаза 2) — свій курсор не рендеримо, застарілі (>10с) ховаємо. */
export default function PresenceCursors({ presence, selfUid, view }: PresenceCursorsProps) {
	// Нічого в `presence`/`view` не змінюється, коли учасник просто перестає рухати мишу — тому для
	// приховування застарілих курсорів потрібен окремий "тік" часу, а не лише реактивність на стан.
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 2000);
		return () => clearInterval(id);
	}, []);

	const others = Object.values(presence).filter((p) => p.id !== selfUid && now - p.updatedAt < PRESENCE_STALE_MS);

	return (
		<>
			{others.map((p) => {
				const screen = toScreen(p.cursorX, p.cursorY, view);
				return (
					<div key={p.id} className="pointer-events-none absolute z-30 transition-[left,top] duration-100" style={{ left: screen.x, top: screen.y }}>
						<MousePointer2 className="h-4 w-4 drop-shadow" style={{ color: p.color, fill: p.color }} />
						<span className="ml-4 mt-0.5 block w-max rounded-md px-1.5 py-0.5 text-xs whitespace-nowrap text-white shadow" style={{ backgroundColor: p.color }}>
							{p.displayName}
						</span>
					</div>
				);
			})}
		</>
	);
}
