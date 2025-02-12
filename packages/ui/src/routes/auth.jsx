import Loader from '@/ui-component/loading/Loader'
import { jwtDecode } from 'jwt-decode'
import { UserManager } from 'oidc-client-ts'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const oidcConfig = {
    authority: 'http://localhost:8282/realms/mycompany',
    client_id: 'flowise-admin',
    redirect_uri: 'http://localhost:8080/callback',
    post_logout_redirect_uri: 'http://localhost:8080/',
    scope: 'openid profile email offline_access',
    automaticSilentRenew: true,
    silent_redirect_uri: 'http://localhost:3000/silent-refresh'
}

export const userManager = new UserManager(oidcConfig)
export const AuthContext = createContext({})

const getUserRoles = (accessToken) => {
    if (!accessToken) return [];
  
    try {
      const decoded = jwtDecode(accessToken);
      
      
      return decoded.roles || decoded.resource_access?.[oidcConfig.client_id].roles || [];
    } catch (error) {
      console.error("Failed to decode token:", error);
      return [];
    }
  };
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const checkUser = async () => {
            const storedUser = await userManager.getUser()
            if (storedUser && !storedUser.expired) {
                setUser(storedUser)
                setRoles(getUserRoles(storedUser.access_token));

            } else if (!window.location.href.includes(oidcConfig.redirect_uri)) {
                userManager.signinRedirect()
            }
        }

        checkUser()

        userManager.events.addUserLoaded((user) => {
            setUser(user)
            setRoles(getUserRoles(storedUser.access_token));

        })
        userManager.events.addUserUnloaded(() => setUser(null))
        userManager.events.addAccessTokenExpiring(() => {
            console.log('Token expiring... refreshing silently')
            userManager.signinSilent().catch((error) => {
                console.error('Silent renewal error', error)
            })
        })
    }, [])
    
    const s = {
        enabled: true,
        user,
        roles,
        login: () => userManager.signinRedirect(),
        logout: () => userManager.signoutRedirect(),
        silent: () => userManager.signinSilentCallback(),
        callback: () => userManager.signinRedirectCallback()
    }
    return <AuthContext.Provider value={s}>{children}</AuthContext.Provider>
}

export const Callback = () => {
    
    const navigate = useNavigate()

    useEffect(() => {
        userManager.signinRedirectCallback().then(() => {
            navigate('/')
        })
    }, [navigate])

    return <div>Processing login...</div>
}

export const PrivateRoute = ({ children }) => {
    const { user, roles} = useAuth()

    const hasRequiredRole = !children?.props.allowedRoles || roles?.some((role) => children?.props.allowedRoles?.includes(role));
    return user && hasRequiredRole ? children : <Loader />;
}

const SilentRenew = () => {
    const { silent } = useAuth()
    silent()
    return null
}

export default SilentRenew

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}
