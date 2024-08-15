import { useEffect, useRef } from 'react';
import Message from '../chat-components/Message';

const ChatContent = ({ messages, ...props }) => {
	const messagesEndRef = useRef(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<div className="w-full p-2 border-x-2 border-slate-300 h-[500px] overflow-y-auto">
			{messages.map((message, index) => (
				<Message key={message.id} message={message.message} ref={index === messages.length - 1 ? messagesEndRef : null} />
			))}
		</div>
	);
};

export default ChatContent;
