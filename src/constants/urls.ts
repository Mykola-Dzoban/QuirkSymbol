export const UrlConfig = {
	home: '/',
	login: '/login',
	projects: '/projects',
	editorPattern: '/editor/:projectId',
	editor: (projectId: string) => `/editor/${projectId}`,
	viewPattern: '/view/:projectId',
	view: (projectId: string) => `/view/${projectId}`,
};
