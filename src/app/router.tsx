import { createBrowserRouter } from 'react-router-dom';
import { App } from '@/app/App';
import { DashboardPage } from '@/pages/DashboardPage';
import { ModulePage } from '@/pages/ModulePage';
import { QuizPage } from '@/pages/QuizPage';
import { PracticePage } from '@/pages/PracticePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'module/:slug', element: <ModulePage /> },
      { path: 'module/:slug/quiz', element: <QuizPage /> },
      { path: 'module/:slug/practice', element: <PracticePage /> },
    ],
  },
]);
