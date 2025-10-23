import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SociosPage from './pages/SociosPage'
import CuotasPage from './pages/CuotasPage'
import PagosPage from './pages/PagosPage'
import HabilitacionesPage from './pages/HabilitacionesPage'
import Layout from './components/Layout'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'socios',
        element: <SociosPage />,
      },
      {
        path: 'cuotas',
        element: <CuotasPage />,
      },
      {
        path: 'pagos',
        element: <PagosPage />,
      },
      {
        path: 'habilitaciones',
        element: <HabilitacionesPage />,
      },
    ],
  },
])

export default function Routes() {
  return <RouterProvider router={router} />
}
