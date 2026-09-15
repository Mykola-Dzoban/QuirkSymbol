import { useEffect, useState } from 'react';

/**
 * Завантажує `src` (data URI зображення-елемента) у звичайний `HTMLImageElement`, як того вимагає
 * react-konva `<Image>` (приймає лише готовий завантажений вузол, не URL-рядок напряму).
 */
export function useLoadedImage(src: string | undefined): HTMLImageElement | null {
	const [image, setImage] = useState<HTMLImageElement | null>(null);

	useEffect(() => {
		// Немає стану "звільнити попереднє зображення" для реального перевикористання: `el.type`
		// елемента не змінюється після створення, тож `src` для конкретного змонтованого вузла або
		// завжди `undefined`, або завжди той самий рядок — нема кейсу "було завантажене, стало null".
		if (!src) return;
		const img = new Image();
		img.onload = () => setImage(img);
		img.src = src;
		return () => {
			img.onload = null;
		};
	}, [src]);

	return image;
}
