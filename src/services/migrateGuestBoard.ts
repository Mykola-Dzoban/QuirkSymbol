import { touchElement } from '../domain/board';
import { dbElements } from './elements.service';
import { loadLocalBoard } from './localBoard.service';

/**
 * Копіює видимі фігури з гостьової (localStorage) дошки в щойно створений `cloud`-проєкт — одноразова
 * дія при "Зберегти як проєкт" (`MigrateGuestBanner`). Гостьову дошку НЕ чіпає: вона лишається
 * локальною сторінкою-чернеткою (`/`), проєкт — окрема повноцінна копія з реалтайм-співпрацею.
 */
export async function migrateGuestBoardToProject(projectId: string, uid: string): Promise<number> {
	const guestElements = loadLocalBoard();
	const visible = Object.values(guestElements).filter((el) => !el.deleted);
	if (visible.length === 0) return 0;
	const db = dbElements(projectId);
	await Promise.all(visible.map((el) => db.set(el.id, touchElement({ ...el, version: 0 }, uid))));
	return visible.length;
}
