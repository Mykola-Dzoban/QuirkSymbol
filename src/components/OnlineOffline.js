import { useSyncExternalStore } from 'react';

const getSnapshot = () => navigator.onLine;

const sendStatusChangeRequest = (status) => {
	// Replace this with your actual request logic, e.g., using fetch or axios
	console.log(`Status changed to: ${status ? 'online' : 'offline'}`);
};

const subscribe = (cb) => {
	const onlineHandler = () => {
		cb();
		sendStatusChangeRequest(true);
	};

	const offlineHandler = () => {
		cb();
		sendStatusChangeRequest(false);
	};

	window.addEventListener('online', onlineHandler);
	window.addEventListener('offline', offlineHandler);

	return () => {
		window.removeEventListener('online', onlineHandler);
		window.removeEventListener('offline', offlineHandler);
	};
};

const OnlineOffline = () => {
	const isOnline = useSyncExternalStore(subscribe, getSnapshot);

	return (
		<div className="text-lg font-mono flex items-center gap-2">
			<div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
			<p>You are {isOnline ? 'online' : 'offline'}</p>
		</div>
	);
};

export default OnlineOffline;
