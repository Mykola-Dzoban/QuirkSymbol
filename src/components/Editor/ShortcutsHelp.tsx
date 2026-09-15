import Modal from '../UI/Modal';
import { useBoardStore } from '../../store/useBoardStore';

const GROUPS: { title: string; rows: [string, string][] }[] = [
	{
		title: 'Загальні',
		rows: [
			['Скасувати / повторити', 'Ctrl+Z · Ctrl+Shift+Z'],
			['Дублювати вибране', 'Ctrl+D'],
			['Видалити вибране', 'Delete · Backspace'],
			['Зняти виділення / вихід', 'Escape'],
			['Гарячі клавіші (це вікно)', '?'],
		],
	},
	{
		title: 'Вид',
		rows: [
			['Панорама', 'Пробіл + тягнути'],
			['Масштаб', 'Колесо миші'],
		],
	},
	{
		title: 'Інструменти',
		rows: [
			['Вибір', 'V'],
			['Прямокутник', 'R'],
			['Еліпс', 'O'],
			['Ромб', 'D'],
			['Стрілка', 'A'],
			['Лінія', 'L'],
			['Малювання', 'P'],
			['Текст', 'T'],
			['Кадр', 'F'],
			['Гумка', 'E'],
			['Панорама', 'H'],
			['Лазерна указка', 'K'],
		],
	},
	{
		title: 'Виділене',
		rows: [
			['Групове виділення', 'Рамкою'],
			['Додати до виділення', 'Shift + клік'],
			['Групувати / розгрупувати', 'Ctrl+G · Ctrl+Shift+G'],
			['Перейменувати кадр', 'Подвійний клік на підпис'],
		],
	},
];

export default function ShortcutsHelp() {
	const { helpOpen, setHelpOpen } = useBoardStore();
	return (
		<Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Гарячі клавіші" className="max-w-2xl">
			<div className="max-h-[70vh] overflow-y-auto pr-1 text-sm sm:columns-2 sm:gap-6">
				{GROUPS.map((g) => (
					<div key={g.title} className="mb-3 break-inside-avoid">
						<div className="mb-1 text-xs font-semibold tracking-wide text-muted uppercase">{g.title}</div>
						<dl className="divide-y divide-panel-border">
							{g.rows.map(([label, keys]) => (
								<div key={label} className="flex items-baseline justify-between gap-3 py-1">
									<dt className="min-w-0">{label}</dt>
									<dd className="shrink-0 font-mono text-xs text-muted">{keys}</dd>
								</div>
							))}
						</dl>
					</div>
				))}
			</div>
		</Modal>
	);
}
