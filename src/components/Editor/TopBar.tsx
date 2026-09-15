import { ArrowLeft, MessageCircle, Minus, Plus, Redo2, Undo2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PRESENCE_STALE_MS } from '../../domain/comment';
import { useBoardStore } from '../../store/useBoardStore';
import type { ProjectDoc } from '../../services/projects.service';
import { cn } from '../../utils/cn';
import HamburgerMenu from './HamburgerMenu';
import ShareDialog from './ShareDialog';

interface TopBarProps {
	project: ProjectDoc;
	onBack: () => void;
	onRename: (name: string) => void;
	onAddMember: (email: string) => Promise<void>;
	onRemoveMember: (email: string) => void;
	onTogglePublicView: (enabled: boolean) => Promise<void>;
}

export default function TopBar({ project, onBack, onRename, onAddMember, onRemoveMember, onTogglePublicView }: TopBarProps) {
	const { view, zoomByFactor, history, undo, redo, uid, presence, comments, commentsOpen, setCommentsOpen } = useBoardStore();
	const [name, setName] = useState(project.name);
	const [shareOpen, setShareOpen] = useState(false);

	// Presence не має власного "onSnapshot щосекунди" — коли ніхто не рухає мишу, `presence` не
	// змінюється сам по собі, тож застарілість рахуємо через окремий тік часу (як у PresenceCursors).
	const [now, setNow] = useState(() => Date.now());
	useEffect(() => {
		const id = setInterval(() => setNow(Date.now()), 2000);
		return () => clearInterval(id);
	}, []);

	const online = Object.values(presence).filter((p) => p.id !== uid && now - p.updatedAt < PRESENCE_STALE_MS);
	const unresolvedComments = Object.values(comments).filter((c) => !c.resolved).length;

	return (
		<div className="z-10 flex h-14 shrink-0 items-center gap-3 border-b border-panel-border bg-panel px-3">
			<HamburgerMenu />
			<button onClick={onBack} title="До проєктів" className="flex h-9 w-9 items-center justify-center rounded-lg text-page-text hover:bg-page-bg">
				<ArrowLeft className="h-4.5 w-4.5" />
			</button>

			<input
				value={name}
				onChange={(e) => setName(e.target.value)}
				onBlur={() => name.trim() && name !== project.name && onRename(name)}
				className="min-w-0 max-w-48 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium outline-none hover:border-panel-border focus:border-brand"
			/>

			<div className="flex items-center gap-0.5">
				<button
					onClick={undo}
					disabled={history.past.length === 0}
					title="Скасувати (Ctrl+Z)"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-page-text hover:bg-page-bg disabled:opacity-30"
				>
					<Undo2 className="h-4 w-4" />
				</button>
				<button
					onClick={redo}
					disabled={history.future.length === 0}
					title="Повторити (Ctrl+Shift+Z)"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-page-text hover:bg-page-bg disabled:opacity-30"
				>
					<Redo2 className="h-4 w-4" />
				</button>
			</div>

			<div className="flex items-center gap-0.5 rounded-lg border border-panel-border px-1">
				<button onClick={() => zoomByFactor(1 / 1.2)} className="flex h-8 w-7 items-center justify-center text-page-text hover:text-brand">
					<Minus className="h-3.5 w-3.5" />
				</button>
				<span className="w-10 text-center text-xs text-muted">{Math.round(view.scale * 100)}%</span>
				<button onClick={() => zoomByFactor(1.2)} className="flex h-8 w-7 items-center justify-center text-page-text hover:text-brand">
					<Plus className="h-3.5 w-3.5" />
				</button>
			</div>

			<div className="ml-auto flex items-center gap-2">
				{online.length > 0 && (
					<div className="flex items-center -space-x-2" title={online.map((p) => p.displayName).join(', ')}>
						{online.slice(0, 4).map((p) => (
							<span
								key={p.id}
								className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-panel text-[11px] font-medium text-white"
								style={{ backgroundColor: p.color }}
							>
								{p.displayName.slice(0, 1).toUpperCase()}
							</span>
						))}
					</div>
				)}

				<button
					onClick={() => setCommentsOpen(!commentsOpen)}
					title="Коментарі"
					className={cn(
						'relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-page-bg',
						commentsOpen ? 'border-brand text-brand' : 'border-panel-border text-page-text',
					)}
				>
					<MessageCircle className="h-4 w-4" />
					{unresolvedComments > 0 && (
						<span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium text-white">
							{unresolvedComments}
						</span>
					)}
				</button>

				<button
					onClick={() => setShareOpen(true)}
					className="flex items-center gap-1.5 rounded-lg border border-panel-border px-3 py-1.5 text-sm text-page-text hover:bg-page-bg"
				>
					<Users className="h-4 w-4" />
					{project.members.length}
				</button>
			</div>

			{shareOpen && (
				<ShareDialog
					project={project}
					onClose={() => setShareOpen(false)}
					onAddMember={onAddMember}
					onRemoveMember={onRemoveMember}
					onTogglePublicView={onTogglePublicView}
				/>
			)}
		</div>
	);
}
