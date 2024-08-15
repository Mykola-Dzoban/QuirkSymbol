import { messages } from '../../config/firebaseConfig';
import { toast } from '../../modules/toast/Toast';

const ChatFooter = () => {
	const onSubmit = async (e) => {
		e.preventDefault();

		const message = e.target.elements.message.value;
		const loverMSG = message.toLowerCase();
		if (message === '!clear!') {
			await messages.deleteAll();

			toast.success({ message: 'Chat cleared' });

			return;
		}
		if (
			message && checkMessageFunc(loverMSG)
		) {
			toast.warn({ message: 'you have been blocked' });

			e.target.reset();
			return;
		}

		// send message
		if (message && navigator.onLine) {
			await messages
				.create({
					message,
					date: new Date().toISOString(),
				})
				.then(() => toast.success({ message: 'Message sent success' }))
				.catch(() => toast.error({ message: 'Message sent error' }));
		}

		e.target.reset();
	};

	return (
		<div className="w-full border-2 rounded-b-md border-slate-300 py-3">
			<form action="post" onSubmit={onSubmit} className="w-full flex items-center">
				<input type="text" name="message" className="w-full rounded-lg border-2 border-dashed border-emerald-900" />
				<button className="w-fit text-center rounded-lg" disabled={!navigator.onLine}>
					<img src="send.svg" alt="Send" className="size-10" />
				</button>
			</form>
		</div>
	);
};
export default ChatFooter;
