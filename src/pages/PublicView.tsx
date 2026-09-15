import { Eye, Loader2, PenTool } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ReadOnlyCanvas from '../components/Editor/Canvas/ReadOnlyCanvas';
import type { BoardElement } from '../domain/board';
import { UrlConfig } from '../constants/urls';
import { dbElements } from '../services/elements.service';
import { dbProjects, type ProjectDoc } from '../services/projects.service';

type Status = 'loading' | 'ready' | 'unavailable';

/**
 * Публічне посилання "тільки перегляд" (`/view/:projectId`) — без входу, вмикає власник у ShareDialog
 * (`ProjectDoc.publicViewEnabled`). Firestore rules дозволяють анонімне читання лише коли цей прапорець
 * увімкнено, тож тут достатньо прямого `getById`/`subscribeAll` без `useBoardStore` (нема ні `uid`, ні
 * запису — дивитись можна, редагувати ні).
 */
export default function PublicView() {
	const { projectId } = useParams<{ projectId: string }>();
	const [status, setStatus] = useState<Status>('loading');
	const [project, setProject] = useState<ProjectDoc | null>(null);
	const [elements, setElements] = useState<Record<string, BoardElement>>({});

	useEffect(() => {
		if (!projectId) return;
		let cancelled = false;
		let unsubscribe: (() => void) | null = null;

		dbProjects
			.getById(projectId)
			.then((doc) => {
				if (cancelled) return;
				if (!doc || !doc.publicViewEnabled) {
					setStatus('unavailable');
					return;
				}
				setProject(doc);
				setStatus('ready');
				unsubscribe = dbElements(projectId).subscribeAll((remote) => {
					const map: Record<string, BoardElement> = {};
					for (const el of remote) map[el.id] = el;
					setElements(map);
				});
			})
			.catch(() => {
				if (!cancelled) setStatus('unavailable');
			});

		return () => {
			cancelled = true;
			unsubscribe?.();
		};
	}, [projectId]);

	if (status === 'loading') {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-brand" />
			</div>
		);
	}

	if (status === 'unavailable' || !project) {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted">
				Це посилання недійсне — власник вимкнув перегляд або дошка не існує.
				<Link to={UrlConfig.home} className="text-brand underline">
					На QuirkSymbol
				</Link>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="z-10 flex h-14 shrink-0 items-center gap-3 border-b border-panel-border bg-panel px-3">
				<div className="flex items-center gap-2 pr-1 text-sm font-semibold">
					<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
						<PenTool className="h-3.5 w-3.5" />
					</span>
					{project.name}
				</div>
				<span className="flex items-center gap-1 rounded-full bg-page-bg px-2.5 py-1 text-xs text-muted">
					<Eye className="h-3.5 w-3.5" /> Тільки перегляд
				</span>
				<Link to={UrlConfig.home} className="ml-auto rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-hover">
					Своя дошка на QuirkSymbol
				</Link>
			</div>
			<div className="relative flex min-h-0 flex-1">
				<ReadOnlyCanvas elements={elements} />
			</div>
		</div>
	);
}
