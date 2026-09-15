/** Масштабує `width×height` так, щоб довша сторона не перевищувала `maxDim`, зберігаючи пропорції. */
export function fitWithinDimension(width: number, height: number, maxDim: number): { width: number; height: number } {
	if (width <= maxDim && height <= maxDim) return { width, height };
	const scale = maxDim / Math.max(width, height);
	return { width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale)) };
}

/** Приблизний розмір у байтах декодованого вмісту data URI (base64 розширюється на ~4/3). */
export function base64ByteSize(dataUrl: string): number {
	const comma = dataUrl.indexOf(',');
	const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
	return Math.round(base64.length * 0.75);
}
