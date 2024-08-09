import ChatContent from './components/ChatContent';
import ChatFooter from './components/ChatFooter';
import ChatHeader from './components/ChatHeader';
import ChatRules from './components/ChatRules';
import OnlineOffline from './components/OnlineOffline';
import Timer from './components/Timer';

function App() {
	return (
		<div className="container mx-auto">
			<div className="flex flex-col items-center gap-4 justify-center">
				<img src="sparrow.svg" alt="Sparrow" />
			</div>
			<div className="flex items-center justify-around">
				<OnlineOffline />
				{/* <Timer /> */}
			</div>
			<div className='flex items-center justify-center w-full'>
				<ChatRules />
			</div>
			<div className='flex flex-col items-center justify-center w-full'>
				<ChatHeader />
				<ChatContent />
				<ChatFooter />
			</div>
		</div>
	);
}

export default App;
