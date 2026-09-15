import { useEffect, useRef } from 'react';
import type { BoardElement } from '../../../domain/board';
import type { View } from '../../../domain/view';
import { toScreen } from '../../../domain/view';

interface TextEditorOverlayProps {
	element: BoardElement;
	view: View;
	onCommit: (text: string, width: number, height: number) => void;
	onCancel: () => void;
}

function measure(text: string, fontSize: number): { width: number; height: number } {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d');
	const lines = (text || ' ').split('\n');
	let width = 40;
	if (ctx) {
		ctx.font = `${fontSize}px Inter, sans-serif`;
		for (const line of lines) width = Math.max(width, ctx.measureText(line || ' ').width);
	}
	return { width: width + 8, height: lines.length * fontSize * 1.3 };
}

/** HTML-textarea поверх канвасу для редагування тексту — Konva не вміє нативний text input. */
export default function TextEditorOverlay({ element, view, onCommit, onCancel }: TextEditorOverlayProps) {
	const ref = useRef<HTMLTextAreaElement | null>(null);

	useEffect(() => {
		ref.current?.focus();
		ref.current?.select();
	}, []);

	const commit = () => {
		const value = ref.current?.value ?? '';
		if (!value.trim()) {
			onCancel();
			return;
		}
		const fontSize = element.fontSize ?? 20;
		const { width, height } = measure(value, fontSize);
		onCommit(value, width, height);
	};

	const screen = toScreen(element.x, element.y, view);
	const fontSize = (element.fontSize ?? 20) * view.scale;

	return (
		<textarea
			ref={ref}
			defaultValue={element.text ?? ''}
			className="absolute resize-none overflow-hidden border-none bg-transparent p-0 leading-[1.3] outline-none"
			style={{
				left: screen.x,
				top: screen.y,
				fontSize,
				color: element.stroke,
				fontFamily: 'Inter, sans-serif',
				minWidth: 40,
				minHeight: fontSize * 1.3,
			}}
			onBlur={commit}
			onKeyDown={(e) => {
				if (e.key === 'Escape') {
					e.preventDefault();
					onCancel();
				}
				if (e.key === 'Enter' && !e.shiftKey) {
					e.preventDefault();
					commit();
				}
			}}
			onInput={(e) => {
				const el = e.currentTarget;
				el.style.width = '1px';
				el.style.height = '1px';
				el.style.width = `${el.scrollWidth}px`;
				el.style.height = `${el.scrollHeight}px`;
			}}
		/>
	);
}
