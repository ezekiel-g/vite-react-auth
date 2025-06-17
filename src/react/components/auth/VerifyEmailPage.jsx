import { useState, useEffect, useRef, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import fetchFromBackEnd from '../../../util/fetchFromBackEnd.js'
import messageHelper from '../../../util/messageHelper.jsx'

const VerifyEmailPage = () => {
    const [successMessages, setSuccessMessages] = useState([])
    const [errorMessages, setErrorMessages] = useState([])
    const hasConfirmed = useRef(false)
    const [searchParams] = useSearchParams()
    const backEndUrl = import.meta.env.VITE_BACK_END_URL

    const verifyAccountByEmail = useCallback(async token => {
        window.scrollTo(0, 0)
        setSuccessMessages([])
        setErrorMessages([])

        const fetchResult = await fetchFromBackEnd(
            `${backEndUrl}/api/v1/verifications/verify-account-by-email` +
            `?token=${token}`
        )

        if (fetchResult.status >= 200 && fetchResult.status < 300) {
            setSuccessMessages([
                fetchResult.message || 'Email address verified successfully'
            ])
            return
        }

        setErrorMessages([fetchResult?.message || 'Verification failed'])
    }, [backEndUrl])    

    useEffect(() => {
        const token = searchParams.get('token')

        if (!token) {
            setErrorMessages(['Missing token'])
            return
        }

        if (hasConfirmed.current) return

        hasConfirmed.current = true
        verifyAccountByEmail(token)
    }, [searchParams, verifyAccountByEmail])    

    const successMessageDisplay = messageHelper.showSuccesses(successMessages)
    const errorMessageDisplay = messageHelper.showErrors(errorMessages)

    return (
        <div className="container col-md-10 offset-md-1 my-4">
            {successMessageDisplay}
            {errorMessageDisplay}
        </div>        
    )
}

export default VerifyEmailPage
