import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import useAuthContext from '../../../react/contexts/auth/useAuthContext.js'
import Navbar from '../../../react/components/Navbar'
import fetchWithRefresh from '../../../util/fetchWithRefresh.js'

vi.mock('../../../react/contexts/auth/useAuthContext.js', () => ({
    default: vi.fn()
}))
vi.mock('../../../util/fetchWithRefresh.js')

describe('Navbar', () => {
    it('calls signOut and clears user on successful sign-out', async () => {
        window.scrollTo = vi.fn()

        const setUser = vi.fn()

        useAuthContext.mockReturnValue({ user: { username: 'User1' }, setUser })
        fetchWithRefresh.mockResolvedValueOnce({ status: 200 })

        const confirmMock = vi.fn(() => true)
        globalThis.confirm = confirmMock

        render(
            <BrowserRouter>
                <Navbar />
            </BrowserRouter>
        )

        fireEvent.click(screen.getByText('Sign Out'))

        await waitFor(
            () => expect(confirmMock).toHaveBeenCalledWith('Sign out?')
        )

        await waitFor(() => expect(fetchWithRefresh).toHaveBeenCalled())
        expect(setUser).toHaveBeenCalledWith(null)
    })
})
