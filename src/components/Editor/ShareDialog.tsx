import { Check, Copy, Eye, Users, X } from 'lucide-react';
import { useState } from 'react';
import { UrlConfig } from '../../constants/urls';
import type { ProjectDoc } from '../../services/projects.service';
import { cn } from '../../utils/cn';
import Button from '../UI/Button';
import { toast } from '../UI/toast';

interface ShareDialogProps {
	project: ProjectDoc;
	onClose: () => void;
	onAddMember: (email: string) => Promise<void>;
	onRemoveMember: (email: string) => void;
	onTogglePublicView: (enabled: boolean) => Promise<void>;
}

/** Попап керування учасниками проєкту — email потрапляє у `ProjectDoc.members`, доступ перевіряють Firestore rules. */
export default function ShareDialog({ project, onClose, onAddMember, onRemoveMember, onTogglePublicView }: ShareDialogProps) {
	const [email, setEmail] = useState('');
	const [busy, setBusy] = useState(false);
	const [togglingView, setTogglingView] = useState(false);
	const [copied, setCopied] = useState(false);

	const viewUrl = `${window.location.origin}${UrlConfig.view(project.id)}`;

	const copyViewUrl = async () => {
		try {
			await navigator.clipboard.writeText(viewUrl);
			setCopied(true);
			setTimeout(() => setCopied(false), 1500);
		} catch {
			toast.error('Не вдалося скопіювати посилання.');
		}
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = email.trim().toLowerCase();
		if (!trimmed) return;
		setBusy(true);
		try {
			await onAddMember(trimmed);
			setEmail('');
		} finally {
			setBusy(false);
		}
	};

	return (
		<div className="fixed inset-0 z-50 flex items-start justify-center bg-black/20 pt-24" onClick={onClose}>
			<div
				className="w-full max-w-sm rounded-xl border border-panel-border bg-panel p-4 shadow-xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-3 flex items-center justify-between">
					<div className="flex items-center gap-2 font-semibold">
						<Users className="h-4 w-4 text-brand" /> Учасники проєкту
					</div>
					<button onClick={onClose} className="text-muted hover:text-page-text">
						<X className="h-4 w-4" />
					</button>
				</div>

				<form onSubmit={submit} className="mb-3 flex gap-2">
					<input
						type="email"
						required
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						placeholder="email@gmail.com"
						className="min-w-0 flex-1 rounded-md border border-panel-border px-2.5 py-1.5 text-sm outline-none focus:border-brand"
					/>
					<Button type="submit" size="sm" isLoading={busy}>
						Додати
					</Button>
				</form>

				<div className="mb-3 rounded-lg border border-panel-border p-2.5">
					<label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
						<span className="flex items-center gap-1.5">
							<Eye className="h-4 w-4 text-muted" /> Посилання для перегляду
						</span>
						<input
							type="checkbox"
							checked={!!project.publicViewEnabled}
							disabled={togglingView}
							onChange={async (e) => {
								setTogglingView(true);
								try {
									await onTogglePublicView(e.target.checked);
								} finally {
									setTogglingView(false);
								}
							}}
							className="accent-brand"
						/>
					</label>
					{project.publicViewEnabled && (
						<div className="mt-2 flex gap-1.5">
							<input readOnly value={viewUrl} className="min-w-0 flex-1 rounded-md border border-panel-border bg-page-bg px-2 py-1 text-xs outline-none" />
							<button onClick={copyViewUrl} title="Копіювати" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted hover:bg-page-bg">
								{copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
							</button>
						</div>
					)}
					<p className="mt-1.5 text-[11px] text-muted">Будь-хто з посиланням бачить дошку без входу, без права редагувати.</p>
				</div>

				<ul className="flex max-h-56 flex-col gap-1 overflow-y-auto">
					{project.members.map((m) => (
						<li key={m} className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-page-bg">
							<span className={cn(m === project.ownerEmail && 'font-medium')}>
								{m}
								{m === project.ownerEmail && <span className="ml-1 text-xs text-muted">(власник)</span>}
							</span>
							{m !== project.ownerEmail && (
								<button onClick={() => onRemoveMember(m)} className="text-xs text-danger hover:underline">
									Прибрати
								</button>
							)}
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
