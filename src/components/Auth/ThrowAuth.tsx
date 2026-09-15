import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UrlConfig } from '../../constants/urls';
import { useAuthStore } from '../../store/useAuthStore';

interface ThrowAuthProps {
	children: React.ReactNode;
}

/** Заводить залогіненого користувача геть зі сторінки логіну — на проєкт з `callbackPath` або на список проєктів. */
const ThrowAuth: React.FC<ThrowAuthProps> = ({ children }) => {
	const { user } = useAuthStore();
	const location = useLocation();

	if (user) {
		const callbackPath = new URLSearchParams(location.search).get('callbackPath');
		return <Navigate to={callbackPath || UrlConfig.projects} replace />;
	}

	return <>{children}</>;
};

export default ThrowAuth;
