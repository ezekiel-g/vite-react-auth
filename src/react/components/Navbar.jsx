import { Link } from 'react-router-dom'
import useAuthContext from '../contexts/auth/useAuthContext.js'
import fetchWithRefresh from '../../util/fetchWithRefresh.js'

const Navbar = () => {
    const { user, setUser } = useAuthContext()
    const backEndUrl = import.meta.env.VITE_BACK_END_URL
    let linksRight

    const signOut = async () => {
        window.scrollTo(0, 0)
        if (!window.confirm('Sign out?')) return

        await fetchWithRefresh(
            `${backEndUrl}/api/v1/sessions`,
            'DELETE',
            'application/json',
            'include'
        )

        setUser(null)
    }

    if (user) {
        linksRight =
            <div>
                <Link
                    to="/settings"
                    className="nav-link d-inline-block me-3"
                >
                    Settings
                </Link>
                <span
                    className="nav-link d-inline-block"
                    role="button"
                    style={{ cursor: 'pointer' }}
                    onClick={() => signOut()}
                >
                    Sign Out
                </span>
            </div>
    } else {
        linksRight =
        <div>
            <Link
                to="/sign-in"
                className="nav-link d-inline-block me-3"
            >
                Sign In
            </Link>
            <Link to="/register" className="nav-link d-inline-block">
                Register
            </Link>
        </div>
    }

    return (
        <nav className="navbar px-2 py-3 border-bottom">
            <div className="container-fluid d-flex justify-content-between">
                <Link to="/" className="nav-link">Home</Link>
                {linksRight}
            </div>
        </nav>
    )
}

export default Navbar
