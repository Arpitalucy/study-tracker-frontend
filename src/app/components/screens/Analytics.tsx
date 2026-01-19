import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { ArrowLeft, TrendingUp, Target, Clock, Award, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../api/api';
import { toast } from 'sonner';

export default function Analytics() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);

    // Also listen for changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedGoals, fetchedSubjects, fetchedNotifs] = await Promise.all([
          api.getGoals(),
          api.getSubjects(),
          api.getNotifications()
        ]);

        const validSubjects = fetchedSubjects.filter((s: any) =>
          fetchedGoals.some((g: any) => g.id === s.goalId)
        );

        setSubjects(validSubjects);
        setNotifications(fetchedNotifs);
      } catch (err: any) {
        toast.error("Failed to fetch analytics data");
      }
    };
    fetchData();
  }, []);

  // DERIVE DATA
  const totalCompletedHours = subjects.reduce((acc, s) => acc + (s.totalStudyHours || 0), 0);
  const totalTargetHours = subjects.reduce((acc, s) => acc + (s.totalTargetHours || 0), 0);
  const completionRate = totalTargetHours > 0 ? Math.round((totalCompletedHours / totalTargetHours) * 100) : 0;

  // Today's Progress calculation
  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'short' });

    const scheduledToday = subjects.filter(s => s.schedule?.days.includes(dayName));
    const targetToday = scheduledToday.reduce((sum, s) => sum + (s.schedule?.duration || 0), 0);

    const completedToday = notifications
      .filter(n => n.scheduledDate === today && n.status === 'COMPLETED')
      .reduce((sum, n) => sum + (n.scheduledHours || 0), 0);

    return { target: targetToday, completed: completedToday };
  };

  const todayStats = getTodayStats();
  const todayProgressRate = todayStats.target > 0
    ? Math.round((todayStats.completed / todayStats.target) * 100)
    : 0;

  // Chart: Consistency (Hours per day of last 7 days)
  const getConsistencyData = () => {
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const dayHours = notifications
        .filter(n => n.scheduledDate === date && n.status === 'COMPLETED')
        .reduce((sum, n) => sum + n.scheduledHours, 0);
      return {
        date: date.split('-').slice(1).join('/'),
        hours: dayHours
      };
    });
  };

  const consistencyData = getConsistencyData();

  const subjectComparisonData = subjects.map(s => ({
    subject: s.name,
    completed: s.totalStudyHours || 0,
    target: s.totalTargetHours || 0,
    color: s.color
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="dark:text-slate-400 dark:hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl text-gray-900 dark:text-white">Analytics & Insights</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-none shadow-sm bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Total Hours</span>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"><Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white font-mono">{totalCompletedHours}h</div>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-2 font-medium">of {totalTargetHours}h total target</p>
          </Card>

          <Card className="p-6 border-none shadow-sm bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Goal Progress</span>
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"><Target className="w-5 h-5 text-green-600 dark:text-green-400" /></div>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white font-mono">{completionRate}%</div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-green-500 dark:bg-green-600 h-full rounded-full transition-all duration-1000" style={{ width: `${completionRate}%` }} />
            </div>
          </Card>

          <Card className="p-6 border-none shadow-sm bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">Today</span>
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg"><Award className="w-5 h-5 text-purple-600 dark:text-purple-400" /></div>
            </div>
            <div className="text-3xl font-black text-gray-900 dark:text-white font-mono">{todayStats.completed}/{todayStats.target}h</div>
            <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-purple-500 dark:bg-purple-600 h-full rounded-full transition-all duration-1000" style={{ width: `${todayProgressRate}%` }} />
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Consistency Chart */}
          <Card className="p-6 border-none shadow-sm bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Study Consistency</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={consistencyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                    borderRadius: '12px',
                    border: isDarkMode ? '1px solid #1e293b' : 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Line
                  type="monotone"
                  dataKey="hours"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: isDarkMode ? '#0f172a' : '#fff' }}
                  activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: isDarkMode ? '#fff' : '#0f172a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Subject Comparison */}
          <Card className="p-6 border-none shadow-sm bg-white dark:bg-slate-900 dark:border dark:border-slate-800">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Completed vs Target</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={subjectComparisonData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="subject"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDarkMode ? '#f8fafc' : '#1e293b', fontSize: 11, fontWeight: 600 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#1e293b',
                    borderRadius: '12px',
                    border: isDarkMode ? '1px solid #1e293b' : 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="completed" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={18} />
                <Bar dataKey="target" fill={isDarkMode ? "#1e293b" : "#f1f5f9"} radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Insights (Simplified) */}
          <Card className="p-6 border-none shadow-sm bg-white dark:bg-slate-900 dark:border dark:border-slate-800 lg:col-span-2">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white">Smart Insights</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-4 p-5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/20">
                < Award className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-blue-900 dark:text-blue-200">Consistency Fact</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300/80 leading-relaxed font-medium">You have been active <span className="text-blue-900 dark:text-white font-bold">{consistencyData.filter(d => d.hours > 0).length}</span> of the last 7 days. Consistency is key to long-term memory!</p>
                </div>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  Daily Tip
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium mt-2">Checking into your scheduled sessions promptly increases your schedule reliability. Keep ticking those boxes!</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

