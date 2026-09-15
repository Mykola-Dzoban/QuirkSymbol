import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef, useState } from 'react';
import { Group, Layer, Stage } from 'react-konva';
import { visibleElements, type BoardElement } from '../../../domain/board';
import { zoomAt, type View } from '../../../domain/view';
import { useElementSize } from '../../../utils/useElementSize';
import ElementShape from '../render/ElementShape';
import GridDots from '../render/GridDots';

interface ReadOnlyCanvasProps {
	elements: Record<string, BoardElement>;
}

/**
 * Спрощений канвас для публічного "тільки перегляд" посилання (`/view/:projectId`) — лише пан/зум,
 * без інструментів/виділення/запису у Firestore. Свідомо не `BoardCanvas` з вимкненими фічами: тут
 * узагалі немає `useBoardStore` (анонімний відвідувач не має `uid`, і йому нічого туди й писати).
 */
export default function ReadOnlyCanvas({ elements }: ReadOnlyCanvasProps) {
	const { ref, width, height } = useElementSize<HTMLDivElement>();
	const stageRef = useRef<Konva.Stage | null>(null);
	const panRef = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
	const [view, setView] = useState<View>({ offsetX: 0, offsetY: 0, scale: 1 });

	const els = visibleElements(elements);

	const onWheel = (e: KonvaEventObject<WheelEvent>) => {
		e.evt.preventDefault();
		const pos = stageRef.current?.getPointerPosition();
		if (pos) setView((v) => zoomAt(v, pos.x, pos.y, e.evt.deltaY < 0 ? 1.08 : 1 / 1.08));
	};

	const onMouseDown = (e: KonvaEventObject<MouseEvent>) => {
		e.evt.preventDefault();
		const p = stageRef.current?.getPointerPosition();
		if (!p) return;
		panRef.current = { x: p.x, y: p.y, ox: view.offsetX, oy: view.offsetY };
	};

	const onMouseMove = () => {
		if (!panRef.current) return;
		const pos = stageRef.current?.getPointerPosition();
		if (!pos) return;
		const start = panRef.current;
		setView((v) => ({ ...v, offsetX: start.ox + (pos.x - start.x), offsetY: start.oy + (pos.y - start.y) }));
	};

	const onMouseUp = () => {
		panRef.current = null;
	};

	return (
		<div ref={ref} className="relative h-full w-full overflow-hidden bg-canvas-bg">
			<Stage
				ref={stageRef}
				width={width}
				height={height}
				onWheel={onWheel}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				onMouseUp={onMouseUp}
				onMouseLeave={onMouseUp}
				onContextMenu={(e) => e.evt.preventDefault()}
				style={{ cursor: 'grab' }}
			>
				<Layer listening={false}>
					<GridDots view={view} width={width} height={height} />
				</Layer>
				<Layer listening={false}>
					<Group x={view.offsetX} y={view.offsetY} scaleX={view.scale} scaleY={view.scale}>
						{els.map((el) => (
							<ElementShape key={el.id} element={el} selected={false} />
						))}
					</Group>
				</Layer>
			</Stage>
		</div>
	);
}
