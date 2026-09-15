import { create } from 'zustand';
import { toast } from '../components/UI/toast';
import { dbProjects, projectsForMember, type ProjectDoc } from '../services/projects.service';

interface ProjectsState {
	projects: ProjectDoc[];
	isLoading: boolean;
	load: (email: string) => Promise<void>;
	create: (name: string, ownerUid: string, ownerEmail: string) => Promise<ProjectDoc | null>;
	rename: (id: string, name: string) => Promise<void>;
	remove: (id: string) => Promise<void>;
	duplicate: (project: ProjectDoc) => Promise<ProjectDoc | null>;
	addMember: (id: string, email: string) => Promise<void>;
	removeMember: (id: string, email: string) => Promise<void>;
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
	projects: [],
	isLoading: false,

	load: async (email) => {
		set({ isLoading: true });
		try {
			const projects = await projectsForMember(email);
			set({ projects: projects.sort((a, b) => b.updatedAt - a.updatedAt) });
		} catch (error) {
			console.error(error);
			toast.error('Не вдалося завантажити проєкти.');
		} finally {
			set({ isLoading: false });
		}
	},

	create: async (name, ownerUid, ownerEmail) => {
		try {
			const now = Date.now();
			const project = await dbProjects.create({
				name: name.trim() || 'Без назви',
				ownerUid,
				ownerEmail,
				members: [ownerEmail],
				backgroundColor: '#fbf8f2',
				createdAt: now,
				updatedAt: now,
			});
			set({ projects: [project, ...get().projects] });
			return project;
		} catch (error) {
			console.error(error);
			toast.error('Не вдалося створити проєкт.');
			return null;
		}
	},

	rename: async (id, name) => {
		const trimmed = name.trim() || 'Без назви';
		set({ projects: get().projects.map((p) => (p.id === id ? { ...p, name: trimmed } : p)) });
		try {
			await dbProjects.update({ id, name: trimmed, updatedAt: Date.now() });
		} catch (error) {
			console.error(error);
			toast.error('Не вдалося перейменувати проєкт.');
		}
	},

	remove: async (id) => {
		const prev = get().projects;
		set({ projects: prev.filter((p) => p.id !== id) });
		try {
			await dbProjects.delete(id);
		} catch (error) {
			console.error(error);
			toast.error('Не вдалося видалити проєкт.');
			set({ projects: prev });
		}
	},

	duplicate: async (project) => {
		try {
			const now = Date.now();
			const copy = await dbProjects.create({
				name: `${project.name} (копія)`,
				ownerUid: project.ownerUid,
				ownerEmail: project.ownerEmail,
				members: project.members,
				backgroundColor: project.backgroundColor,
				createdAt: now,
				updatedAt: now,
			});
			set({ projects: [copy, ...get().projects] });
			toast.info('Копію створено без фігур — дублювання вмісту заплановане на наступну фазу.');
			return copy;
		} catch (error) {
			console.error(error);
			toast.error('Не вдалося дублювати проєкт.');
			return null;
		}
	},

	addMember: async (id, email) => {
		const project = get().projects.find((p) => p.id === id);
		if (!project) return;
		const normalized = email.trim().toLowerCase();
		if (!normalized || project.members.includes(normalized)) return;
		const members = [...project.members, normalized];
		set({ projects: get().projects.map((p) => (p.id === id ? { ...p, members } : p)) });
		try {
			await dbProjects.update({ id, members, updatedAt: Date.now() });
			toast.success(`${normalized} додано до проєкту.`);
		} catch (error) {
			console.error(error);
			toast.error('Не вдалося додати учасника.');
		}
	},

	removeMember: async (id, email) => {
		const project = get().projects.find((p) => p.id === id);
		if (!project) return;
		const members = project.members.filter((m) => m !== email);
		set({ projects: get().projects.map((p) => (p.id === id ? { ...p, members } : p)) });
		try {
			await dbProjects.update({ id, members, updatedAt: Date.now() });
		} catch (error) {
			console.error(error);
			toast.error('Не вдалося прибрати учасника.');
		}
	},
}));
