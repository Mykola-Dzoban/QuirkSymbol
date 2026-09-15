import {
	ArrowUpRight,
	Circle,
	Diamond,
	Eraser,
	Frame,
	Hand,
	type LucideIcon,
	MessageCircle,
	MousePointer2,
	Minus,
	Pencil,
	Square,
	Type,
} from 'lucide-react';
import type { Tool } from '../../domain/board';
import { useBoardStore } from '../../store/useBoardStore';
import { cn } from '../../utils/cn';

const TOOLS: { tool: Tool; icon: LucideIcon; label: string; shortcut: string }[] = [
	{ tool: 'pan', icon: Hand, label: 'Панорама', shortcut: 'H' },
	{ tool: 'select', icon: MousePointer2, label: 'Вибір', shortcut: 'V' },
	{ tool: 'rectangle', icon: Square, label: 'Прямокутник', shortcut: 'R' },
	{ tool: 'diamond', icon: Diamond, label: 'Ромб', shortcut: 'D' },
	{ tool: 'ellipse', icon: Circle, label: 'Еліпс', shortcut: 'O' },
	{ tool: 'arrow', icon: ArrowUpRight, label: 'Стрілка', shortcut: 'A' },
	{ tool: 'line', icon: Minus, label: 'Лінія', shortcut: 'L' },
	{ tool: 'draw', icon: Pencil, label: 'Малювання', shortcut: 'P' },
	{ tool: 'text', icon: Type, label: 'Текст', shortcut: 'T' },
	{ tool: 'frame', icon: Frame, label: 'Кадр', shortcut: 'F' },
	{ tool: 'eraser', icon: Eraser, label: 'Гумка', shortcut: 'E' },
];

/** Плаваюча горизонтальна панель інструментів по центру зверху канвасу (як в Excalidraw), а не бічна рейка. */
export default function Toolbar() {
	const { tool, setTool, mode } = useBoardStore();

	return (
		<div className="pointer-events-none absolute inset-x-0 top-3 z-20 flex justify-center">
			<div className="pointer-events-auto flex items-center gap-1 rounded-2xl border border-panel-border bg-panel p-1.5 shadow-lg">
				{TOOLS.map(({ tool: t, icon: Icon, label, shortcut }) => (
					<button
						key={t}
						title={`${label} (${shortcut})`}
						onClick={() => setTool(t)}
						className={cn(
							'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
							tool === t ? 'bg-brand text-white' : 'text-page-text hover:bg-page-bg',
						)}
					>
						<Icon className="h-5 w-5" />
					</button>
				))}
				{/* Коментарі (Фаза 2) — лише в командних проєктах: у гостьовій дошці нема з ким коментувати. */}
				{mode === 'cloud' && (
					<>
						<div className="mx-0.5 h-6 w-px bg-panel-border" />
						<button
							title="Коментар"
							onClick={() => setTool('comment')}
							className={cn(
								'flex h-10 w-10 items-center justify-center rounded-xl transition-colors',
								tool === 'comment' ? 'bg-brand text-white' : 'text-page-text hover:bg-page-bg',
							)}
						>
							<MessageCircle className="h-5 w-5" />
						</button>
					</>
				)}
			</div>
		</div>
	);
}
