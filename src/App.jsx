import { lazy, Suspense } from 'react';
const ItalianApp = lazy(() => import('./locales/it/App.jsx'));
const EnglishApp = lazy(() => import('./locales/en/App.jsx'));
export default function App() {
  const italian = document.documentElement.lang === 'it';
  const Page = italian ? ItalianApp : EnglishApp;
  return <Suspense fallback={<div className="loading-mark" aria-label={italian ? 'Caricamento' : 'Loading'}>devma<span>✳︎</span></div>}><Page /></Suspense>;
}
