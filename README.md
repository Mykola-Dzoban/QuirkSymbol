# QuirkSymbol

Командна дошка для малювання — безкінечний канвас, фігури, і співпраця в реальному часі. Аналог
Excalidraw з "преміальними" фічами (командний доступ до проєкту, реалтайм-синхронізація), власним
візуальним стилем. Як і в excalidraw.com, відкриваєш сайт — і одразу малюєш без реєстрації
(зберігається локально в браузері); вхід потрібен лише щоб створювати командні проєкти.

## Стек

Vite + React 19 + TypeScript + Tailwind v4 (CSS-first `@theme`) + Zustand + Konva/react-konva +
React Router v7, на Firebase (Auth Google + Firestore).

## Розробка

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint
npm run test       # vitest
npm run deploy     # build + firebase deploy — деплоїть на живий хостинг, підтверджуй перед запуском
```

Скопіюй `.env.example` у `.env` і заповни значеннями зі свого Firebase-проєкту (Project settings →
General → Your apps).

## Документація

- [`docs/PHASES.md`](docs/PHASES.md) — розбиття на фази розробки.
- [`docs/FEATURES.md`](docs/FEATURES.md) — детальний фіче-чекліст відносно Excalidraw/Excalidraw+.
