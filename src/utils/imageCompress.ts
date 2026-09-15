import { base64ByteSize, fitWithinDimension } from '../domain/imageFit';

/**
 * Немає Firebase Storage (Blaze-план свідомо не підключаємо) — зображення йдуть як base64 просто в
 * документ фігури у Firestore. Документ обмежений 1 МБ, тож стискаємо агресивно: невеликий розмір і
 * JPEG-якість, що падає, поки файл не влізе в бюджет; якщо й на мінімумі забагато — зменшуємо ще й
 * розміри та пробуємо знову.
 */
const INITIAL_MAX_DIMENSION = 800;
const MIN_DIMENSION = 200;
const DIMENSION_SHRINK_FACTOR = 0.75;
const MAX_BYTES = 180_000;
const HARD_BYTE_LIMIT = 700_000;
const INITIAL_QUALITY = 0.6;
const MIN_QUALITY = 0.3;
const QUALITY_STEP = 0.1;

function loadImageElement(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file);
		const img = new Image();
		img.onload = () => {
			URL.revokeObjectURL(url);
			resolve(img);
		};
		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Не вдалося прочитати файл зображення.'));
		};
		img.src = url;
	});
}

export interface CompressedImage {
	dataUrl: string;
	width: number;
	height: number;
}

/** Стискає файл зображення на клієнті — див. коментар вище щодо бюджету розміру. */
export async function compressImageFile(file: File): Promise<CompressedImage> {
	const img = await loadImageElement(file);
	const ctx2d = document.createElement('canvas').getContext('2d');
	if (!ctx2d) throw new Error('Canvas недоступний у цьому браузері.');

	let maxDim = INITIAL_MAX_DIMENSION;
	let best: CompressedImage | null = null;

	while (maxDim >= MIN_DIMENSION) {
		const { width, height } = fitWithinDimension(img.naturalWidth || img.width, img.naturalHeight || img.height, maxDim);
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Canvas недоступний у цьому браузері.');
		ctx.drawImage(img, 0, 0, width, height);

		let quality = INITIAL_QUALITY;
		let dataUrl = canvas.toDataURL('image/jpeg', quality);
		while (base64ByteSize(dataUrl) > MAX_BYTES && quality > MIN_QUALITY) {
			quality -= QUALITY_STEP;
			dataUrl = canvas.toDataURL('image/jpeg', quality);
		}

		best = { dataUrl, width, height };
		if (base64ByteSize(dataUrl) <= MAX_BYTES) return best;
		maxDim = Math.round(maxDim * DIMENSION_SHRINK_FACTOR);
	}

	// Найкраще, що вдалося — трохи над "м'яким" бюджетом MAX_BYTES, але ще далеко до ліміту Firestore.
	if (best && base64ByteSize(best.dataUrl) <= HARD_BYTE_LIMIT) return best;
	throw new Error('Не вдалося стиснути зображення до прийнятного розміру — спробуйте інший файл.');
}
