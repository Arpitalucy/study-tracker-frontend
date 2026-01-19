import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({ setIsAuthenticated }: { setIsAuthenticated: (val: boolean) => void }) => {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar setIsAuthenticated={setIsAuthenticated} />
            <main className="flex-1 h-full overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
