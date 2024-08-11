const ChatContent = ({ messages, ...props }) => {
	console.log(messages);
	return <div className="w-full p-2 border-x-2 border-slate-300 h-[350px]">ChatContent</div>;
};
export default ChatContent;
