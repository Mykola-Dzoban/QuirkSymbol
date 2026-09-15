import { useEffect } from 'react';
import BoardCanvas from '../components/Editor/Canvas/BoardCanvas';
import GuestTopBar from '../components/Editor/GuestTopBar';
import MigrateGuestBanner from '../components/Editor/MigrateGuestBanner';
import PropertiesPanel from '../components/Editor/PropertiesPanel';
import ShortcutsHelp from '../components/Editor/ShortcutsHelp';
import Toolbar from '../components/Editor/Toolbar';
import { useBoardShortcuts } from '../components/Editor/useBoardShortcuts';
import { visibleElements } from '../domain/board';
import { useBoardStore } from '../store/useBoardStore';

/**
 * Дошка без входу — відкриваєш сайт і одразу малюєш, як у Excalidraw. Зберігається лише в
 * localStorage цього браузера (`useBoardStore.startGuestSession`); щоб дошка стала проєктом,
 * який бачить команда й синхронізується в реальному часі, потрібно увійти (`GuestTopBar`).
 */
export default function GuestBoard() {
	const { startGuestSession, leaveBoard, elements } = useBoardStore();

	useEffect(() => {
		startGuestSession();
		return () => leaveBoard();
	}, [startGuestSession, leaveBoard]);

	useBoardShortcuts();

	return (
		<div className="flex h-full flex-col">
			<GuestTopBar />
			<div className="relative flex min-h-0 flex-1">
				<Toolbar />
				<BoardCanvas />
				<PropertiesPanel />
				<MigrateGuestBanner hasContent={visibleElements(elements).length > 0} />
			</div>
			<ShortcutsHelp />
		</div>
	);
}
