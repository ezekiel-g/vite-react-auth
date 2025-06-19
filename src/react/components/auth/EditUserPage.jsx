import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import bcryptjs from 'bcryptjs'
import useAuthContext from '../../contexts/auth/useAuthContext.js'
import fetchWithRefresh from '../../../util/fetchWithRefresh.js'
import validateUser from '../../../util/validateUser.js'
import messageHelper from '../../../util/messageHelper.jsx'

const EditUserPage = () => {
    const { user, setUser } = useAuthContext()
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [reEnteredPassword, setReEnteredPassword] = useState('')
    const [authDisplay, setAuthDisplay] = useState(false)
    const [passwordToVerify, setPasswordToVerify] = useState('')
    const [passwordFetchedToCompare, setPasswordFetchedToCompare] = useState('')
    const [successMessages, setSuccessMessages] = useState([])
    const [errorMessages, setErrorMessages] = useState([])
    const navigate = useNavigate()
    const backEndUrl = import.meta.env.VITE_BACK_END_URL

    const editUser = useCallback(async () => {
        setSuccessMessages([])
        setErrorMessages([])
        setAuthDisplay(false)
        setPasswordToVerify('')

        let updatedFields = []

        if (username !== user?.username) {
            updatedFields.push(
                `Username from ${user?.username} to ${username}`
            )
        }

        if (email !== user?.email) {
            updatedFields.push(
                `Email address from ${user?.email} to ${email}`
            )      
        }

        if (password && password !== '') {
            updatedFields.push(
                'Password from **************** to ****************'
            )
        }
        
        updatedFields = updatedFields.map(field => `${field}`).join('\n')
        const updateMessage = 'Update the following?\n\n' + updatedFields

        if (!window.confirm(updateMessage)) return

        const fetchResult = await fetchWithRefresh(
            `${backEndUrl}/api/v1/users`,
            'PATCH',
            'application/json',
            'include',
            { id: user.id, username, email, password, reEnteredPassword }
        )
        
        if (fetchResult.data.validationErrors?.length > 0) {
            setErrorMessages(fetchResult.data.validationErrors)
            return
        }
        
        if (
            fetchResult.status >= 200 &&
            fetchResult.status < 300 &&            
            fetchResult.data.successfulUpdates?.length > 0
        ) {
            setUser(fetchResult.data.user)
            setPassword('')
            setReEnteredPassword('')
            setSuccessMessages(fetchResult.data.successfulUpdates)
            return
        }

        setErrorMessages([fetchResult.message || 'Update failed'])
    }, [
        username,
        email,
        password,
        reEnteredPassword,
        backEndUrl,
        setUser,
        user
    ])

    const verifyPassword = async event => {
        event.preventDefault()
        setSuccessMessages([])
        setErrorMessages([])
   
        const passwordValid =
            await bcryptjs.compare(passwordToVerify, passwordFetchedToCompare)

        if (!passwordValid) {
            setErrorMessages(['Invalid password'])
            return
        }

        editUser()
    }

    const submitEditUserForm = async event => {
        event.preventDefault()
        window.scrollTo(0, 0)
        setSuccessMessages([])
        setErrorMessages([])
        
        const validationResult = await validateUser(
            { username, email, password, reEnteredPassword },
            user.id
        )

        if (!validationResult.valid) {
            setErrorMessages(validationResult.validationErrors)
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
    
    useEffect(() => {
        if (!user) {
            navigate('/')
            return
        }

        setUsername(user.username)
        setEmail(user.email)
        fetchPasswordToCompare(user.id)
    }, [user, navigate, fetchPasswordToCompare])

    const successMessageDisplay = messageHelper.showSuccesses(successMessages)
    const errorMessageDisplay = messageHelper.showErrors(errorMessages)
    let mainDisplay

    if (authDisplay) {
        mainDisplay =
            <>
                <h2>Enter password to continue</h2>

                <br />
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
    } else {
        mainDisplay =
            <>
                <h2>Edit Settings</h2>

                <br />
                <form onSubmit={submitEditUserForm}>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">
                            Username
                        </label>
                        <input
                            type="text"
                            className="form-control rounded-0"
                            id="username"
                            value={username || ''}
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
                            value={email || ''}
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
                            id="password"
                            value={password}
                            onChange={event => setPassword(event.target.value)}
                            placeholder="Leave blank to keep password unchanged"
                        />
                    </div>
                    <div className="mb-3">
                        <label
                            htmlFor="reEnteredPassword"
                            className="form-label"
                        >
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
                            placeholder="Leave blank to keep password unchanged"
                        />
                    </div> 
                    <div className="mb-3">
                        <span
                            onClick={
                                () => navigate(
                                    '/settings/edit/2fa'
                                )
                            }
                            className="mb-3"
                            style={{
                                cursor: 'pointer',
                                textDecoration: 'underline'
                            }}
                        >
                            Two-factor authentication settings
                        </span>
                    </div>

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
                        Back
                    </button>
                </form>
            </>
    }

    return (
        <div className="container col-md-10 offset-md-1 my-4">
            {successMessageDisplay}
            {errorMessageDisplay}
            {mainDisplay}
        </div>
    )    
}

export default EditUserPage
