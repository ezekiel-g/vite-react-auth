import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import HCaptcha from '@hcaptcha/react-hcaptcha'
import useAuthContext from '../../contexts/auth/useAuthContext.js'
import fetchFromBackEnd from '../../../util/fetchFromBackEnd.js'
import messageHelper from '../../../util/messageHelper.jsx'

const SignInPage = () => {
    const { user, setUser } = useAuthContext()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [hCaptchaToken, setHCaptchaToken] = useState(null)
    const [captchaVisible, setCaptchaVisible] = useState(false)
    const [totpCode, setTotpCode] = useState('')
    const [totpRequired, setTotpRequired] = useState(false)
    const [userIdForTotp, setUserIdForTotp] = useState(null)
    const [successMessages, setSuccessMessages] = useState([])
    const [errorMessages, setErrorMessages] = useState([])
    const navigate = useNavigate()
    const location = useLocation()
    const backEndUrl = import.meta.env.VITE_BACK_END_URL

    const emailPasswordSubmit = async event => {
        event.preventDefault()
        window.scrollTo(0, 0)
        setSuccessMessages([])
        setErrorMessages([])

        const newErrors = []

        if (email.trim() === '') newErrors.push('Email address required')
        if (!password) newErrors.push('Password required')
        if (newErrors.length > 0) {
            setErrorMessages(newErrors)
            return
        }

        if (!hCaptchaToken) {
            setCaptchaVisible(true)
            return
        }

        const fetchResult = await fetchFromBackEnd(
            `${backEndUrl}/api/v1/sessions`,
            'POST',
            'application/json',
            'include',
            { email, password, hCaptchaToken }
        )

        if (fetchResult.status >= 200 && fetchResult.status < 300) {
            if (fetchResult.message === 'Signed in successfully') {
                setUser(fetchResult.data.user)
                navigate('/')
                return
            }

            if (fetchResult.data.userId) {
                setUserIdForTotp(fetchResult.data.userId)
                setTotpRequired(true)
                setErrorMessages([fetchResult.message])
                return
            }
        }
        
        setHCaptchaToken(null)
        setErrorMessages([fetchResult.message])
    }

    const handleCaptchaResponse = token => {
        setHCaptchaToken(token)
        setCaptchaVisible(false)
    }

    const totpSubmit = async event => {
        event.preventDefault()
        window.scrollTo(0, 0)
        setSuccessMessages([])
        setErrorMessages([])

        if (!totpCode.trim()) {
            setErrorMessages(['6-digit TOTP required'])
            return
        }

        if (totpCode.length < 6) {
            setErrorMessages(['TOTP must be 6 digits'])
            return
        }

        const fetchResult = await fetchFromBackEnd(
            `${backEndUrl}/api/v1/sessions/verify-totp`,
            'POST',
            'application/json',
            'include',
            { userId: userIdForTotp, totpCode }
        )

        if (
            fetchResult.status >= 200 &&
            fetchResult.status < 300 &&
            fetchResult.message === 'Signed in successfully'
        ) {
            setUser(fetchResult.data.user)
            setTotpRequired(false)
            setSuccessMessages([fetchResult.message])    
            setTimeout(() => { navigate('/') }, 1000)
            return            
        }

        setErrorMessages([fetchResult.message || 'Invalid TOTP'])      
    }

    const resendVerification = async () => {
        setSuccessMessages([])
        setErrorMessages([])

        const fetchResult = await fetchFromBackEnd(
            `${backEndUrl}/api/v1/verifications/resend-verification-email`,
            'POST',
            'application/json',
            'same-origin',
            { email }
        )
        
        if (
            fetchResult.status >= 200 &&
            fetchResult.status < 300 &&            
            fetchResult.message.includes('If you entered an')
        ) {
            setSuccessMessages([fetchResult.message])
            return
        }

        setErrorMessages([
            fetchResult.message ||
            'Failed to resend verification email'
        ])
    }

    const sendPasswordReset = async () => {
        setSuccessMessages([])
        setErrorMessages([])

        if (!email) {
            setErrorMessages(['Email address required'])
            return
        }

        if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)) {
            setErrorMessages(['Invalid email address format'])
            return
        }        

        if (!window.confirm(`Send password reset link to ${email}?`)) return

        const fetchResult = await fetchFromBackEnd(
            `${backEndUrl}/api/v1/verifications/send-password-reset-email`,
            'POST',
            'application/json',
            'same-origin',
            { email }
        )

        if (
            fetchResult.status >= 200 &&
            fetchResult.status < 300 &&  
            fetchResult.message.includes('If the email address is associated')
        ) {
            setSuccessMessages([fetchResult.message])
            return
        }

        setErrorMessages([
            fetchResult.message ||
            'Failed to send password reset email'
        ])
    }

    useEffect(() => {
        if (user) {
            navigate('/')
            return
        }
        
    }, [user, navigate, location])

    const submitFunction =
        !totpRequired ? emailPasswordSubmit : totpSubmit

    let captchaDisplay = null
    let totpDisplay = null

    if (captchaVisible) {
        captchaDisplay =
            <div className="hcaptcha-outer-container">
                <div className="hcaptcha-inner-container">
                    <HCaptcha
                        sitekey="b2e681ea-a462-46d0-a966-218053c0d5cc"
                        onVerify={handleCaptchaResponse}
                    />
                </div>         
            </div>
    }
    
    if (totpRequired && userIdForTotp) {
        totpDisplay =
            <div className="mb-3">
                <label htmlFor="totp-code" className="form-label">
                    6-digit TOTP from authenticator app:
                </label>
                <input
                    type="text"
                    className="form-control text-center rounded-0 mb-3"
                    id="totp-code"
                    value={totpCode}
                    onChange={event => setTotpCode(event.target.value)}
                    maxLength="6"
                    placeholder="123456"
                    style={{ maxWidth: '200px' }}
                />
            </div>
    }
    
    const successMessageDisplay = messageHelper.showSuccesses(successMessages)
    let errorMessageDisplay
    
    if (errorMessages.includes(
        'Please verify your email address before signing in'
    )) {
        const resolutionLink =
            <span
                onClick={resendVerification}
                className={`
                    bg-transparent
                    text-primary
                    text-decoration-underline
                `}
                style={{ cursor: 'pointer' }}
            >
                Resend verification email
            </span>
        errorMessageDisplay =
            messageHelper.showErrors(errorMessages, resolutionLink)
    } else {
        errorMessageDisplay = messageHelper.showErrors(errorMessages)
    }

    return (
        <div className="container col-md-10 offset-md-1 my-4">
            {successMessageDisplay}
            {errorMessageDisplay}
            <h2 className="mb-4">Sign In</h2>
            <form onSubmit={submitFunction}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email address
                    </label>
                    <input
                        type="text"
                        className="form-control rounded-0"
                        id="email"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password
                    </label>
                    <input
                        type="password"
                        className="form-control rounded-0"
                        id="password"
                        value={password}
                        onChange={event => setPassword(event.target.value)}
                    />
                </div>
                {captchaDisplay}
                {totpDisplay}

                <br />
                <button
                    type="submit"
                    className="btn btn-primary mb-3 rounded-0"
                >
                    Sign In
                </button>
            </form>
            <span
                onClick={() => sendPasswordReset()}
                style={{ cursor: 'pointer' }}
            >
                Forgot password?
            </span>
            <Link to="/register" className="nav-link ps-0">
                No account? Register
            </Link>
        </div>
    )
}

export default SignInPage
