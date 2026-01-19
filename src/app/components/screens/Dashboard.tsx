
import React from 'react';
import { Link } from 'react-router-dom';

import ExamGoalStats from '../dashboard/ExamGoalStats';
import MonthlyStudyGoal from '../dashboard/MonthlyStudyGoal';
import { Calendar } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="p-8 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Dashboard</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium mt-1">Ready to master your progress today?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 transition-all">
            <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
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

      <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 tracking-tight uppercase text-sm">Quick Navigation</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { to: '/subjects', title: 'Subjects', desc: 'Manage study subjects & schedules' },
          { to: '/notifications', title: 'Notifications', desc: 'Active reminders & session history' },
          { to: '/analytics', title: 'Analytics', desc: 'Detailed insights & performance metrics' }
        ].map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-xl hover:scale-[1.02] dark:hover:bg-slate-800/80 transition-all duration-300 group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 dark:bg-blue-400/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150" />
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{link.title}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 font-medium leading-relaxed">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}