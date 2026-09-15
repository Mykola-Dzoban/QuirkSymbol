import { useEffect, useRef } from 'react';
import type { BoardElement } from '../../../domain/board';
import type { View } from '../../../domain/view';
import { toScreen } from '../../../domain/view';
import { canvasTheme } from './theme';

interface FrameLabelEditorProps {
	element: BoardElement;
	view: View;
	onCommit: (text: string) => void;
	onCancel: () => void;
}

const LABEL_FONT_SIZE = 13;
const LABEL_OFFSET_Y = -20;

/**
 * Однорядковий inline-редактор підпису кадру (подвійний клік на "Кадр" у `ElementShape`) — на
 * відміну від `TextEditorOverlay`, не змінює розмір/geometry самого кадру, лише `text`-підпис.
 */
export default function FrameLabelEditor({ element, view, onCommit, onCancel }: FrameLabelEditorProps) {
	const ref = useRef<HTMLInputElement | null>(null);

	useEffect(() => {
		ref.current?.focus();
		ref.current?.select();
	}, []);

	const commit = () => {
		const value = ref.current?.value ?? '';
		onCommit(value.trim() || 'Кадр');
	};

	const screen = toScreen(element.x, element.y + LABEL_OFFSET_Y, view);
	const fontSize = LABEL_FONT_SIZE * view.scale;

	return (
		<input
			ref={ref}
			defaultValue={element.text ?? ''}
			className="absolute border-none bg-transparent p-0 leading-none outline-none"
			style={{ left: screen.x, top: screen.y, fontSize, color: canvasTheme.frameStroke, fontFamily: 'Inter, sans-serif', minWidth: 60 }}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === 'Escape') {
					e.preventDefault();
					onCancel();
				}
				if (e.key === 'Enter') {
					e.preventDefault();
					commit();
				}
			}}
		/>
	);
}
