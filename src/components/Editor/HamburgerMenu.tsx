import { Download, FileCode, FileJson, HelpCircle, Menu, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { parseScene } from '../../domain/sceneFile';
import { useBoardStore } from '../../store/useBoardStore';
import { toast } from '../UI/toast';

/** Меню з іконкою "гамбургер" зліва зверху — аналог головного меню Excalidraw, лише наш реальний набір дій. */
export default function HamburgerMenu() {
	const [open, setOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const { requestExport, exportJson, exportSvg, importScene, clearBoard, setHelpOpen } = useBoardStore();

	const close = () => setOpen(false);

	const onFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;
		try {
			const elements = parseScene(await file.text());
			importScene(elements);
			toast.success(`Імпортовано фігур: ${elements.length}.`);
		} catch (err) {
			toast.error(err instanceof Error ? err.message : 'Не вдалося імпортувати файл.');
		}
	};

	return (
		<div className="relative">
			<button
				onClick={() => setOpen((v) => !v)}
				title="Меню"
				className="flex h-9 w-9 items-center justify-center rounded-lg text-page-text hover:bg-page-bg"
			>
				<Menu className="h-4.5 w-4.5" />
			</button>

			{open && (
				<>
					<div className="fixed inset-0 z-40" onClick={close} />
					<div className="absolute top-full left-0 z-50 mt-1.5 w-56 rounded-lg border border-panel-border bg-panel p-1.5 shadow-xl">
						<button
							onClick={() => {
								requestExport();
								close();
							}}
							className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-page-bg"
						>
							<Download className="h-4 w-4 text-muted" /> Експортувати як PNG
						</button>
						<button
							onClick={() => {
								exportJson();
								close();
							}}
							className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-page-bg"
						>
							<FileJson className="h-4 w-4 text-muted" /> Експортувати як JSON
						</button>
						<button
							onClick={() => {
								exportSvg();
								close();
							}}
							className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-page-bg"
						>
							<FileCode className="h-4 w-4 text-muted" /> Експортувати як SVG
						</button>
						<button
							onClick={() => {
								fileInputRef.current?.click();
								close();
							}}
							className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-page-bg"
						>
							<Upload className="h-4 w-4 text-muted" /> Імпортувати з JSON
						</button>
						<div className="my-1 border-t border-panel-border" />
						<button
							onClick={() => {
								if (confirm('Очистити все полотно? Це можна скасувати через Ctrl+Z.')) clearBoard();
								close();
							}}
							className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm text-danger hover:bg-page-bg"
						>
							<Trash2 className="h-4 w-4" /> Очистити полотно
						</button>
						<div className="my-1 border-t border-panel-border" />
						<button
							onClick={() => {
								setHelpOpen(true);
								close();
							}}
							className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm hover:bg-page-bg"
						>
							<HelpCircle className="h-4 w-4 text-muted" /> Гарячі клавіші
						</button>
					</div>
				</>
			)}
			<input ref={fileInputRef} type="file" accept="application/json" onChange={onFileChosen} className="hidden" />
		</div>
	);
}
