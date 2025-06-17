import { useEffect, useCallback } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthContext from '../contexts/auth/useAuthContext.js'
import Navbar from './Navbar'
import MainPage from './MainPage'
import RegisterPage from './auth/RegisterPage'
import SignInPage from './auth/SignInPage'
import ShowUserPage from './auth/ShowUserPage'
import EditUserPage from './auth/EditUserPage'
import TwoFactorPage from './auth/TwoFactorPage'
import VerifyEmailPage from './auth/VerifyEmailPage'
import ResetPasswordPage from './auth/ResetPasswordPage'
import ChangeEmailPage from './auth/ChangeEmailPage'
import DeleteAccountPage from './auth/DeleteAccountPage.jsx'
import fetchWithRefresh from '../../util/fetchWithRefresh.js'

const App = () => {
    const { setUser, loading, setLoading } = useAuthContext()
    const backEndUrl = import.meta.env.VITE_BACK_END_URL

    const checkIfSignedIn = useCallback(async () => {
        const fetchResult = await fetchWithRefresh(
            `${backEndUrl}/api/v1/sessions`,
            'GET',
            'application/json',
            'include'
        )

        if (fetchResult.status >= 200 && fetchResult.status < 300) {
            setUser(fetchResult.data.user)
            setLoading(false)
            return
        }

        setUser(null)
        setLoading(false)
    }, [backEndUrl, setUser, setLoading])

    useEffect(() => {
        setLoading(true)
        checkIfSignedIn()
    }, [setLoading, checkIfSignedIn])

    if (loading) return <div>Loading...</div>

    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route
                    path="/register"
                    element={<RegisterPage />}
                />
                <Route
                    path="/sign-in"
                    element={<SignInPage />}
                />
                <Route
                    path="/settings"
                    element={<ShowUserPage />}
                />
                <Route
                    path="/settings/edit"
                    element={<EditUserPage />}
                />
                <Route
                    path="/settings/edit/2fa"
                    element={<TwoFactorPage />}
                />
                <Route
                    path="/verify-email"
                    element={<VerifyEmailPage />}
                />
                <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                />
                <Route
                    path="/change-email"
                    element={<ChangeEmailPage />}
                />
                <Route
                    path="/delete-account"
                    element={<DeleteAccountPage />}
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </>
    )
}

export default App
