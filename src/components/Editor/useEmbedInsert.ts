import { useCallback } from 'react';
import { isEmbeddableUrl } from '../../domain/board';
import { useBoardStore } from '../../store/useBoardStore';
import { toast } from '../UI/toast';

/**
 * Валідує посилання й вставляє веб-вбудову по центру видимого вʼюпорту — спільна логіка для `EmbedDialog`.
 * Повертає `true`/`false`, щоб викликач (діалог) знав, чи закривати форму, чи лишити для виправлення.
 */
export function useEmbedInsert() {
	const { stageSize, toWorld, insertEmbed } = useBoardStore();

	return useCallback(
		(url: string): boolean => {
			if (!isEmbeddableUrl(url)) {
				toast.error('Посилання має починатися з http:// або https://.');
				return false;
			}
			const center = toWorld(stageSize.width / 2, stageSize.height / 2);
			insertEmbed(url, center.x, center.y);
			return true;
		},
		[stageSize, toWorld, insertEmbed],
	);
}
