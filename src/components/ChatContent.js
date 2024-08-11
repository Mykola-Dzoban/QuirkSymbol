import { useEffect, useRef } from 'react';

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
				<div
					key={message.id}
					ref={index === messages.length - 1 ? messagesEndRef : null}
					className="flex items-center gap-2 mt-1">
					<div className="w-6 h-6 rounded-full bg-purple-500"></div>
					<p className="bg-slate-300 p-2 rounded-lg">{message.message}</p>
				</div>
			))}
		</div>
	);
};

export default ChatContent;
