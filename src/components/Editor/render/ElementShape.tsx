import Konva from 'konva';
import { forwardRef } from 'react';
import { Arrow, Ellipse, Group, Image as KonvaImage, Line, Rect, Text as KonvaText } from 'react-konva';
import type { BoardElement } from '../../../domain/board';
import { canvasTheme } from './theme';
import { useLoadedImage } from './useLoadedImage';

interface ElementShapeProps {
	element: BoardElement;
	selected: boolean;
	onDblClick?: () => void;
}

/**
 * Одна фігура дошки → відповідний Konva-примітив, у власному візуальному стилі (не rough.js, не
 * generic-flat). Вибір/переміщення фігур обробляє `BoardCanvas` на рівні Stage (через bubbling
 * `e.target`), тож тут потрібен лише `onDblClick` — подвійний клік на тексті відкриває редагування.
 */
const ElementShape = forwardRef<Konva.Node, ElementShapeProps>(({ element: el, selected, onDblClick }, ref) => {
	// Хук викликається БЕЗУМОВНО для кожного елемента (правила хуків), навіть якщо він не 'image' —
	// тоді `src` undefined і хук одразу повертає null, майже без вартості.
	const loadedImage = useLoadedImage(el.type === 'image' ? el.src : undefined);

	const shadowProps = selected
		? {
				shadowColor: canvasTheme.selectionShadowColor,
				shadowBlur: canvasTheme.selectionShadowBlur,
				shadowOpacity: canvasTheme.selectionShadowOpacity,
				shadowForStrokeEnabled: false,
			}
		: {};

	const common = {
		id: el.id,
		rotation: el.angle,
		opacity: el.opacity,
		onDblClick,
		onDblTap: onDblClick,
		...shadowProps,
	};

	switch (el.type) {
		case 'rectangle':
			return (
				<Rect
					ref={ref as never}
					{...common}
					x={el.x}
					y={el.y}
					width={el.width}
					height={el.height}
					cornerRadius={el.cornerRadius ?? 6}
					stroke={el.stroke}
					fill={el.fill}
					strokeWidth={el.strokeWidth}
					lineJoin="round"
				/>
			);
		case 'ellipse':
			return (
				<Ellipse
					ref={ref as never}
					{...common}
					x={el.x + el.width / 2}
					y={el.y + el.height / 2}
					radiusX={Math.abs(el.width) / 2}
					radiusY={Math.abs(el.height) / 2}
					stroke={el.stroke}
					fill={el.fill}
					strokeWidth={el.strokeWidth}
				/>
			);
		case 'diamond': {
			const w = el.width;
			const h = el.height;
			const points = [w / 2, 0, w, h / 2, w / 2, h, 0, h / 2];
			return (
				<Line
					ref={ref as never}
					{...common}
					x={el.x}
					y={el.y}
					points={points}
					closed
					stroke={el.stroke}
					fill={el.fill}
					strokeWidth={el.strokeWidth}
					lineJoin="round"
				/>
			);
		}
		case 'arrow':
			return (
				<Arrow
					ref={ref as never}
					{...common}
					x={el.x}
					y={el.y}
					points={el.points ?? [0, 0, el.width, el.height]}
					stroke={el.stroke}
					fill={el.stroke}
					strokeWidth={el.strokeWidth}
					lineCap="round"
					lineJoin="round"
					pointerLength={10}
					pointerWidth={10}
				/>
			);
		case 'line':
			return (
				<Line
					ref={ref as never}
					{...common}
					x={el.x}
					y={el.y}
					points={el.points ?? [0, 0, el.width, el.height]}
					stroke={el.stroke}
					strokeWidth={el.strokeWidth}
					lineCap="round"
					lineJoin="round"
				/>
			);
		case 'draw':
			return (
				<Line
					ref={ref as never}
					{...common}
					x={el.x}
					y={el.y}
					points={el.points ?? []}
					stroke={el.stroke}
					strokeWidth={el.strokeWidth}
					lineCap="round"
					lineJoin="round"
					tension={0.4}
					bezier
				/>
			);
		case 'text':
			return (
				<KonvaText
					ref={ref as never}
					{...common}
					x={el.x}
					y={el.y}
					width={el.width || undefined}
					text={el.text || ''}
					fontSize={el.fontSize ?? 20}
					fontFamily="Inter, sans-serif"
					fill={el.stroke}
				/>
			);
		case 'frame':
			// Завжди нейтрального кольору (не el.stroke/el.fill) — кадр структурний, не "кольорова фігура".
			// `id` навмисно і на Group, і на дітях: клік влучає в дитину (Rect/Text) → потрібен їй id для
			// виділення, а Transformer шукає вузол по id через `stage.findOne` — preorder-обхід віддає
			// Group першою (вона предок), тож ручки трансформації рухають групу цілком, разом з підписом.
			return (
				<Group ref={ref as never} {...common} x={el.x} y={el.y}>
					<Rect id={el.id} width={el.width} height={el.height} stroke={canvasTheme.frameStroke} strokeWidth={1.5} dash={[6, 4]} fill="transparent" />
					<KonvaText id={el.id} x={0} y={-20} text={el.text || 'Кадр'} fontSize={13} fontFamily="Inter, sans-serif" fill={canvasTheme.frameStroke} />
				</Group>
			);
		case 'image':
			if (!loadedImage) return null;
			return <KonvaImage ref={ref as never} {...common} x={el.x} y={el.y} width={el.width} height={el.height} image={loadedImage} />;
		default:
			return null;
	}
});
ElementShape.displayName = 'ElementShape';

export default ElementShape;
