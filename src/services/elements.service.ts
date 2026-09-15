import { firebaseFirestore, elementsSubcollection } from '../config/firebase.config';
import { FirebaseFactory } from '../config/firebase.factory';
import type { BoardElement } from '../domain/board';

/** Підколекція `projects/{projectId}/elements` — по документу на фігуру, див. розділ "Реалтайм-синхронізація" у плані. */
export function dbElements(projectId: string): FirebaseFactory<BoardElement> {
	return new FirebaseFactory<BoardElement>(firebaseFirestore, `projects/${projectId}/${elementsSubcollection}`);
}
