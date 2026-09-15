/** Канвас-палітра — власний стиль, свідомо не rough.js sketchy й не generic-flat (див. план). */
export const canvasTheme = {
	background: '#fbf8f2',
	gridDot: '#e2dccd',
	selectionStroke: '#6c5ce7',
	selectionShadowColor: '#6c5ce7',
	selectionShadowBlur: 10,
	selectionShadowOpacity: 0.35,
	marqueeFill: 'rgba(108, 92, 231, 0.08)',
	marqueeStroke: '#6c5ce7',
	snapGuideStroke: '#ff5c8a',
	/** Кадр (Frame tool) завжди нейтрального кольору, незалежно від палітри обведення — це структурний
	 *  елемент, не "фігура з кольором", як у справжньому Excalidraw. */
	frameStroke: '#868e96',
	/** Заливка плейсхолдера веб-вбудови, поки вона не виділена (`ElementShape.tsx` case 'embed'). */
	embedFill: '#f1f3f5',
};

/** Свотчі, які показує PropertiesPanel — швидкий вибір з поширених відтінків + свій колір (input[type=color]). */
export const strokeSwatches = [
	'#1e1b2e', // чорнило
	'#495057', // сірий
	'#e03131', // червоний
	'#e8590c', // оранжевий
	'#f08c00', // бурштиновий
	'#2f9e44', // зелений
	'#0c8599', // бірюзовий
	'#1971c2', // синій
	'#6c5ce7', // фірмовий фіолетовий
	'#ae3ec9', // пурпуровий
];
export const fillSwatches = [
	'transparent',
	'#f1f3f5', // світло-сірий
	'#ffe3e3', // червоний
	'#ffe8cc', // оранжевий
	'#fff3bf', // бурштиновий
	'#d3f9d8', // зелений
	'#c5f6fa', // бірюзовий
	'#d0ebff', // синій
	'#efebfc', // фіолетовий
];

export const GRID_STEP = 20;
