import { cn } from '../../utils/cn';

const ToastProvider = ({ children, positionY, positionX, ...props }) => {
	return (
		<>
			{children}
			<div
				id="toast-qs"
				className={cn(
					'absolute z-[101]',
					'transition-all duration-150 ease-in-out',
					positionY === 'top' ? 'top-3' : 'bottom-3',
					positionX === 'left' ? 'left-3' : 'right-3'
				)}></div>
		</>
	);
};
export default ToastProvider;
