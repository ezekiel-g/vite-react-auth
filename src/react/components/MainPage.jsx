import useAuthContext from '../contexts/auth/useAuthContext.js'

const MainPage = () => {
    const { user } = useAuthContext()

    const intro = user
        ? `Hello, ${user.username}`
        : 'Hello, please sign in to continue'

    return (
        <div className="container col-md-10 offset-md-1 my-4">
            <h1>{intro}</h1>
        </div>
    )
}

export default MainPage
