import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import useAuthContext from '../../contexts/auth/useAuthContext.js'
import validateUser from '../../../util/validateUser.js'
import fetchFromBackEnd from '../../../util/fetchFromBackEnd.js'
import messageHelper from '../../../util/messageHelper.jsx'

const RegisterPage = () => {
    const { user } = useAuthContext()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [reEnteredPassword, setReEnteredPassword] = useState('')
    const [successMessages, setSuccessMessages] = useState([])
    const [errorMessages, setErrorMessages] = useState([])
    const navigate = useNavigate()
    const isRegistering = useRef(false)
    const backEndUrl = import.meta.env.VITE_BACK_END_URL

    const addUser = async event => {
        event.preventDefault()
        window.scrollTo(0, 0)
        setSuccessMessages([])
        setErrorMessages([])

        const validationResult = await validateUser(
            {
                username,
                email,
                password,
                reEnteredPassword
            }
        )
        
        if (!validationResult.valid) {
            setErrorMessages(validationResult.validationErrors)
            return
        }

        const fetchResult = await fetchFromBackEnd(
            `${backEndUrl}/api/v1/users`,
            'POST',
            'application/json',
            'same-origin',
            { username, email, password, reEnteredPassword }
        )
        
        if (fetchResult.data.validationErrors?.length > 0) {
            setErrorMessages(fetchResult.data.validationErrors)
            return
        }

        if (
            fetchResult.status >= 200 &&
            fetchResult.status < 300 &&            
            fetchResult.message.includes('Registered successfully')
        ) {
            setSuccessMessages([
                fetchResult.message ||
                'Registered successfully'
            ])
            setTimeout(() => { navigate('/sign-in') }, 2000)
            return
        }

        setErrorMessages([fetchResult.message || 'Registration failed'])
    }

    useEffect(() => {
        if (user && !isRegistering.current) navigate('/')
    }, [user, navigate])

    const successMessageDisplay = messageHelper.showSuccesses(successMessages)
    const errorMessageDisplay = messageHelper.showErrors(errorMessages)

    return (
        <div className="container col-md-10 offset-md-1 my-4">
            {successMessageDisplay}
            {errorMessageDisplay}
            <h2 className="mb-4">Register</h2>
            <form onSubmit={addUser}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                        Username
                    </label>
                    <input
                        type="text"
                        className="form-control rounded-0"
                        id="username"
                        value={username}
                        onChange={event => setUsername(event.target.value)}
                    />
                </div>
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

                <div className="mb-3">
                    <label htmlFor="reEnteredPassword" className="form-label">
                        Re-enter password
                    </label>
                    <input
                        type="password"
                        className="form-control rounded-0"
                        id="reEnteredPassword"
                        value={reEnteredPassword}
                        onChange={
                            event => setReEnteredPassword(event.target.value)
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
            <Link to="/sign-in" className="nav-link ps-0">
                Have an account? Sign in
            </Link>
        </div>
    )
}

export default RegisterPage
