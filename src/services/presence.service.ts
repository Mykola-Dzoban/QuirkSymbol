import { firebaseFirestore } from '../config/firebase.config';
import { FirebaseFactory } from '../config/firebase.factory';
import type { PresenceEntry } from '../domain/comment';

/** Підколекція `projects/{projectId}/presence` — документ на учасника (id = uid), live-курсор. */
export function dbPresence(projectId: string): FirebaseFactory<PresenceEntry> {
	return new FirebaseFactory<PresenceEntry>(firebaseFirestore, `projects/${projectId}/presence`);
}
