import {
	ArrowUpRight,
	Circle,
	Diamond,
	Eraser,
	Flashlight,
	Frame,
	Globe,
	Hand,
	Image as ImageIcon,
	type LucideIcon,
	MessageCircle,
	MousePointer2,
	Minus,
	Pencil,
	Square,
	Type,
} from 'lucide-react';
import { useRef, useState } from 'react';
import type { Tool } from '../../domain/board';
import { useBoardStore } from '../../store/useBoardStore';
import { cn } from '../../utils/cn';
import EmbedDialog from './EmbedDialog';
import { useEmbedInsert } from './useEmbedInsert';
import { useImageInsert } from './useImageInsert';

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
	{ tool: 'laser', icon: Flashlight, label: 'Лазерна указка', shortcut: 'K' },
];

/** Плаваюча горизонтальна панель інструментів по центру зверху канвасу (як в Excalidraw), а не бічна рейка. */
export default function Toolbar() {
	const { tool, setTool, mode } = useBoardStore();
	const insertImageFromFile = useImageInsert();
	const insertEmbed = useEmbedInsert();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [embedDialogOpen, setEmbedDialogOpen] = useState(false);

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
				{/* Вставка зображення — одноразова дія (файл з диска), а не "тул", що лишається активним. */}
				<button
					title="Зображення"
					onClick={() => fileInputRef.current?.click()}
					className="flex h-10 w-10 items-center justify-center rounded-xl text-page-text transition-colors hover:bg-page-bg"
				>
					<ImageIcon className="h-5 w-5" />
				</button>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(e) => {
						const file = e.target.files?.[0];
						e.target.value = '';
						if (file) insertImageFromFile(file);
					}}
				/>
				{/* Веб-вбудова — так само одноразова дія (посилання в діалозі), а не "тул". */}
				<button
					title="Веб-вбудова"
					onClick={() => setEmbedDialogOpen(true)}
					className="flex h-10 w-10 items-center justify-center rounded-xl text-page-text transition-colors hover:bg-page-bg"
				>
					<Globe className="h-5 w-5" />
				</button>
				<EmbedDialog
					open={embedDialogOpen}
					onClose={() => setEmbedDialogOpen(false)}
					onSubmit={(url) => {
						const success = insertEmbed(url);
						if (success) setEmbedDialogOpen(false);
						return success;
					}}
				/>
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
