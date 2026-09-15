import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import RequiredAuth from './components/Auth/RequiredAuth';
import ThrowAuth from './components/Auth/ThrowAuth';
import { UrlConfig } from './constants/urls';
import { useAuthStore } from './store/useAuthStore';

const GuestBoard = lazy(() => import('./pages/GuestBoard'));
const Login = lazy(() => import('./pages/Login'));
const Projects = lazy(() => import('./pages/Projects'));
const Editor = lazy(() => import('./pages/Editor'));
const PublicView = lazy(() => import('./pages/PublicView'));

export default function App() {
	const initializeAuthListener = useAuthStore((s) => s.initializeAuthListener);

	useEffect(() => initializeAuthListener(), [initializeAuthListener]);

	return (
		<Suspense fallback={<div className="flex h-full items-center justify-center text-sm text-muted">Завантаження…</div>}>
			<Routes>
				<Route path={UrlConfig.home} element={<GuestBoard />} />
				<Route
					path={UrlConfig.login}
					element={
						<ThrowAuth>
							<Login />
						</ThrowAuth>
					}
				/>
				<Route
					path={UrlConfig.projects}
					element={
						<RequiredAuth>
							<Projects />
						</RequiredAuth>
					}
				/>
				<Route
					path={UrlConfig.editorPattern}
					element={
						<RequiredAuth>
							<Editor />
						</RequiredAuth>
					}
				/>
				<Route path={UrlConfig.viewPattern} element={<PublicView />} />
				<Route path="*" element={<Navigate to={UrlConfig.home} replace />} />
			</Routes>
		</Suspense>
	);
}
