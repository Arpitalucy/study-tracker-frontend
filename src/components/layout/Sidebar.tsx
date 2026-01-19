import { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Bell, BarChart2, Lightbulb, LogOut, Sun, Moon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import SidebarTimer from './SidebarTimer';

const Sidebar = ({ setIsAuthenticated }: { setIsAuthenticated: (val: boolean) => void }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BookOpen, label: 'Subjects', path: '/subjects' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
    ];

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        localStorage.removeItem('studyTracker_token');
        localStorage.removeItem('studyTracker_auth');
        setIsAuthenticated(false);
        navigate('/login');
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    return (
        <aside className="w-64 bg-white dark:bg-slate-900 h-screen border-r border-gray-100 dark:border-slate-800 flex flex-col shadow-sm z-50 flex-none transition-colors duration-300">
            <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none">
                        <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">StudyTrack</span>
                </div>

                <nav className="space-y-1 mb-8">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-3">Menu</p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isActive(item.path)
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="mt-8">
                    <SidebarTimer />
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors w-full text-left"
                >
                    {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-600" />}
                    <span className="font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full text-left"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
