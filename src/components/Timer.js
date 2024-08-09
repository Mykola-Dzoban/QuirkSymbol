import { useEffect, useState } from 'react';

const Timer = () => {
	const [timeString, setTimeString] = useState('');

	useEffect(() => {
		const updateClock = () => {
			let currentTime = new Date();

			let hours = currentTime.getHours();
			let minutes = currentTime.getMinutes();
			let seconds = currentTime.getSeconds();

			hours = hours < 10 ? '0' + hours : hours;
			minutes = minutes < 10 ? '0' + minutes : minutes;
			seconds = seconds < 10 ? '0' + seconds : seconds;

			let newTimeString = hours + ':' + minutes + ':' + seconds;
			setTimeString(newTimeString);
		};

		const intervalId = setInterval(updateClock, 1000);

		// Clear interval when the component is unmounted
		return () => clearInterval(intervalId);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div>
			<p className="text-center font-semibold">{timeString}</p>
		</div>
	);
};
export default Timer;
