import { where } from 'firebase/firestore';
import { firebaseCollections, firebaseFirestore } from '../config/firebase.config';
import { FirebaseFactory } from '../config/firebase.factory';

export interface ProjectDoc {
	id: string;
	name: string;
	ownerUid: string;
	ownerEmail: string;
	/** Email-адреси учасників з доступом (включно з власником) — членство перевіряють і Firestore rules. */
	members: string[];
	backgroundColor: string;
	createdAt: number;
	updatedAt: number;
	/** Публічне посилання "тільки перегляд" (`/view/{id}`) — без входу, без email-запрошення. Вимкнено за замовчуванням. */
	publicViewEnabled?: boolean;
}

export const dbProjects = new FirebaseFactory<ProjectDoc>(firebaseFirestore, firebaseCollections.projects);

/** Проєкти, доступні `email` — і власні, і ті, куди його додали учасником. */
export function projectsForMember(email: string): Promise<ProjectDoc[]> {
	return dbProjects.query(where('members', 'array-contains', email));
}
