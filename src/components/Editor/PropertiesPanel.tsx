import {
	AlignHorizontalDistributeCenter,
	AlignHorizontalJustifyCenter,
	AlignHorizontalJustifyEnd,
	AlignHorizontalJustifyStart,
	AlignVerticalDistributeCenter,
	AlignVerticalJustifyCenter,
	AlignVerticalJustifyEnd,
	AlignVerticalJustifyStart,
	BringToFront,
	Copy,
	Group as GroupIcon,
	type LucideIcon,
	SendToBack,
	Trash2,
	Ungroup,
} from 'lucide-react';
import type { AlignMode } from '../../domain/geometry';
import { fillSwatches, strokeSwatches } from './render/theme';
import { useBoardStore } from '../../store/useBoardStore';
import { cn } from '../../utils/cn';

const STROKE_WIDTHS = [1, 2, 4, 8];

const ALIGN_BUTTONS: { mode: AlignMode; icon: LucideIcon; label: string }[] = [
	{ mode: 'left', icon: AlignHorizontalJustifyStart, label: 'До лівого краю' },
	{ mode: 'centerX', icon: AlignHorizontalJustifyCenter, label: 'По горизонтальному центру' },
	{ mode: 'right', icon: AlignHorizontalJustifyEnd, label: 'До правого краю' },
	{ mode: 'top', icon: AlignVerticalJustifyStart, label: 'До верхнього краю' },
	{ mode: 'centerY', icon: AlignVerticalJustifyCenter, label: 'По вертикальному центру' },
	{ mode: 'bottom', icon: AlignVerticalJustifyEnd, label: 'До нижнього краю' },
];

const colorInputClass =
	'h-6 w-6 shrink-0 cursor-pointer rounded-full border-2 border-panel-border bg-transparent p-0 ' +
	'[&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none ' +
	'[&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none';

