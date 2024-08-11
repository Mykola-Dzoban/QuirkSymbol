import { collection, onSnapshot, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import ChatContent from './components/ChatContent';
import ChatFooter from './components/ChatFooter';
import ChatHeader from './components/ChatHeader';
import ChatRules from './components/ChatRules';
import OnlineOffline from './components/OnlineOffline';
import { firebaseCollections, firebaseFirestore } from './config/firebaseConfig';

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

			setAllMessages(messages);
		});
		return () => {
			unsub();
		};
	}, [setAllMessages]);

	return (
		<div className="container mx-auto">
			<div className="flex flex-col items-center gap-4 justify-center">
				<img src="sparrow.svg" alt="Sparrow" />
			</div>
			<div className="flex items-center justify-around">
				<OnlineOffline />
				{/* <Timer /> */}
			</div>
			<div className="flex items-center justify-center w-full">
				<ChatRules />
			</div>
			<div className="flex flex-col items-center justify-center w-full">
				<ChatHeader />
				<ChatContent messages={allMessages} />
				<ChatFooter />
			</div>
		</div>
	);
}

export default App;
