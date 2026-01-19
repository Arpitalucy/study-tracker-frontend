
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Clock, Book, CheckCircle } from 'lucide-react';

const MonthlyStudyGoal = () => {
    // Mock data
    const data = [
        { name: 'Completed', value: 35, color: '#10b981' }, // green-500
        { name: 'Remaining', value: 15, color: '#e5e7eb' }, // gray-200
    ];

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" />
                    Monthly Study Goal
                </h2>
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">October</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="w-32 h-32 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={-270}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-xl font-bold text-gray-800">70%</span>
                    </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md shadow-sm">
                                <Clock className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Target Hours</p>
                                <p className="font-semibold text-gray-800">50 Hours</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">35h Done</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-md shadow-sm">
                                <Book className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Chapters</p>
                                <p className="font-semibold text-gray-800">12 Chapters</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">4 Done</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonthlyStudyGoal;
