import { beforeEach, describe, it, expect, vi } from "vitest"
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from "react-router-dom"
import Navbar from '../src/components/Navbar'
import '@testing-library/jest-dom/vitest';

const { getCurrentUserMock, isAuthenticatedMock, logoutMock } = vi.hoisted(() => ({
    getCurrentUserMock: vi.fn(),
    isAuthenticatedMock: vi.fn(),
    logoutMock: vi.fn()
}))

vi.mock('../src/services/auth.service', () => ({
    authService: {
        getCurrentUser: getCurrentUserMock,
        isAuthenticated: isAuthenticatedMock,
        logout: logoutMock
    }
}))

function LocationDisplay() {
    const location = useLocation()
    return <p>Page actuelle: {location.pathname}</p>
}

function renderNavbar() {
    return render(
        <MemoryRouter initialEntries={[`/`]}>
            <Navbar />
            <LocationDisplay />
        </MemoryRouter>
    )
}

describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        getCurrentUserMock.mockReturnValue(null)
        isAuthenticatedMock.mockReturnValue(false)
    })

    it('should invite to login or register if not authenticated', () => {
        renderNavbar()

        expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Register' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Sessions' })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Logout' })).not.toBeInTheDocument()
    })
    it('should give access to the the links Session, Profile and Logout if authenticated', () => {
        isAuthenticatedMock.mockReturnValue(true)
        getCurrentUserMock.mockReturnValue({admin: false})
        renderNavbar()

        expect(screen.getByRole('link', { name: 'Sessions' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Create Session' })).not.toBeInTheDocument()
    })
    it('should show Create Session if authentificated and admin', () => {
        isAuthenticatedMock.mockReturnValue(true)
        getCurrentUserMock.mockReturnValue({admin: true})
        renderNavbar()

        expect(screen.getByRole('link', { name: 'Create Session' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Sessions' })).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Profile' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Register' })).not.toBeInTheDocument()
    })
    it('should logout if clicked and return to the unauthenticated presentation', async () => {
        isAuthenticatedMock.mockReturnValue(true)
        
        logoutMock.mockImplementation(() => {
            getCurrentUserMock.mockReturnValue(null)
            isAuthenticatedMock.mockReturnValue(false)
        })

        const user = userEvent.setup()
        renderNavbar()
        await user.click(screen.getByRole('button', {name: 'Logout'}))

        expect(logoutMock).toHaveBeenCalled()
        expect(screen.getByText('Page actuelle: /login')).toBeInTheDocument()
    })
})