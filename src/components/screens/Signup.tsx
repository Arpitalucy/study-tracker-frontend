
import React from 'react';

export default function Signup({ setIsAuthenticated }: { setIsAuthenticated: (value: boolean) => void }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Signup</h1>
            <button
                onClick={() => setIsAuthenticated(true)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
                Signup (Demo)
            </button>
        </div>
    );
}
