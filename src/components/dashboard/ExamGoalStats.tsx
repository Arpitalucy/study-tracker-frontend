
import React from 'react';
import { Trophy, Target, Calendar } from 'lucide-react';

const ExamGoalStats = () => {
    // Mock data regarding exam goals
    const goals = [
        { id: 1, title: 'Final Exams', date: '2024-05-15', progress: 65, color: 'bg-blue-500' },
        { id: 2, title: 'SAT Prep', date: '2024-06-01', progress: 40, color: 'bg-purple-500' },
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    Exam Goals
                </h2>
                <button className="text-sm text-blue-600 font-medium hover:underline">Manage Goals</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {goals.map((goal) => (
                    <div key={goal.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-gray-800">{goal.title}</h3>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(goal.date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="p-2 bg-white rounded-full shadow-sm">
                                <Target className="w-4 h-4 text-blue-600" />
                            </div>
                        </div>

                        <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-semibold text-gray-700">{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${goal.color}`}
                                    style={{ width: `${goal.progress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExamGoalStats;
