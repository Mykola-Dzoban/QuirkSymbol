class Toast {
	constructor() {
		this.delay = 3000;
		this.provider = document.getElementById('toast-qs');
	}

	success({ message, delay = this.delay }) {
		const div = document.createElement('div');

		div.className = 'bg-green-500 text-white p-2 rounded-lg';
		div.innerHTML = message;
		this.provider.appendChild(div);

		const timer = setTimeout(() => {
			this.provider.removeChild(div);
		}, delay);

		return () => clearTimeout(timer);
	}
}

export const toast = new Toast();
