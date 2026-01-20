import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
    setIsAuthenticated: (value: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ setIsAuthenticated }) => {
    return (
        <div className="flex min-h-screen bg-slate-50">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
