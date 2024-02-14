import React, { useEffect, useState } from 'react';

function App() {
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
		<div className="container mx-auto">
			<div className="flex flex-col items-center gap-4 justify-center">
				<svg
					width="100px"
					height="100px"
					viewBox="0 0 128 128"
					ariaHidden="true"
					role="img"
					className="iconify iconify--noto"
					preserveAspectRatio="xMidYMid meet">
					<path
						d="M77.52 83.78c4.93 2.51 14.08 4.86 18.94 4.15c12.6-1.85 21.69-9.13 27.2-19.22c2.33-4.27 2.53-12.92-1.21-13.86c-4.74-1.19-10.37-.26-19.11 3.87c-8.89 4.2-11.03 10.84-21.5 5.73"
						fill="#694d42"></path>
					<path
						d="M79.88 75.09c1.83 1.22 2.09 1.88 3.6 3.48c2.97 3.16 9.99 3.33 11.35 3.35c8.09.11 12-1.85 17.22-5.3s10.13-10.99 11.01-14.73c.61-2.58.92-4.54.8-6.13c-.39-.44-.85-.77-1.4-.91c-4.74-1.19-10.37-.26-19.11 3.87c-8.89 4.2-11.03 10.84-21.5 5.73l-2.28 10.17l.31.47z"
						opacity=".44"
						fill="#b3937c"></path>
					<path
						d="M123.47 59.99c.18-.95.31-1.8.37-2.57l-5.37-2.35l.31-.7c-1.85-.03-3.89.24-6.19.83l2.58 1.14l-2.66 6.03l-6.03-2.66l1.29-2.91c-1.07.42-5.12 2.14-6.83 3.2l2.25.99l-2.66 6.03l-6-2.72c-1.13.71-2.25 1.29-3.46 1.64l-6.05 13.68c.73.37 1.53.66 2.34.89l2.46-5.56l6.03 2.66s-1.25 2.79-1.91 4.28c.39.02 2.11.03 2.69.01l1.51-3.28l5.33 2.31c1.6-.46 3.05-1.08 4.49-1.83l2.18-5.12l3.42 1.53c.69-.56 1.37-1.18 2.02-1.84l-4.43-1.97l2.66-6.03l6.08 2.69c.49-.73.93-1.45 1.32-2.15l-6.39-2.83l2.66-6.03l5.99 2.64zM96.84 75.33l-6.03-2.66l2.66-6.03l6.03 2.66l-2.66 6.03zm8.32 3.68l-6.03-2.66l2.66-6.03l6.03 2.66l-2.66 6.03zm3.67-8.32l-6.03-2.66l2.66-6.03l6.03 2.66l-2.66 6.03z"
						fill="#694d42"></path>
					<path
						d="M17.36 8.23c-1.03-.16-2.06-.28-3.1-.34c-.43-.03-.9-.04-1.27.18c-.31.18-.51.5-.67.82a6.975 6.975 0 0 0-.29 5.69c.18.45.53.95 1 .87c.19-.03.34-.15.49-.27a29.82 29.82 0 0 0 4.08-3.86c.21-.24.41-.63.16-.84"
						fill="#825b4e"></path>
					<path
						d="M57.41 102.05c-8.65 4.19-14.38 9.08-20.38 15.08c-.45.45-2.33 2.5-1.17 3.12c1.16.62 4.03-1.48 4.85-.93c.98.65.26 1.8 1.29 2.54s3.8-1.42 5.2-.79c1.4.63.78 1.71 1.6 2.67c1.07 1.26 3.45.09 4.09-.42c3.77-2.98 13.16-11.93 14.82-13.86c2.2-2.56 3.6-6 1.64-8.28"
						fill="#694d42"></path>
					<path
						d="M28.26 99.21a76.12 76.12 0 0 0-14.73 6.46c-.97.55-1.93 1.14-2.73 1.91c-.35.33-.73.92-.38 1.25c.8.73 2.33-.46 3.49.45c.4.32.17 1.7.47 2.12c.32.44.93.6 1.48.56s1.07-.25 1.6-.41c1.17-.35 2.37-.57 3.14.35c.48.58.45 1.12.76 1.74c.21.43.56.77 1.43.76c1.32-.01 2.53-.61 3.62-1.34c4.92-3.3 9.55-6.98 14.18-10.65"
						fill="#694d42"></path>
					<path
						d="M47.3 12.38c3.46.97 4.32-.02 6.92.18c3.33.25 2.93 3.4 2.44 5.14c-.63 2.23-1.87 4.04-3.64 5.53c-.3.25-.64.51-1.04.54c-.47.04-.9-.25-1.26-.55c-2.36-1.93-3.86-4.88-4.03-7.92"
						fill="#825b4e"></path>
					<path
						d="M12.16 41.12s-6.13.71-8.28 7.29C.73 58.03 9.1 63.61 9.1 63.61s-2.3 19.71 9.71 30.51s15.93 11.2 29.97 13.77s27.13-6.48 30.51-10.12s8.64-11.23 9.58-20.67c.94-9.43-7.42-25.94-14.98-34.56S50.8 20.56 50.8 20.56L28.4 41.44l-16.24-.32z"
						fill="#b38a6d"></path>
					<path
						d="M48.27 13.23c-5.59-7.84-11.8-9.39-18.63-9.39c-7.37 0-14.36 5.41-17.58 9.69c-2.6 3.47-5.84 9.11-6.3 15.6c-.36 5.1 1.26 9.87 6.3 13.4c5.04 3.53 25.07 7.74 33.29 2.09c7.2-4.95 9.64-11.6 8.92-17.18c-.51-4.01-1.67-8.14-6-14.21z"
						fill="#b38a6d"></path>
					<ellipse transform="rotate(-17.768 36.335 17.7)" cx="36.34" cy="17.7" rx="2.43" ry="3.15" fill="#212121"></ellipse>
					<path
						d="M15.62 32.75c-.52 3.64 1.09 9.12 2.44 9.04c1.12-.07 1.38-2.29 1.38-2.29s.96 2.84 2.72 2.66c1.68-.18 1.6-6.19 2.03-9.13l-5.7-2.33l-2.87 2.05z"
						fill="#ffecb3"></path>
					<path
						d="M11.84 15.91c.33-1.02 1.26-2.35 2.77-2.31c1.61.05 1.33 2.36.78 3.58c-.56 1.22-1.85 2.4-3.06 1.64c-.83-.52-.72-2.19-.49-2.91z"
						fill="#212121"></path>
					<path
						d="M41.53 67.39c-12.8-4.32-13.34-17.07-17.28-20.07c-1.34-1.03-2.63-1.28-3.99-1.99c-1.25-.65-2.69-1.31-4-.79c.9.61 1.71 1.37 2.36 2.25c-1.3.13-3.23.29-3.87 1.11c-.11.14.04.36.2.44c.16.08 2.3.47 3.15 1.33c-.68.58-1.46 1.06-2.05 1.73c-.34.38-.03.62.11.66c.92.25 1.95.1 2.81.52c.86.42 1.49 1.21 2.25 1.77a5.42 5.42 0 0 0 3.23 1.07c1.92 4.01 4.42 7.35 7.67 10.37c3 2.79 6.7 4.78 10.81 5.53c12.93 2.36 18.67-10.8 18.67-10.8s-9.19 10.54-20.07 6.87z"
						fill="#825b4e"></path>
					<path
						d="M21.8 18.45c-.5-.66-1.45-.75-2.06-.2c-1.53 1.39-3.01 2.67-3.65 3.69c-.42.69-.79 2.08.02 3.07c.81.99 3.36 3.06 3.36 3.06s3.23-1.51 4.23-2.22c1.21-.87 1.48-2.72.45-4.25c-.41-.61-1.55-2.09-2.35-3.15z"
						fill="#212121"></path>
					<path
						d="M28.47 32.39c.84-1.31-.1-1.93-.65-1.29c-.62.71-2.26 1.84-4.51 1.05c-1.25-.44-2.09-.84-2.57-2.27c-.34-1.02-.22-2.39-.21-3.45c0-.48-2.14-.53-2.28-.13c-.29.82-.27 1.67-.3 2.53c-.03.95-.16 2.08-.97 2.58c-2.64 1.67-4.2-.83-4.51-1.12c-.13-.12-.43.65-.17 1.48c1.24 4.01 5.67 3.28 6.94 1.36c.23 1.6 5.88 4.49 9.23-.74z"
						fill="#212121"></path>
					<path
						d="M7.91 62.65c.17.15.39.38.55.51c.42.35 1.04.32 1.43-.07c.45-.47.99-1.3 1.33-2.41c.66-2.11.42-5.06-.86-7.18l-1.2 1.22c.92 2.92.56 5.41-.37 6.97c-.37.61-.86.91-.88.96z"
						fill="#825b4e"></path>
					<path
						d="M39.09 42.94l-.73 3.37c3.13-.38 6.45-6.44 6.45-6.44l.04 4.05c4-2.17 6.07-11.49 6.07-11.49c.36 4.52.76 14.58-12.76 16.33c-4.9.64-10.03-1.38-10.03-1.38s7.62-.5 10.96-4.44z"
						fill="#825b4e"></path>
					<path
						d="M6.93 47.01c1.7-2.66 4.7-3.49 7.14-3.11c.11.02.41.13.49.2c.16.15.09.44-.09.58c-.17.14-.41.17-.62.23c-1.22.3-2.32 1.23-2.53 2.47c.87-.36 1.91-.28 2.72.19c.22.13.46.39.33.62c-.07.13-.24.18-.39.23c-1.06.34-1.78 1.45-1.95 2.55c.57-.12 1.16-.25 1.74-.15c.58.1 1.35.59 1.29 1.04c-.07.48-1.37.16-1.96 1.19c-.41.72-.63 1.59-1.27 2.11c-.59.48-1.44.58-2.17.36c-.73-.21-1.36-.7-1.86-1.27c-1.71-1.95-2.08-4.96-.87-7.24"
						fill="#825b4e"></path>
				</svg>

				<p className="text-center text-6xl font-semibold">{timeString}</p>
			</div>
		</div>
	);
}

export default App;
