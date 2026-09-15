import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import BoardCanvas from '../components/Editor/Canvas/BoardCanvas';
import CommentsPanel from '../components/Editor/CommentsPanel';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import ShortcutsHelp from '../components/Editor/ShortcutsHelp';
import Toolbar from '../components/Editor/Toolbar';
import TopBar from '../components/Editor/TopBar';
import { useBoardShortcuts } from '../components/Editor/useBoardShortcuts';
import { toast } from '../components/UI/toast';
import { UrlConfig } from '../constants/urls';
import { dbProjects, type ProjectDoc } from '../services/projects.service';
import { useAuthStore } from '../store/useAuthStore';
import { useBoardStore } from '../store/useBoardStore';

export default function Editor() {
	const { projectId } = useParams<{ projectId: string }>();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { subscribeToProject, leaveBoard } = useBoardStore();

	const [project, setProject] = useState<ProjectDoc | null>(null);
	const [status, setStatus] = useState<'loading' | 'ready' | 'missing' | 'forbidden'>('loading');

	useEffect(() => {
		if (!projectId || !user?.email) return;
		let cancelled = false;
		dbProjects
			.getById(projectId)
			.then((doc) => {
				if (cancelled) return;
				if (!doc) {
					setStatus('missing');
					return;
				}
				if (!doc.members.includes(user.email!)) {
					setStatus('forbidden');
					return;
				}
				setProject(doc);
				subscribeToProject(projectId, user.uid, user.displayName || user.email || 'Учасник');
				setStatus('ready');
			})
			.catch((err) => {
				console.error(err);
				if (!cancelled) {
					toast.error('Не вдалося завантажити проєкт.');
					setStatus('missing');
				}
			});
		return () => {
			cancelled = true;
			leaveBoard();
		};
	}, [projectId, user, subscribeToProject, leaveBoard]);

	useBoardShortcuts();

	if (status === 'loading') {
		return (
			<div className="flex h-full items-center justify-center">
				<Loader2 className="h-6 w-6 animate-spin text-brand" />
			</div>
		);
	}
	if (status === 'missing') {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted">
				Проєкт не знайдено.
				<button onClick={() => navigate(UrlConfig.projects)} className="text-brand underline">
					До списку проєктів
				</button>
			</div>
		);
	}
	if (status === 'forbidden') {
		return (
			<div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-muted">
				У вас немає доступу до цього проєкту.
				<button onClick={() => navigate(UrlConfig.projects)} className="text-brand underline">
					До списку проєктів
				</button>
			</div>
		);
	}
	if (!project) return null;

	return (
		<div className="flex h-full flex-col">
			<TopBar
				project={project}
				onBack={() => navigate(UrlConfig.projects)}
				onRename={async (name) => {
					setProject({ ...project, name });
					await dbProjects.update({ id: project.id, name, updatedAt: Date.now() });
				}}
				onAddMember={async (email) => {
					if (project.members.includes(email)) return;
					const members = [...project.members, email];
					setProject({ ...project, members });
					await dbProjects.update({ id: project.id, members, updatedAt: Date.now() });
					toast.success(`${email} додано до проєкту.`);
				}}
				onRemoveMember={(email) => {
					const members = project.members.filter((m) => m !== email);
					setProject({ ...project, members });
					dbProjects.update({ id: project.id, members, updatedAt: Date.now() }).catch((err) => console.error(err));
				}}
				onTogglePublicView={async (enabled) => {
					setProject({ ...project, publicViewEnabled: enabled });
					await dbProjects.update({ id: project.id, publicViewEnabled: enabled, updatedAt: Date.now() });
				}}
			/>
			<div className="relative flex min-h-0 flex-1">
				<Toolbar />
				<BoardCanvas />
				<PropertiesPanel />
				<CommentsPanel />
			</div>
			<ShortcutsHelp />
		</div>
	);
}
