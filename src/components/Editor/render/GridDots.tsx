import type { ReactNode } from 'react';
import { Line } from 'react-konva';
import type { View } from '../../../domain/view';
import { canvasTheme, GRID_STEP } from './theme';

interface GridDotsProps {
	view: View;
	width: number;
	height: number;
}

/** Фонова сітка канвасу — спільна для редактора (`BoardCanvas`) і публічного перегляду (`ReadOnlyCanvas`). */
export default function GridDots({ view, width, height }: GridDotsProps) {
	if (!width || !height) return null;
	const step = GRID_STEP * view.scale;
	if (step < 6) return null;
	const startX = view.offsetX % step;
	const startY = view.offsetY % step;
	const lines: ReactNode[] = [];
	for (let x = startX; x < width; x += step) {
		lines.push(<Line key={`v${x}`} points={[x, 0, x, height]} stroke={canvasTheme.gridDot} strokeWidth={1} opacity={0.5} />);
	}
	for (let y = startY; y < height; y += step) {
		lines.push(<Line key={`h${y}`} points={[0, y, width, y]} stroke={canvasTheme.gridDot} strokeWidth={1} opacity={0.5} />);
	}
	return <>{lines}</>;
}
