import { useEffect, useRef, useState } from 'react';
import { colorForUid, LASER_FADE_MS, type PresenceEntry } from '../../../domain/comment';
import type { View } from '../../../domain/view';
import { toScreen } from '../../../domain/view';

export interface LaserPoint {
	x: number;
	y: number;
	t: number;
}

interface LaserTrailsProps {
	/** Власний слід — накопичується локально в `BoardCanvas` без затримки на мережу/Firestore. */
	own: LaserPoint[];
	ownUid: string | null;
	presence: Record<string, PresenceEntry>;
	selfUid: string | null;
	view: View;
}

/**
 * Тимчасові згасаючі сліди лазерної указки (`Tool.laser`). Власний слід малюється миттєво з локальних
 * точок; чужі — буферизуються на клієнті з потоку presence-оновлень (`cursorX/Y` + `updatedAt`), поки в
 * учасника `isLaserActive`, бо сам документ presence тримає лише ОСТАННЮ точку, а не історію.
 */
export default function LaserTrails({ own, ownUid, presence, selfUid, view }: LaserTrailsProps) {
	const [remoteTrails, setRemoteTrails] = useState<Record<string, LaserPoint[]>>({});
	const lastSeenAt = useRef<Record<string, number>>({});
	const [now, setNow] = useState(() => Date.now());

	// Кожне нове presence-оновлення з активним лазером додає одну точку до буфера того учасника.
	useEffect(() => {
		setRemoteTrails((prev) => {
			let changed = false;
			const next = { ...prev };
			for (const p of Object.values(presence)) {
				if (p.id === selfUid || !p.isLaserActive || lastSeenAt.current[p.id] === p.updatedAt) continue;
				lastSeenAt.current[p.id] = p.updatedAt;
				next[p.id] = [...(next[p.id] ?? []), { x: p.cursorX, y: p.cursorY, t: p.updatedAt }];
				changed = true;
			}
			return changed ? next : prev;
		});
	}, [presence, selfUid]);

	const anythingToAnimate = own.length > 0 || Object.values(remoteTrails).some((pts) => pts.length > 0);

	// Тік лише поки є що анімувати — і для згасання прозорості, і щоб прибирати застарілі точки з буфера.
	useEffect(() => {
		if (!anythingToAnimate) return;
		const id = setInterval(() => {
			const t = Date.now();
			setNow(t);
			setRemoteTrails((prev) => {
				let changed = false;
				const next: Record<string, LaserPoint[]> = {};
				for (const [uid, pts] of Object.entries(prev)) {
					const filtered = pts.filter((pt) => t - pt.t < LASER_FADE_MS);
					if (filtered.length !== pts.length) changed = true;
					if (filtered.length > 0) next[uid] = filtered;
				}
				return changed ? next : prev;
			});
		}, 50);
		return () => clearInterval(id);
	}, [anythingToAnimate]);

	const trails: { uid: string; color: string; points: LaserPoint[] }[] = [];
	if (ownUid && own.length > 0) {
		const points = own.filter((pt) => now - pt.t < LASER_FADE_MS);
		if (points.length > 1) trails.push({ uid: ownUid, color: colorForUid(ownUid), points });
	}
	for (const [uid, pts] of Object.entries(remoteTrails)) {
		const points = pts.filter((pt) => now - pt.t < LASER_FADE_MS);
		if (points.length > 1) trails.push({ uid, color: colorForUid(uid), points });
	}

	if (trails.length === 0) return null;

	return (
		<svg className="pointer-events-none absolute inset-0 z-30 h-full w-full">
			{trails.map((trail) =>
				trail.points.slice(1).map((point, i) => {
					const prev = trail.points[i];
					const a = toScreen(prev.x, prev.y, view);
					const b = toScreen(point.x, point.y, view);
					const opacity = Math.max(0, 1 - (now - point.t) / LASER_FADE_MS);
					return (
						<line
							key={`${trail.uid}-${point.t}-${i}`}
							x1={a.x}
							y1={a.y}
							x2={b.x}
							y2={b.y}
							stroke={trail.color}
							strokeWidth={3}
							strokeLinecap="round"
							opacity={opacity}
						/>
					);
				}),
			)}
		</svg>
	);
}
