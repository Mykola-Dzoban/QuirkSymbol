import { firebaseFirestore } from '../config/firebase.config';
import { FirebaseFactory } from '../config/firebase.factory';
import type { CommentThread } from '../domain/comment';

/** Підколекція `projects/{projectId}/comments` — по документу на тред, як `elements.service.ts`. */
export function dbComments(projectId: string): FirebaseFactory<CommentThread> {
	return new FirebaseFactory<CommentThread>(firebaseFirestore, `projects/${projectId}/comments`);
}
