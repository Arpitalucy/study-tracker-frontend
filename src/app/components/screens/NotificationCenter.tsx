import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Bell, CheckCircle2, AlertCircle, TrendingUp, Trophy, Sun, Moon, Clock, CheckSquare, XCircle, History } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../api/api';

interface AppNotification {
  id: string;
  subjectId: string;
  subjectName: string;
  type: 'SCHEDULED_STUDY' | 'SYSTEM';
  title: string;
  message: string;
  scheduledHours: number;
  scheduledTime: string; // HH:mm
  scheduledDate: string; // YYYY-MM-DD
  status: 'PENDING' | 'COMPLETED' | 'MISSED';
  read: boolean;
  timestamp: number; // Created at (ms)
}

export default function NotificationCenter() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedSubjects, backendNotifs] = await Promise.all([
          api.getSubjects(),
          api.getNotifications()
        ]);

        // Convert ISO strings from backend to numbers for consistent sorting and state
        const fetchedNotifs = backendNotifs.map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp).getTime()
        }));

        setSubjects(fetchedSubjects);

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

        let updatedNotifs = [...fetchedNotifs];
        let changed = false;

        fetchedSubjects.forEach((s: any) => {
          if (s.schedule && s.schedule.days.includes(currentDay)) {
            const notifId = `study-${s.id}-${todayStr}`;
            const existing = updatedNotifs.find(n => n.id === notifId);

            if (!existing) {
              const [sHour, sMin] = s.schedule.time.split(':').map(Number);
              const scheduledDate = new Date();
              scheduledDate.setHours(sHour, sMin, 0, 0);

              let status: 'PENDING' | 'MISSED' | 'COMPLETED' = 'PENDING';
              if (now.getTime() > scheduledDate.getTime() + s.schedule.duration * 3600000) {
                status = 'MISSED';
              }

              updatedNotifs.push({
                id: notifId,
                subjectId: s.id,
                subjectName: s.name,
                type: 'SCHEDULED_STUDY',
                scheduledHours: s.schedule.duration,
                scheduledTime: s.schedule.time,
                scheduledDate: todayStr,
                status: status,
                read: false,
                timestamp: Date.now()
              });
              changed = true;
            } else if (existing.status === 'PENDING') {
              const [sHour, sMin] = existing.scheduledTime.split(':').map(Number);
              const scheduledDate = new Date();
              scheduledDate.setHours(sHour, sMin, 0, 0);

              if (now.getTime() > scheduledDate.getTime() + s.scheduledHours * 3600000) {
                existing.status = 'MISSED';
                changed = true;
              }
            }
          }
        });

        if (changed) {
          const syncedRaw = await api.syncNotifications(updatedNotifs);
          const synced = syncedRaw.map((n: any) => ({
            ...n,
            timestamp: new Date(n.timestamp).getTime()
          }));
          setNotifications(synced.sort((a: any, b: any) => b.timestamp - a.timestamp));
        } else {
          setNotifications(fetchedNotifs.sort((a: AppNotification, b: AppNotification) => b.timestamp - a.timestamp));
        }
      } catch (err: any) {
        toast.error("Failed to sync notifications");
      }
    };
    fetchData();
  }, []);

  const handleStudyCheckIn = async (notifId: string) => {
    try {
      const targetNotif = notifications.find(n => n.id === notifId);
      if (!targetNotif) return;

      const subject = subjects.find(s => s.id === targetNotif.subjectId);
      if (!subject) return;

      // 1. Update subject hours
      const updatedSubject = {
        ...subject,
        totalStudyHours: (subject.totalStudyHours || 0) + targetNotif.scheduledHours
      };
      await api.saveSubject(updatedSubject);
      setSubjects(subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s));

      // 2. Update notification status
      const updatedNotifs = notifications.map(n =>
        n.id === notifId ? { ...n, status: 'COMPLETED' as const, read: true } : n
      );
      await api.syncNotifications(updatedNotifs);
      setNotifications(updatedNotifs.sort((a, b) => b.timestamp - a.timestamp));

      toast.success(`Session recorded: +${targetNotif.scheduledHours}h for ${targetNotif.subjectName}`);
    } catch (err: any) {
      toast.error("Failed to record session");
    }
  };

  const handleMarkAsRead = async (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    await api.syncNotifications(updated);
  };

  const activeNotifs = notifications.filter(n => n.status === 'PENDING');
  const historyNotifs = notifications.filter(n => n.status !== 'PENDING');
  const unreadCount = notifications.filter(n => !n.read && n.status === 'PENDING').length;

  return (
    <div className="p-0 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 sticky top-0 z-10 transition-colors duration-300">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="dark:text-slate-400 dark:hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-white">Study Notifications</h1>
                {unreadCount > 0 && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{unreadCount} active reminder{unreadCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={async () => {
              const cleared = notifications.map(n => ({ ...n, read: true }));
              setNotifications(cleared);
              await api.syncNotifications(cleared);
            }}>
              Mark all read
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white dark:bg-slate-900 border dark:border-slate-800 p-1 rounded-lg">
            <TabsTrigger value="active" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:text-slate-400">
              <Bell className="w-4 h-4" />
              Active Reminders
              {activeNotifs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                  {activeNotifs.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white dark:text-slate-400">
              <History className="w-4 h-4" />
              History & Missed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeNotifs.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800">
                <CheckCircle2 className="w-16 h-16 text-green-200 dark:text-green-900/40 mx-auto mb-4" />
                <h3 className="text-xl mb-2 text-gray-900 dark:text-white">No active reminders</h3>
                <p className="text-gray-600 dark:text-slate-400">You're all caught up with your schedule!</p>
              </Card>
            ) : (
              activeNotifs.map((n) => (
                <Card key={n.id} className="p-5 border-l-4 border-l-blue-500 bg-white dark:bg-slate-900 dark:border-slate-800 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">{n.status === 'MISSED' ? `Missed: ${n.subjectName}` : `Time to Study: ${n.subjectName}`}</h3>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{n.scheduledTime} • {n.scheduledHours} hour session</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 uppercase tracking-wider font-semibold">Scheduled for Today</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStudyCheckIn(n.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 shadow-sm"
                      >
                        <CheckSquare className="w-4 h-4 mr-2" />
                        Tick Done
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3">
            {historyNotifs.length === 0 ? (
              <Card className="p-12 text-center bg-white dark:bg-slate-900 border-dashed dark:border-slate-800">
                <History className="w-16 h-16 text-gray-200 dark:text-slate-800 mx-auto mb-4" />
                <h3 className="text-xl mb-2 text-gray-900 dark:text-white">History is empty</h3>
                <p className="text-gray-600 dark:text-slate-400">Past sessions and missed alerts will appear here.</p>
              </Card>
            ) : (
              historyNotifs.map((n) => (
                <Card
                  key={n.id}
                  className={`p-4 border-l-4 transition-all ${n.status === 'COMPLETED' ? 'border-l-green-400 dark:border-l-green-600 opacity-80' : 'border-l-red-500 bg-red-50/30 dark:bg-red-900/10'
                    } bg-white dark:bg-slate-900 dark:border-slate-800`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                        }`}>
                        {n.status === 'COMPLETED' ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold ${n.status === 'COMPLETED' ? 'text-gray-400 dark:text-slate-500 line-through' : 'text-gray-900 dark:text-white'}`}>
                            {n.title || `Study Session: ${n.subjectName}`}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${n.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                            }`}>
                            {n.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-slate-400">{n.scheduledDate} • {n.scheduledTime} • {n.scheduledHours}h session</p>
                      </div>
                    </div>
                    {n.status === 'MISSED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStudyCheckIn(n.id)}
                        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-900/20 font-bold"
                      >
                        Tick to Complete Now
                      </Button>
                    )}
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Motivation Section */}
        <Card className="mt-12 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-lg">
          <div className="flex items-start gap-4">
            <Trophy className="w-10 h-10 text-yellow-300 shrink-0" />
            <div>
              <h3 className="text-lg font-bold mb-1">Consistency is Key!</h3>
              <p className="text-blue-100 text-sm leading-relaxed">
                Every ticked box brings you one step closer to your goal. Don't worry about missed sessions,
                you can always complete them later in the history section. Keep going!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

