import { useCallback } from 'react';
import { compressImageFile } from '../../utils/imageCompress';
import { useBoardStore } from '../../store/useBoardStore';
import { toast } from '../UI/toast';

/**
 * Стискає файл зображення й вставляє його по центру видимого вʼюпорту — спільна логіка для кнопки
 * "Зображення" на тулбарі (`Toolbar.tsx`) і вставки з буфера обміну (`BoardCanvas.tsx`, Ctrl+V).
 */
export function useImageInsert() {
	const { stageSize, toWorld, insertImage } = useBoardStore();

	return useCallback(
		async (file: File) => {
			try {
				const { dataUrl, width, height } = await compressImageFile(file);
				const center = toWorld(stageSize.width / 2, stageSize.height / 2);
				insertImage(dataUrl, width, height, center.x, center.y);
			} catch (err) {
				toast.error(err instanceof Error ? err.message : 'Не вдалося вставити зображення.');
			}
		},
		[stageSize, toWorld, insertImage],
	);
}
