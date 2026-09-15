import { LayoutGrid, LogIn, Minus, PenTool, Plus, Redo2, Undo2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { UrlConfig } from '../../constants/urls';
import { useAuthStore } from '../../store/useAuthStore';
import { useBoardStore } from '../../store/useBoardStore';
import HamburgerMenu from './HamburgerMenu';

/** TopBar гостьової дошки — без назви проєкту й учасників (їх ще немає), з CTA увійти/до проєктів. */
export default function GuestTopBar() {
	const { view, zoomByFactor, history, undo, redo } = useBoardStore();
	const { user } = useAuthStore();

	return (
		<div className="z-10 flex h-14 shrink-0 items-center gap-3 border-b border-panel-border bg-panel px-3">
			<HamburgerMenu />
			<div className="flex items-center gap-2 pr-1 text-sm font-semibold">
				<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-white">
					<PenTool className="h-3.5 w-3.5" />
				</span>
				QuirkSymbol
			</div>

			<div className="flex items-center gap-0.5">
				<button
					onClick={undo}
					disabled={history.past.length === 0}
					title="Скасувати (Ctrl+Z)"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-page-text hover:bg-page-bg disabled:opacity-30"
				>
					<Undo2 className="h-4 w-4" />
				</button>
				<button
					onClick={redo}
					disabled={history.future.length === 0}
					title="Повторити (Ctrl+Shift+Z)"
					className="flex h-8 w-8 items-center justify-center rounded-lg text-page-text hover:bg-page-bg disabled:opacity-30"
				>
					<Redo2 className="h-4 w-4" />
				</button>
			</div>

			<div className="flex items-center gap-0.5 rounded-lg border border-panel-border px-1">
				<button onClick={() => zoomByFactor(1 / 1.2)} className="flex h-8 w-7 items-center justify-center text-page-text hover:text-brand">
					<Minus className="h-3.5 w-3.5" />
				</button>
				<span className="w-10 text-center text-xs text-muted">{Math.round(view.scale * 100)}%</span>
				<button onClick={() => zoomByFactor(1.2)} className="flex h-8 w-7 items-center justify-center text-page-text hover:text-brand">
					<Plus className="h-3.5 w-3.5" />
				</button>
			</div>

			<div className="ml-auto flex items-center gap-2">
				{user ? (
					<Link
						to={UrlConfig.projects}
						className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-hover"
					>
						<LayoutGrid className="h-4 w-4" /> Мої проєкти
					</Link>
				) : (
					<Link
						to={UrlConfig.login}
						className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand-hover"
					>
						<LogIn className="h-4 w-4" /> Увійти, щоб зберегти як проєкт
					</Link>
				)}
			</div>
		</div>
	);
}
