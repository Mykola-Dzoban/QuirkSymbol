import { Copy, LogOut, Pencil, PenTool, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';
import { UrlConfig } from '../constants/urls';
import { useAuthStore } from '../store/useAuthStore';
import { useProjectsStore } from '../store/useProjectsStore';
import type { ProjectDoc } from '../services/projects.service';

export default function Projects() {
	const navigate = useNavigate();
	const { user, dbUser, logout } = useAuthStore();
	const { projects, isLoading, load, create, rename, remove, duplicate } = useProjectsStore();
	const [creating, setCreating] = useState(false);
	const [renamingId, setRenamingId] = useState<string | null>(null);

	useEffect(() => {
		if (user?.email) load(user.email);
	}, [user, load]);

	const handleCreate = async () => {
		if (!user) return;
		setCreating(true);
		const project = await create('Нова дошка', user.uid, user.email || '');
		setCreating(false);
		if (project) navigate(UrlConfig.editor(project.id));
	};

	return (
		<div className="mx-auto flex h-full max-w-4xl flex-col gap-6 px-4 py-8">
			<div className="flex items-center justify-between">
				<div>
					<Link to={UrlConfig.home} className="flex items-center gap-1.5 text-sm text-muted hover:text-page-text">
						<PenTool className="h-3.5 w-3.5" /> На гостьову дошку
					</Link>
					<h1 className="text-xl font-semibold">Проєкти</h1>
					<p className="text-sm text-muted">{dbUser?.email}</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={handleCreate} isLoading={creating}>
						<Plus className="h-4 w-4" /> Нова дошка
					</Button>
					<button onClick={logout} title="Вийти" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-page-bg">
						<LogOut className="h-4 w-4" />
					</button>
				</div>
			</div>

			{isLoading && projects.length === 0 && <p className="text-sm text-muted">Завантаження…</p>}
			{!isLoading && projects.length === 0 && (
				<div className="rounded-xl border border-dashed border-panel-border p-10 text-center text-sm text-muted">
					Проєктів ще немає — створіть першу дошку.
				</div>
			)}

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
				{projects.map((project) => (
					<ProjectCard
						key={project.id}
						project={project}
						isRenaming={renamingId === project.id}
						onOpen={() => navigate(UrlConfig.editor(project.id))}
						onStartRename={() => setRenamingId(project.id)}
						onRename={(name) => {
							rename(project.id, name);
							setRenamingId(null);
						}}
						onDuplicate={() => duplicate(project)}
						onDelete={() => confirm(`Видалити «${project.name}»?`) && remove(project.id)}
					/>
				))}
			</div>
		</div>
	);
}

interface ProjectCardProps {
	project: ProjectDoc;
	isRenaming: boolean;
	onOpen: () => void;
	onStartRename: () => void;
	onRename: (name: string) => void;
	onDuplicate: () => void;
	onDelete: () => void;
}

function ProjectCard({ project, isRenaming, onOpen, onStartRename, onRename, onDuplicate, onDelete }: ProjectCardProps) {
	const [name, setName] = useState(project.name);

	return (
		<div className="group flex flex-col gap-2 rounded-xl border border-panel-border bg-panel p-4">
			<button onClick={onOpen} className="flex h-24 items-center justify-center rounded-lg" style={{ backgroundColor: project.backgroundColor }}>
				<span className="text-xs text-muted">Відкрити →</span>
			</button>

			{isRenaming ? (
				<input
					autoFocus
					value={name}
					onChange={(e) => setName(e.target.value)}
					onBlur={() => onRename(name)}
					onKeyDown={(e) => e.key === 'Enter' && onRename(name)}
					className="rounded-md border border-brand px-2 py-1 text-sm outline-none"
				/>
			) : (
				<div className="truncate text-sm font-medium">{project.name}</div>
			)}

			<div className="flex items-center justify-between text-xs text-muted">
				<span className="flex items-center gap-1">
					<Users className="h-3 w-3" /> {project.members.length}
				</span>
				<div className="flex gap-2 opacity-0 group-hover:opacity-100">
					<button onClick={onStartRename} title="Перейменувати" className="hover:text-page-text">
						<Pencil className="h-3.5 w-3.5" />
					</button>
					<button onClick={onDuplicate} title="Дублювати" className="hover:text-page-text">
						<Copy className="h-3.5 w-3.5" />
					</button>
					<button onClick={onDelete} title="Видалити" className="hover:text-danger">
						<Trash2 className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>
		</div>
	);
}
