import { useState } from 'react';
import Button from '../UI/Button';
import Modal from '../UI/Modal';

interface EmbedDialogProps {
	open: boolean;
	onClose: () => void;
	/** Повертає `true`, якщо вставка вдалась — тоді форма закривається й очищується; `false` лишає
	 *  діалог відкритим (напр. `useEmbedInsert` уже показав toast з причиною). */
	onSubmit: (url: string) => boolean;
}

/** Діалог "Веб-вбудова" — просить посилання, решту (валідацію, вставку) робить `useEmbedInsert`. */
export default function EmbedDialog({ open, onClose, onSubmit }: EmbedDialogProps) {
	const [url, setUrl] = useState('');

	const submit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = url.trim();
		if (!trimmed) return;
		if (onSubmit(trimmed)) setUrl('');
	};

	return (
		<Modal open={open} onClose={onClose} title="Веб-вбудова">
			<form onSubmit={submit} className="flex flex-col gap-3">
				<div>
					<label className="mb-1 block text-sm text-muted">Посилання</label>
					<input
						type="url"
						autoFocus
						required
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://www.youtube.com/watch?v=…"
						className="w-full rounded-md border border-panel-border bg-page-bg px-3 py-2 text-sm outline-none focus:border-brand"
					/>
					<p className="mt-1.5 text-xs text-muted">
						Сторінка має дозволяти вбудовування в iframe (YouTube, Figma, CodePen тощо — деякі сайти це блокують).
					</p>
				</div>
				<div className="flex justify-end gap-2">
					<Button type="button" variant="outline" onClick={onClose}>
						Скасувати
					</Button>
					<Button type="submit">Вставити</Button>
				</div>
			</form>
		</Modal>
	);
}
