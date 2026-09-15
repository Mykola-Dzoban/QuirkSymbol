import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { UrlConfig } from '../../constants/urls';
import { useAuthStore } from '../../store/useAuthStore';
import VerifyEmailNotice from './VerifyEmailNotice';

interface RequiredAuthProps {
	children: React.ReactNode;
}

const RequiredAuth: React.FC<RequiredAuthProps> = ({ children }) => {
	const { user } = useAuthStore();
	const location = useLocation();

	if (!user) {
		const fullPath = location.pathname + location.search;
		return <Navigate to={`${UrlConfig.login}?callbackPath=${encodeURIComponent(fullPath)}`} replace />;
	}

	// Google завжди повертає підтверджену пошту — це стосується лише входу поштою/паролем.
	if (!user.emailVerified) return <VerifyEmailNotice />;

	return <>{children}</>;
};

export default RequiredAuth;
