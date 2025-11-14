import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import LoginPage from '@/app/login/page';
import React from 'react';


jest.mock('next/navigation', () => ({
    useRouter: () => ({
        replace: jest.fn(),
    }),
}));

jest.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn(),
        setIsLogged: jest.fn(),
        handleToast: jest.fn(),
    }),
}))

jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn(),
    },
    ToastContainer: () => <div>ToastContainer</div>,
}))

jest.mock('@/api/authApi', () => ({
    loginService: jest.fn(),
    validateAuthenticatorCode: jest.fn(),
}))

import { loginService } from '@/api/authApi';

describe('LoginPage', () => {
    beforeEach(() =>  {
        jest.clearAllMocks()
    })
    
    
    it('renders login inputs and button', () => {
        render(<LoginPage/>);
        expect(screen.getByText(/login para usuarios/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/correo/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Login/i})).toBeInTheDocument()
    })
})
    


