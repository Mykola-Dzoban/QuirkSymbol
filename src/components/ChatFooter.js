import { messages } from '../config/firebaseConfig';

const ChatFooter = () => {
	const onSubmit = async (e) => {
		e.preventDefault();

		const message = e.target.elements.message.value;
		const loverMSG = message.toLowerCase();
		if (
			message &&
			(loverMSG.includes('fuck') ||
				loverMSG.includes('shit') ||
				loverMSG.includes('ass') ||
				loverMSG.includes('asshole') ||
				loverMSG.includes('bitch') ||
				loverMSG.includes('dick') ||
				loverMSG.includes('cunt') ||
				loverMSG.includes('pussy') ||
				loverMSG.includes('penis') ||
				loverMSG.includes('vagina') ||
				loverMSG.includes('блять') ||
				loverMSG.includes('пизда') ||
				loverMSG.includes('сука') ||
				loverMSG.includes('хуй') ||
				loverMSG.includes('дурак') ||
				loverMSG.includes('пидор') ||
				loverMSG.includes('пидр') ||
				loverMSG.includes('пидрас') ||
				loverMSG.includes('пидарас') ||
				loverMSG.includes('підор') ||
				loverMSG.includes('підр') ||
				loverMSG.includes('підрас') ||
				loverMSG.includes('пісюн') ||
				loverMSG.includes('піська') ||
				loverMSG.includes('підарас'))
		) {
			console.log('you have been blocked');
		}

		// send message
		if (message && navigator.onLine) {
			await messages
				.create({
					message,
					date: new Date().toISOString(),
				})
				.then(() => console.log('sent'));
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