export default function PropertiesPanel() {
	const {
		tool,
		selected,
		elements,
		styleDefaults,
		setStyle,
		deleteSelected,
		duplicateSelected,
		bringToFront,
		sendToBack,
		groupSelected,
		ungroupSelected,
		alignSelected,
		distributeSelected,
	} = useBoardStore();

	const drawing = tool !== 'select' && tool !== 'pan' && tool !== 'eraser';
	const hasSelection = selected.length > 0;
	const visible = drawing || hasSelection;
	const multiSelected = selected.length > 1;
	const canDistribute = selected.length > 2;
	const canUngroup = selected.some((id) => elements[id]?.groupId);
	// Кадр завжди нейтрального кольору, зображення взагалі не має "обведення/заповнення" в звичному
	// сенсі (див. ElementShape) — свотчі для них нічого не змінюють, тож ховаємо, щоб не виглядало
	// як непрацюючі кнопки.
	const noStyleControls = hasSelection
		? selected.every((id) => elements[id]?.type === 'frame' || elements[id]?.type === 'image')
		: tool === 'frame';

	// Коли є виділення — показуємо стиль ПЕРШОГО обраного елемента; інакше — стиль наступної фігури.
	const active = hasSelection ? (elements[selected[0]] ?? null) : null;
	const style = active ?? styleDefaults;

	return (
		// Панель НІКОЛИ не розмонтовується — з'являється/зникає чистим CSS-переходом ширини й
		// прозорості. Свідомо без JS mount/unmount-хореографії (useState+useEffect+setTimeout): та
		// версія мала race condition між застарілим таймером закриття і рендер-тайм переходом.
		<div
			className={cn(
				'z-10 shrink-0 overflow-hidden border-panel-border bg-panel transition-all duration-200 ease-out',
				visible ? 'w-52 border-l opacity-100' : 'pointer-events-none w-0 border-l-0 opacity-0',
			)}
		>
			<div className="flex h-full w-52 flex-col gap-4 p-3 text-sm">
				{!noStyleControls && (
					<>
						<div>
							<div className="mb-1.5 text-xs font-medium text-muted">Обведення</div>
							<div className="flex flex-wrap gap-1.5">
								{strokeSwatches.map((c) => (
									<button
										key={c}
										onClick={() => setStyle({ stroke: c })}
										className={cn('h-6 w-6 shrink-0 rounded-full border-2', style.stroke === c ? 'border-brand' : 'border-transparent')}
										style={{ backgroundColor: c }}
									/>
								))}
								<input
									type="color"
									value={/^#/.test(style.stroke) ? style.stroke : '#1e1b2e'}
									onChange={(e) => setStyle({ stroke: e.target.value })}
									className={colorInputClass}
									title="Свій колір обведення"
								/>
							</div>
						</div>

						<div>
							<div className="mb-1.5 text-xs font-medium text-muted">Заповнення</div>
							<div className="flex flex-wrap gap-1.5">
								{fillSwatches.map((c) => (
									<button
										key={c}
										onClick={() => setStyle({ fill: c })}
										className={cn(
											'h-6 w-6 shrink-0 rounded-full border-2 bg-size-[8px_8px]',
											style.fill === c ? 'border-brand' : 'border-panel-border',
											c === 'transparent' &&
												'bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)]',
										)}
										style={{ backgroundColor: c === 'transparent' ? undefined : c }}
									/>
								))}
								<input
									type="color"
									value={/^#/.test(style.fill) ? style.fill : '#efebfc'}
									onChange={(e) => setStyle({ fill: e.target.value })}
									className={colorInputClass}
									title="Свій колір заповнення"
								/>
							</div>
						</div>

						<div>
							<div className="mb-1.5 text-xs font-medium text-muted">Товщина лінії</div>
							<div className="flex gap-1.5">
								{STROKE_WIDTHS.map((w) => (
									<button
										key={w}
										onClick={() => setStyle({ strokeWidth: w })}
										className={cn(
											'flex h-8 flex-1 items-center justify-center rounded-md border',
											style.strokeWidth === w ? 'border-brand bg-brand-bg' : 'border-panel-border',
										)}
									>
										<span className="w-4 rounded-full bg-page-text" style={{ height: w }} />
									</button>
								))}
							</div>
						</div>
					</>
				)}

				<div>
					<div className="mb-1.5 flex justify-between text-xs font-medium text-muted">
						<span>Прозорість</span>
						<span>{Math.round(style.opacity * 100)}%</span>
					</div>
					<input
						type="range"
						min={0.1}
						max={1}
						step={0.05}
						value={style.opacity}
						onChange={(e) => setStyle({ opacity: Number(e.target.value) })}
						className="w-full accent-brand"
					/>
				</div>

				{multiSelected && (
					<div className="flex flex-col gap-1.5 border-t border-panel-border pt-3">
						<div className="mb-1.5 text-xs font-medium text-muted">Вирівнювання</div>
						<div className="grid grid-cols-6 gap-1">
							{ALIGN_BUTTONS.map(({ mode, icon: Icon, label }) => (
								<button
									key={mode}
									onClick={() => alignSelected(mode)}
									title={label}
									className="flex h-8 items-center justify-center rounded-md border border-panel-border hover:bg-page-bg"
								>
									<Icon className="h-3.5 w-3.5" />
								</button>
							))}
						</div>
						{canDistribute && (
							<div className="flex gap-1.5">
								<button
									onClick={() => distributeSelected('horizontal')}
									title="Розподілити по горизонталі"
									className="flex h-8 flex-1 items-center justify-center rounded-md border border-panel-border hover:bg-page-bg"
								>
									<AlignHorizontalDistributeCenter className="h-3.5 w-3.5" />
								</button>
								<button
									onClick={() => distributeSelected('vertical')}
									title="Розподілити по вертикалі"
									className="flex h-8 flex-1 items-center justify-center rounded-md border border-panel-border hover:bg-page-bg"
								>
									<AlignVerticalDistributeCenter className="h-3.5 w-3.5" />
								</button>
							</div>
						)}
						<button
							onClick={canUngroup ? ungroupSelected : groupSelected}
							title={canUngroup ? 'Розгрупувати (Ctrl+Shift+G)' : 'Групувати (Ctrl+G)'}
							className="flex h-8 items-center justify-center gap-1.5 rounded-md border border-panel-border hover:bg-page-bg"
						>
							{canUngroup ? <Ungroup className="h-3.5 w-3.5" /> : <GroupIcon className="h-3.5 w-3.5" />}
							{canUngroup ? 'Розгрупувати' : 'Групувати'}
						</button>
					</div>
				)}

				{hasSelection && (
					<div className="mt-auto flex flex-col gap-1.5 border-t border-panel-border pt-3">
						<div className="flex gap-1.5">
							<button
								onClick={duplicateSelected}
								title="Дублювати (Ctrl+D)"
								className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-panel-border hover:bg-page-bg"
							>
								<Copy className="h-3.5 w-3.5" /> Копія
							</button>
							<button
								onClick={deleteSelected}
								title="Видалити"
								className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-panel-border text-danger hover:bg-page-bg"
							>
								<Trash2 className="h-3.5 w-3.5" /> Видалити
							</button>
						</div>
						<div className="flex gap-1.5">
							<button
								onClick={bringToFront}
								title="На передній план"
								className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-panel-border hover:bg-page-bg"
							>
								<BringToFront className="h-3.5 w-3.5" /> Наперед
							</button>
							<button
								onClick={sendToBack}
								title="На задній план"
								className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md border border-panel-border hover:bg-page-bg"
							>
								<SendToBack className="h-3.5 w-3.5" /> Назад
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
