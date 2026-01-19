import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, Book, CheckCircle } from 'lucide-react';
import { api } from '../../api/api';

const MonthlyStudyGoal = () => {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [goals, setGoals] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [fetchedGoals, fetchedSubjects] = await Promise.all([
                    api.getGoals(),
                    api.getSubjects()
                ]);

                // Only count subjects whose goal still exists
                const validSubjects = fetchedSubjects.filter((s: any) =>
                    fetchedGoals.some((g: any) => g.id === s.goalId)
                );

                setSubjects(validSubjects);
                setGoals(fetchedGoals);
            } catch (err: any) {
                // handle error silently or toast
            }
        };
        fetchData();
    }, []);

    const totalDone = subjects.reduce((acc, s) => acc + (s.totalStudyHours || 0), 0);
    const totalTarget = subjects.reduce((acc, s) => acc + (s.totalTargetHours || 0), 0);
    const percentage = totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0;

    const data = [
        { name: 'Completed', value: totalDone, color: '#10b981' },
        { name: 'Remaining', value: Math.max(0, totalTarget - totalDone), color: '#e5e7eb' },
    ];

    const isDarkMode = document.documentElement.classList.contains('dark');

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 h-full transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    Overall Progress
                </h2>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Completed', value: totalDone, color: '#10b981' },
                                    { name: 'Remaining', value: Math.max(0, totalTarget - totalDone), color: isDarkMode ? '#1e293b' : '#e5e7eb' },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                                stroke="none"
                            >
                                {[
                                    { color: '#10b981' },
                                    { color: isDarkMode ? '#1e293b' : '#e5e7eb' }
                                ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: isDarkMode ? '#1e293b' : '#fff',
                                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                                    color: isDarkMode ? '#fff' : '#000'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-xl font-bold text-gray-800 dark:text-white">{percentage}%</span>
                    </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Target Hours</p>
                                <p className="font-semibold text-gray-800 dark:text-white">{totalTarget} Hours</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{totalDone}h Done</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                                <Book className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Subjects</p>
                                <p className="font-semibold text-gray-800 dark:text-white">{subjects.length} Active</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{subjects.filter(s => (s.totalStudyHours >= s.totalTargetHours) && s.totalTargetHours > 0).length} Finished</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyStudyGoal;
