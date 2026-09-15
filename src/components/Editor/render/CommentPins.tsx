import { MessageCircle } from 'lucide-react';
import type { CommentThread } from '../../../domain/comment';
import type { View } from '../../../domain/view';
import { toScreen } from '../../../domain/view';
import { cn } from '../../../utils/cn';

interface CommentPinsProps {
	comments: CommentThread[];
	view: View;
	activeCommentId: string | null;
	onSelect: (id: string) => void;
}

/** Пінки коментарів поверх канвасу (HTML, не Konva) — позиція перераховується з `view` при пан/зумі. */
export default function CommentPins({ comments, view, activeCommentId, onSelect }: CommentPinsProps) {
	return (
		<>
			{comments.map((c) => {
				const screen = toScreen(c.x, c.y, view);
				const active = c.id === activeCommentId;
				return (
					<button
						key={c.id}
						title={c.messages[0]?.text ?? ''}
						onMouseDown={(e) => e.stopPropagation()}
						onClick={() => onSelect(c.id)}
						className={cn(
							'absolute flex h-8 w-8 -translate-x-1 -translate-y-full items-center justify-center rounded-full rounded-bl-none border-2 shadow-md transition-transform',
							c.resolved ? 'border-panel-border bg-panel text-muted opacity-60' : 'border-brand bg-white text-brand',
							active && 'scale-110 ring-2 ring-brand/40',
						)}
						style={{ left: screen.x, top: screen.y }}
					>
						<MessageCircle className="h-4 w-4" fill={c.resolved ? 'transparent' : 'currentColor'} fillOpacity={0.15} />
						{c.messages.length > 1 && (
							<span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-medium text-white">
								{c.messages.length}
							</span>
						)}
					</button>
				);
			})}
		</>
	);
}
