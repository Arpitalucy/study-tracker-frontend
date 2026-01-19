
import React, { useState, useEffect } from 'react';
import { Trophy, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../../api/api';

const ExamGoalStats = () => {
    const navigate = useNavigate();
    const [goals, setGoals] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fetchedGoals, fetchedSubjects] = await Promise.all([
                    api.getGoals(),
                    api.getSubjects()
                ]);
                setGoals(fetchedGoals);
                setSubjects(fetchedSubjects);
            } catch (err: any) {
                toast.error("Failed to fetch goal stats");
            }
        };
        fetchData();
    }, []);

    const goalStats = goals.map(goal => {
        const goalSubjects = subjects.filter(s => s.goalId === goal.id);
        const totalHours = goalSubjects.reduce((acc, s) => acc + (s.totalTargetHours || 0), 0);
        const completedHours = goalSubjects.reduce((acc, s) => acc + (s.totalStudyHours || 0), 0);
        const progress = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

        return {
            ...goal,
            progress
        };
    });

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 transition-colors duration-300">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Target Goals
                </h2>
                <button
                    onClick={() => navigate('/subjects')}
                    className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                    Manage
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goalStats.length === 0 ? (
                    <div className="col-span-2 py-8 text-center bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-gray-200 dark:border-slate-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400">No active goals found. Start by adding one in Subject Management.</p>
                    </div>
                ) : (
                    goalStats.map((goal) => (
                        <div key={goal.id} className="p-4 rounded-lg bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-700">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-800 dark:text-white truncate pr-2">{goal.title}</h3>
                                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <Calendar className="w-3 h-3" />
                                        <span>{goal.type === 'EXAM' ? 'Exam Target' : 'Monthly Goal'}</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                                    <Target className="w-4 h-4 text-blue-600" />
                                </div>
                            </div>

                            <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-gray-500 dark:text-gray-400">Goal Progress</span>
                                    <span className="font-semibold text-gray-700 dark:text-gray-200">{goal.progress}%</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500 shadow-[0_0_8px_rgba(37,99,235,0.4)]"
                                        style={{ width: `${goal.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ExamGoalStats;
