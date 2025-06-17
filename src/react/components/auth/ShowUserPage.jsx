import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthContext from '../../contexts/auth/useAuthContext.js'
import fetchWithRefresh from '../../../util/fetchWithRefresh.js'
import messageHelper from '../../../util/messageHelper.jsx'
import formatDateAndTime from '../../../util/formatDateAndTime.js'

const ShowUserPage = () => {
    const { user } = useAuthContext()
    const [successMessages, setSuccessMessages] = useState([])
    const [errorMessages, setErrorMessages] = useState([])
    const navigate = useNavigate()
    const backEndUrl = import.meta.env.VITE_BACK_END_URL

    const sendDeleteAccountEmail = async () => {
        setSuccessMessages([])
        setErrorMessages([])

        if (!window.confirm(
            'Continue with account deletion? This is irreversible. You will ' +
            'be asked to confirm by email.'
        )) {
            return
        }

        const fetchResult = await fetchWithRefresh(
            `${backEndUrl}/api/v1/verifications/request-account-deletion`,
            'POST',
            'application/json',
            'include',
            { id: user.id }
        )
        
        if (
            fetchResult.status >= 200 &&
            fetchResult.status < 300 &&            
            fetchResult.message.includes('Account deletion requested')
        ) {
            setSuccessMessages([fetchResult.message])
        }

        setErrorMessages['Account deletion request failed']
    }

    useEffect(() => {
        if (!user) navigate('/')
    }, [user, navigate])

    const successMessageDisplay = messageHelper.showSuccesses(successMessages)
    const errorMessageDisplay = messageHelper.showErrors(errorMessages)
    
    return (
        <div className="container col-md-10 offset-md-1 my-4">
            {successMessageDisplay}
            {errorMessageDisplay}
            <h2>{user?.username || ''}</h2>

            <br />
            <table className="table table-bordered table-dark">
			    <thead>
			        <tr>
			            <th>Field</th>
			            <th>Value</th>
			        </tr>
			    </thead>
			    <tbody>
			        <tr>
			            <td>Username</td>
			            <td>{user?.username || ''}</td>
			        </tr>
			        <tr>
			            <td>Email address</td>
			            <td>{user?.email || ''}</td>
			        </tr>
			        <tr>
			            <td>Role</td>
			            <td>
                            {
                                (
                                    user?.role.charAt(0).toUpperCase() +
                                    user?.role.slice(1)
                                ) ||
                                ''
                            }
                        </td>
			        </tr>
			        <tr>
			            <td>Password</td>
			            <td>****************</td>
			        </tr>
			        <tr>
			            <td>Two-factor authentication</td>
			            <td>{user?.totp_auth_on === 0 ? 'Off' : 'On'}</td>
			        </tr>
			        <tr>
			            <td>Member since</td>
			            <td>
                            {formatDateAndTime(user?.created_at, 'date') || ''}
                        </td>
			        </tr>
			    </tbody>
            </table>

            <br />
            <div className="d-flex justify-content-between">
                <button
                    onClick={() => navigate('/settings/edit')} 
                    className="btn btn-primary mb-3 rounded-0"
                >
                    Edit Settings
                </button>
                <button
                    onClick={sendDeleteAccountEmail}
                    className="btn btn-danger mb-3 rounded-0"
                >
                    Delete Account
                </button>
            </div>
        </div>
    )    
}

export default ShowUserPage
