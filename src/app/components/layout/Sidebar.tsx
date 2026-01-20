
import React from 'react';
import { LayoutDashboard, BookOpen, Bell, BarChart2, Lightbulb, Plus, Clock, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = ({ onLogout }: { onLogout: () => void }) => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'Subjects', path: '/subjects' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <aside className="w-64 bg-white h-screen fixed left-0 top-0 border-r border-gray-100 flex flex-col shadow-sm z-50">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-800">StudyTrack</span>
                </div>

                <nav className="space-y-1 mb-8">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">Menu</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive(item.path)
                                ? 'bg-blue-50 text-blue-600'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="mt-auto p-4 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
