class Toast {
	constructor() {
		this.delay = 3000;
		this.provider = document.getElementById('toast-qs');
	}

	success({ message, delay = this.delay }) {
		const div = document.createElement('div');

		div.className = 'w-full bg-green-500 text-white p-2 rounded-lg text-center';
		div.innerHTML = message;
		this.provider.appendChild(div);

		const timer = setTimeout(() => {
			this.provider.removeChild(div);
		}, delay);

		return () => clearTimeout(timer);
	}

	warn({ message, delay = this.delay }) {
		const div = document.createElement('div');

		div.className = 'w-full bg-yellow-500 text-white p-2 rounded-lg text-center';
		div.innerHTML = message;
		this.provider.appendChild(div);

		const timer = setTimeout(() => {
			this.provider.removeChild(div);
		}, delay);

		return () => clearTimeout(timer);
	}
	
  error({ message, delay = this.delay }) {
		const div = document.createElement('div');

		div.className = 'w-full bg-red-500 text-white p-2 rounded-lg text-center';
		div.innerHTML = message;
		this.provider.appendChild(div);

		const timer = setTimeout(() => {
			this.provider.removeChild(div);
		}, delay);

		return () => clearTimeout(timer);
	}
}

export const toast = new Toast();
