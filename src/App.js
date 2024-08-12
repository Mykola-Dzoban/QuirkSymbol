import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import ChatContent from './components/chat/ChatContent';
import ChatFooter from './components/chat/ChatFooter';
import ChatHeader from './components/chat/ChatHeader';
// import ChatRules from './components/chat/ChatRules';
import OnlineOffline from './components/OnlineOffline';
import { firebaseCollections, firebaseFirestore } from './config/firebaseConfig';
import ToastProvider from './modules/toast/ToastProvider';

function App() {
	const [allMessages, setAllMessages] = useState([]);

	// subscribe to messages changes
	useEffect(() => {
		const q = query(
			collection(firebaseFirestore, firebaseCollections.messages)
			// where(ChatTypeFieldsEnum.INSTANCE_ID, '==', idToFetch),
		);
		const unsub = onSnapshot(q, (snapshot) => {
			const messages = snapshot.docs.map((doc) => ({
				...doc.data(),
				id: doc.id,
			}));

			const sortedMessages = messages.sort((a, b) => new Date(b.date) - new Date(a.date));
			setAllMessages(sortedMessages.reverse());
		});
		return () => {
			unsub();
		};
	}, [setAllMessages]);

	return (
		<ToastProvider positionY="top" positionX="right">
			<div className="container mx-auto px-2">
				<div className="flex flex-col items-center gap-4 justify-center">
					<img src="sparrow.svg" alt="Sparrow" />
				</div>
				<div className="flex items-center justify-around">
					<OnlineOffline />
					{/* <Timer /> */}
				</div>
				{/* <div className="flex items-center justify-center w-full">
				<ChatRules />
			</div> */}
				<div className="flex flex-col items-center justify-center w-full">
					<ChatHeader />
					<ChatContent messages={allMessages} />
					<ChatFooter />
				</div>
			</div>
		</ToastProvider>
	);
}

export default App;
