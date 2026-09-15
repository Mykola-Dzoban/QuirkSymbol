import { useEffect, useRef, useState } from 'react';
import type { View } from '../../../domain/view';
import { toScreen } from '../../../domain/view';

interface CommentComposerProps {
	x: number;
	y: number;
	view: View;
	onCommit: (text: string) => void;
	onCancel: () => void;
}

/** Мінікомпозер нового треду коментаря — з'являється в точці кліку інструментом "Коментар" (Фаза 2). */
export default function CommentComposer({ x, y, view, onCommit, onCancel }: CommentComposerProps) {
	const ref = useRef<HTMLTextAreaElement | null>(null);
	const [value, setValue] = useState('');

	useEffect(() => {
		ref.current?.focus();
	}, []);

	const submit = () => {
		if (value.trim()) onCommit(value);
		else onCancel();
	};

	const screen = toScreen(x, y, view);

	return (
		<div
			className="absolute z-30 w-56 rounded-xl border border-panel-border bg-panel p-2 shadow-lg"
			style={{ left: screen.x + 14, top: screen.y - 8 }}
			onMouseDown={(e) => e.stopPropagation()}
		>
			<textarea
				ref={ref}
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder="Написати коментар…"
				rows={3}
				className="w-full resize-none rounded-md border border-panel-border bg-page-bg p-1.5 text-sm outline-none focus:border-brand"
				onKeyDown={(e) => {
					if (e.key === 'Escape') {
						e.preventDefault();
						onCancel();
					}
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						submit();
					}
				}}
			/>
			<div className="mt-1.5 flex justify-end gap-1.5">
				<button onClick={onCancel} className="rounded-md px-2 py-1 text-xs text-muted hover:bg-page-bg">
					Скасувати
				</button>
				<button onClick={submit} className="rounded-md bg-brand px-2.5 py-1 text-xs text-white hover:bg-brand-hover">
					Додати
				</button>
			</div>
		</div>
	);
}
