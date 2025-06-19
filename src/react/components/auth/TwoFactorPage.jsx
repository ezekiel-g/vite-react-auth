import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import bcryptjs from 'bcryptjs'
import useAuthContext from '../../contexts/auth/useAuthContext.js'
import fetchWithRefresh from '../../../util/fetchWithRefresh.js'
import messageHelper from '../../../util/messageHelper.jsx'

const TwoFactorPage = () => {
    const { user, setUser } = useAuthContext()
    const [qrCodeImage, setQrCodeImage] = useState(null)
    const [totpSecret, setTotpSecret] = useState(null)
    const [totpCode, setTotpCode] = useState('')
    const [authDisplay, setAuthDisplay] = useState(false)
    const [passwordToVerify, setPasswordToVerify] = useState('')
    const [passwordFetchedToCompare, setPasswordFetchedToCompare] = useState('')
    const [successMessages, setSuccessMessages] = useState([])
    const [errorMessages, setErrorMessages] = useState([])
    const navigate = useNavigate()
    const backEndUrl = import.meta.env.VITE_BACK_END_URL

    const changeTwoFactor = useCallback(async () => {
        setSuccessMessages([])
        setErrorMessages([])
        setAuthDisplay(false)
        setPasswordToVerify('')

        let newTwoFactorSettings

        if (user.totp_auth_on === 0) {
            if (!totpSecret) {
                setErrorMessages(['2FA secret missing'])
                return
            }

            if (!totpCode || totpCode.length !== 6) {
                setErrorMessages([
                    'Please enter the 6-digit code from your authenticator app'
                ])
                return
            }

            newTwoFactorSettings = {
                id: user.id,
                totpAuthOn: 1,
                totpSecret,
                totpCode
            }
        } else {
            if (!window.confirm(
                'Turn off 2FA? This will erase your current 2FA setup, and ' +
                'you will need to scan a new QR code to set up 2FA again.'
            )) return

            newTwoFactorSettings = { 
                id: user.id,
                totpAuthOn: 0,
                totpSecret: null,
                totpCode: null
            }
        }
        
        const fetchResult = await fetchWithRefresh(
            `${backEndUrl}/api/v1/verifications/set-totp-auth`,
            'PATCH',
            'application/json',
            'include',
            newTwoFactorSettings
        )

        if (fetchResult.status >= 200 && fetchResult.status < 300) {
            setUser(Object.assign(
                {},
                user,
                { totp_auth_on: newTwoFactorSettings.totpAuthOn }
            ))
            setSuccessMessages([ fetchResult.message ])
            return
        }

        setErrorMessages([fetchResult.message || 'Error updating 2FA'])
    }, [totpCode, totpSecret, backEndUrl, setUser, user])

    const verifyPassword = async event => {
        event.preventDefault()
        setSuccessMessages([])
        setErrorMessages([])
        
        const passwordValid =
            await bcryptjs.compare(passwordToVerify, passwordFetchedToCompare)

        if (passwordValid || user.totp_auth_on === 0) {
            changeTwoFactor()
            return
        }

        setErrorMessages(['Invalid password'])
    }

    const submitChangeTwoFactorForm = async event => {
        event.preventDefault()
        window.scrollTo(0, 0)
        setSuccessMessages([])
        setErrorMessages([])        
        setAuthDisplay(true)

        if (user.totp_auth_on === 0) {
            changeTwoFactor()
            return
        }

        setAuthDisplay(true)        
    }

    const fetchPasswordToCompare = useCallback(async userId => {
        const fetchResult = await fetchWithRefresh(
            `${backEndUrl}/api/v1/users/${userId}`,
            'GET',
            'application/json',
            'include'
        )        

        if (fetchResult.status >= 200 && fetchResult.status < 300) {
            setPasswordFetchedToCompare(fetchResult.data[0]?.password)
        }
    }, [backEndUrl])

    const getQrCode = useCallback(async userId => {
        const fetchResult = await fetchWithRefresh(
            `${backEndUrl}/api/v1/verifications/get-totp-secret`,
            'POST',
            'application/json',
            'include',
            { id: userId }
        )

        if (fetchResult.status >= 200 && fetchResult.status < 300) {
            setQrCodeImage(fetchResult.data.qrCodeImage)
            setTotpSecret(fetchResult.data.totpSecret)
            return         
        }

        setErrorMessages([fetchResult?.message || 'Error generating QR code'])        
    }, [backEndUrl])

    useEffect(() => {
        if (!user) {
            navigate('/sign-in')
            return
        }

        if (user?.totp_auth_on === 0) {
            getQrCode(user?.id)
        } else {
            setQrCodeImage(null)
            setTotpSecret(null)
            setTotpCode('')
            fetchPasswordToCompare(user.id)
        }
    }, [user, navigate, getQrCode, fetchPasswordToCompare])

    const successMessageDisplay = messageHelper.showSuccesses(successMessages)
    const errorMessageDisplay = messageHelper.showErrors(errorMessages)
    let  title = 'Two-Factor Authentication'
    let mainDisplay = <div>Error loading 2FA settings</div>
    
    if (authDisplay) {
        title = 'Enter password to continue'
        mainDisplay =
            <>
                <form onSubmit={verifyPassword}>
                    <input
                        type="password"
                        className="form-control rounded-0"
                        id="passwordToVerify"
                        value={passwordToVerify}
                        onChange={
                            event => setPasswordToVerify(event.target.value)
                        }
                    />

                    <br />
                    <button 
                        type="submit"
                        className="btn btn-primary mb-3 rounded-0 me-2"
                    >
                        Submit
                    </button>
                    <button
                        onClick={event => {
                            event.preventDefault()
                            navigate(-1)
                        }}
                        className="btn btn-secondary mb-3 rounded-0"
                    >
                        Cancel
                    </button>
                </form>            
            </>
    }

    if (
        !authDisplay &&
        user?.totp_auth_on === 0 &&
        user?.totp_auth_on !== undefined
    ) {
        mainDisplay =
            <>
                <div className="mb-3">
                    <label htmlFor="qr-code-image" className="form-label">
                        2FA is currently off. To turn on 2FA, scan this QR code
                        with your authenticator app or enter the 16-digit code
                        below into the app manually. Then enter your app&apos;s
                        6-digit code in the input field provided.
                    </label>
                    <br />
                    <img
                        src={qrCodeImage}
                        alt="2FA QR Code"
                        className="my-3"
                        id="qr-code-image"
                        style={{ maxWidth: '200px' }}
                    />
                    <p>{totpSecret}</p>
                </div>
                <div className="mb-3">
                    <label htmlFor="totp-code" className="form-label">
                        6-digit code from your authenticator app:
                    </label>
                    <form onSubmit={submitChangeTwoFactorForm}>
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

                        <br />
                        <button
                            className="btn btn-primary rounded-0 me-2"
                            type="submit"
                        >
                            Submit
                        </button>
                        <button
                            onClick={event => {
                                event.preventDefault()
                                navigate(-1)
                            }}
                            className="btn btn-secondary rounded-0"
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            </>
    }
    
    if (
        !authDisplay &&
        user?.totp_auth_on === 1 &&
        user?.totp_auth_on !== undefined
    ) {
        mainDisplay =
            <>
                <div className="mb-3">2FA is currently on</div>

                <br />
                <button
                    onClick={submitChangeTwoFactorForm}
                    className="btn btn-primary rounded-0 me-2"
                >
                    Turn Off
                </button>
                <button
                    onClick={event => {
                        event.preventDefault()
                        navigate(-1)
                    }}
                    className="btn btn-secondary rounded-0"
                >
                    Back
                </button>
            </>
    }
    
    return (
        <div className="container col-md-10 offset-md-1 my-4">
            {successMessageDisplay}
            {errorMessageDisplay}
            <h2>{title}</h2>
            <br />
            {mainDisplay}
        </div>
    )
}

export default TwoFactorPage
