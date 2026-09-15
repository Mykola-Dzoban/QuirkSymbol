import { LogOut, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import Button from '../UI/Button';
import { toast } from '../UI/toast';

/**
 * Рендериться замість захищеної сторінки (`RequiredAuth`), коли людина залогинена поштою/паролем,
 * але ще не підтвердила пошту — Firestore rules вимагають `email_verified`, тож без цього кроку
 * навіть профіль `users/{uid}` не створити.
 */
export default function VerifyEmailNotice() {
	const { user, checkEmailVerified, resendVerificationEmail, logout } = useAuthStore();
	const [checking, setChecking] = useState(false);
	const [resending, setResending] = useState(false);

	const check = async () => {
		setChecking(true);
		const verified = await checkEmailVerified();
		setChecking(false);
		if (!verified) toast.info('Пошта ще не підтверджена — перевірте лист і спробуйте ще раз.');
	};

	const resend = async () => {
		setResending(true);
		await resendVerificationEmail();
		setResending(false);
	};

	return (
		<div className="flex h-full flex-col items-center justify-center gap-4 bg-page-bg px-4 text-center">
			<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white">
				<Mail className="h-7 w-7" />
			</div>
			<div>
				<h1 className="text-xl font-semibold">Підтвердіть пошту</h1>
				<p className="mt-1 max-w-sm text-sm text-muted">
					Надіслали лист на <span className="font-medium text-page-text">{user?.email}</span>. Перейдіть за посиланням у ньому, тоді
					натисніть кнопку нижче.
				</p>
			</div>
			<Button onClick={check} isLoading={checking}>
				Я підтвердив(-ла) — перевірити
			</Button>
			<div className="flex items-center gap-3 text-sm">
				<button onClick={resend} disabled={resending} className="text-muted underline hover:text-page-text disabled:opacity-50">
					Надіслати ще раз
				</button>
				<span className="text-panel-border">·</span>
				<button onClick={logout} className="flex items-center gap-1 text-muted underline hover:text-page-text">
					<LogOut className="h-3.5 w-3.5" /> Вийти
				</button>
			</div>
		</div>
	);
}
