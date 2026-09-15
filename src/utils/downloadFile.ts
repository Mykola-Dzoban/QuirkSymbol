/** Ініціює завантаження data URL як файл у браузері (без бекенду — суто клієнтський `<a download>`). */
export function downloadDataUrl(dataUrl: string, filename: string): void {
	const a = document.createElement('a');
	a.href = dataUrl;
	a.download = filename;
	a.click();
}

/** Те саме для довільних даних, серіалізованих у JSON — через Blob, бо великі сцени не влізуть у data URL зручно. */
export function downloadJson(data: unknown, filename: string): void {
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	downloadDataUrl(url, filename);
	URL.revokeObjectURL(url);
}

/** Завантажує готовий текстовий вміст (SVG-розмітку тощо) як файл заданого MIME-типу. */
export function downloadText(content: string, filename: string, mimeType: string): void {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);
	downloadDataUrl(url, filename);
	URL.revokeObjectURL(url);
}
