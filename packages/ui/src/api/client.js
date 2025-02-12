import axios from 'axios'
import { baseURL } from '@/store/constant'
import { userManager } from '@/routes/auth'

const apiClient = axios.create({
    baseURL: `${baseURL}/api/v1`,
    headers: {
        'Content-type': 'application/json',
        'x-request-from': 'internal'
    }
})

apiClient.interceptors.request.use(async function (config) {
    const user = await userManager.getUser()
    config.headers.Authorization = 'Bearer ' + user?.access_token
    const username = localStorage.getItem('username')
    const password = localStorage.getItem('password')

    if (username && password) {
        config.auth = {
            username,
            password
        }
    }

    return config
})

export default apiClient
