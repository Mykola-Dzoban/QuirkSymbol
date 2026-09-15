import type { BoardElement } from '../../../domain/board';
import type { View } from '../../../domain/view';
import { toScreen } from '../../../domain/view';

interface EmbedOverlaysProps {
	/** Лише `type === 'embed'`, вже відфільтровані викликачем. */
	elements: BoardElement[];
	selected: string[];
	activeEmbedId: string | null;
	view: View;
}

/**
 * Живі `<iframe>` для вбудов (`Tool.embed`) — реальний DOM-елемент поверх канвасу (Konva малює лише
 * заглушку, HTML не вміє рендеритись усередину `<canvas>`), той самий overlay-патерн, що й
 * `PresenceCursors`/`CommentPins`.
 *
 * Поки фігура ВИДІЛЕНА (готуємось тягнути/resize) — iframe взагалі не монтуємо: інакше він, будучи
 * справжнім DOM-елементом, малюється ПОВЕРХ Konva-канвасу і ховає під собою ручки Transformer'а. Поки
 * НЕ активована подвійним кліком — iframe видимий, але `pointer-events: none`, щоб один клік просто
 * виділяв фігуру (як будь-яку іншу), а не "провалювався" у вміст сторінки.
 */
export default function EmbedOverlays({ elements, selected, activeEmbedId, view }: EmbedOverlaysProps) {
	const visible = elements.filter((el) => activeEmbedId === el.id || !selected.includes(el.id));
	if (visible.length === 0) return null;

	return (
		<>
			{visible.map((el) => {
				const screen = toScreen(el.x, el.y, view);
				const active = activeEmbedId === el.id;
				return (
					<div
						key={el.id}
						className="absolute origin-top-left overflow-hidden rounded-lg shadow-sm"
						style={{
							left: screen.x,
							top: screen.y,
							width: el.width * view.scale,
							height: el.height * view.scale,
							transform: el.angle ? `rotate(${el.angle}deg)` : undefined,
							opacity: el.opacity,
							pointerEvents: active ? 'auto' : 'none',
						}}
					>
						<iframe
							src={el.src}
							title={el.src}
							className="h-full w-full border-0"
							sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-popups-to-escape-sandbox"
							referrerPolicy="no-referrer"
							loading="lazy"
						/>
					</div>
				);
			})}
		</>
	);
}
