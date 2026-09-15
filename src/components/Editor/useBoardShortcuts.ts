import { useEffect } from 'react';
import type { Tool } from '../../domain/board';
import { useBoardStore } from '../../store/useBoardStore';

const SHORTCUTS: Record<string, Tool> = {
	v: 'select',
	r: 'rectangle',
	o: 'ellipse',
	d: 'diamond',
	a: 'arrow',
	l: 'line',
	p: 'draw',
	t: 'text',
	f: 'frame',
	e: 'eraser',
	h: 'pan',
};

/** Гарячі клавіші канвасу — спільні для гостьової дошки (`GuestBoard`) і хмарного проєкту (`Editor`). */
export function useBoardShortcuts() {
	const { setTool, deleteSelected, duplicateSelected, undo, redo, clearSelection, helpOpen, setHelpOpen, groupSelected, ungroupSelected } =
		useBoardStore();

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
				e.preventDefault();
				if (e.shiftKey) redo();
				else undo();
				return;
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
				e.preventDefault();
				redo();
				return;
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
				e.preventDefault();
				duplicateSelected();
				return;
			}
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
				e.preventDefault();
				if (e.shiftKey) ungroupSelected();
				else groupSelected();
				return;
			}
			if (e.key === 'Delete' || e.key === 'Backspace') {
				deleteSelected();
				return;
			}
			if (e.key === 'Escape') {
				clearSelection();
				setTool('select');
				return;
			}
			if (e.key === '?') {
				e.preventDefault();
				setHelpOpen(!helpOpen);
				return;
			}
			const tool = SHORTCUTS[e.key.toLowerCase()];
			if (tool && !e.ctrlKey && !e.metaKey) setTool(tool);
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [undo, redo, deleteSelected, duplicateSelected, clearSelection, setTool, helpOpen, setHelpOpen, groupSelected, ungroupSelected]);
}
