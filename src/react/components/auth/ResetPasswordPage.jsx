import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import fetchFromBackEnd from '../../../util/fetchFromBackEnd.js'
import messageHelper from '../../../util/messageHelper.jsx'

const ResetPasswordPage = () => {
    const [email, setEmail] = useState([])
    const [newPassword, setNewPassword] = useState([])
    const [reEnteredPassword, setReEnteredPassword] = useState([])
    const [successMessages, setSuccessMessages] = useState([])
    const [errorMessages, setErrorMessages] = useState([])
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')
    const backEndUrl = import.meta.env.VITE_BACK_END_URL

    const changePassword = async event => {
        event.preventDefault()
        window.scrollTo(0, 0)
        setSuccessMessages([])
        setErrorMessages([])

        const newErrors = []

        if (!token) newErrors.push('Missing token')

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{16,}$/

        if (!passwordRegex.test(newPassword)) newErrors.push(
            'Password must be at least 16 characters and include at least ' +
            'one lowercase letter, one capital letter, one number and one ' +
            'symbol (!@#$%^&*)'            
        )

        if (newPassword !== reEnteredPassword) {
            newErrors.push('Passwords must match')
        }
        if (newErrors.length > 0) {
            setErrorMessages(newErrors)
            return
        }

        const fetchResult = await fetchFromBackEnd(
            `${backEndUrl}/api/v1/verifications/reset-password`,
            'PATCH',
            'application/json',
            'same-origin',
            { email, newPassword, token }
        )

        if (fetchResult.status >= 200 && fetchResult.status < 300) {
            setSuccessMessages([
                fetchResult.message || 'Password reset successfully'
            ])
            return
        }        

        setErrorMessages([fetchResult?.message])
    }

    useEffect(() => {
        if (!token) {
            setErrorMessages(['Missing token'])
            return
        }
    }, [searchParams, token])
    
    const successMessageDisplay = messageHelper.showSuccesses(successMessages)
    const errorMessageDisplay = messageHelper.showErrors(errorMessages)
    
    return (
        <div className="container mt-5 px-5">
            {successMessageDisplay}
            {errorMessageDisplay}
            <h2 className="mb-4">Reset Password</h2>
            <form onSubmit={changePassword}>
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
                        New password
                    </label>
                    <input
                        type="password"
                        className="form-control rounded-0"
                        id="newPassword"
                        value={newPassword}
                        onChange={event => setNewPassword(event.target.value)}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="reEnteredPassword" className="form-label">
                        Re-enter new password
                    </label>
                    <input
                        type="password"
                        className="form-control rounded-0"
                        id="reEnteredPassword"
                        value={reEnteredPassword}
                        onChange={
                            event =>
                                setReEnteredPassword(event.target.value)
                        }
                    />
                </div>

                <br />
                <button 
                    type="submit"
                    className="btn btn-primary mb-3 rounded-0"
                >
                    Submit
                </button>
            </form>
        </div>
    )    
}

export default ResetPasswordPage
