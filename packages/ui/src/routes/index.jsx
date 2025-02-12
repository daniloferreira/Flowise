import { Outlet, useRoutes } from 'react-router-dom'

// routes
import MainRoutes from './MainRoutes'
import CanvasRoutes from './CanvasRoutes'
import ChatbotRoutes from './ChatbotRoutes'
import config from '@/config'
import SilentRenew, { AuthProvider, Callback, PrivateRoute } from './auth'

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
    return useRoutes(
        [
            {
                path: '/',
                element: (
                    <AuthProvider>
                        <PrivateRoute>
                            <Outlet />
                        </PrivateRoute>
                    </AuthProvider>
                ),
                children: [
                    MainRoutes,
                    CanvasRoutes,
                    ChatbotRoutes
                ]
            },
            { path: '/silent-refresh', element: <SilentRenew /> },
            { path: '/callback', element: <Callback /> }
        ],
        config.basename
    )
}
