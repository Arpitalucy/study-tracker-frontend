import React from 'react';
import { Link } from 'react-router-dom';
import ExamGoalStats from '../dashboard/ExamGoalStats';
import MonthlyStudyGoal from '../dashboard/MonthlyStudyGoal';

export default function Dashboard() {
    return (
        <div className="p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Welcome back! Ready to achieve your goals?</p>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <ExamGoalStats />
                </div>
                <div className="lg:col-span-1">
                    <MonthlyStudyGoal />
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Navigation</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link to="/subjects" className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">Subjects</h2>
                    <p className="text-sm text-gray-500">Manage your study subjects</p>
                </Link>
                <Link to="/notifications" className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">Notifications</h2>
                    <p className="text-sm text-gray-500">View recent updates</p>
                </Link>
                <Link to="/analytics" className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                    <h2 className="text-lg font-semibold mb-1 group-hover:text-blue-600 transition-colors">Analytics</h2>
                    <p className="text-sm text-gray-500">Track your progress</p>
                </Link>
            </div>
        </div>
    );
}
