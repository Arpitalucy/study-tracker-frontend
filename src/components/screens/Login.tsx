
import React from 'react';

export default function Login({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Login</h1>
            <button
                onClick={() => setIsAuthenticated(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                Login (Demo)
            </button>
        </div>
    );
}
