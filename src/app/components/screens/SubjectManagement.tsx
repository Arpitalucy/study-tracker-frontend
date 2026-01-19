import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Checkbox } from '../ui/checkbox';
import { ArrowLeft, Plus, BookOpen, Trash2, Calendar, GraduationCap, Target, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../api/api';

interface Goal {
  id: string;
  title: string;
  type: 'MONTHLY' | 'EXAM';
  details: any;
}

interface Schedule {
  days: string[];
  time: string;
  duration: number; // in hours
}

interface Subject {
  id: string;
  goalId: string;
  name: string;
  color: string;
  trackingMode: 'SCHEDULE'; // Simplified to fixed value for now
  schedule?: Schedule;
  // Stats
  totalChapters: number;
  completedChapters: number;
  totalStudyHours: number;
  totalTargetHours?: number; // New field
}

export default function SubjectManagement() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Dialog States
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isSubjectDialogOpen, setIsSubjectDialogOpen] = useState(false);

  // Form States
  const [goalStep, setGoalStep] = useState<'type' | 'details'>('type');
  const [goalType, setGoalType] = useState<'MONTHLY' | 'EXAM' | null>(null);
  const [goalFormData, setGoalFormData] = useState({
    month: '',
    examName: '',
    startDate: '',
    examDate: ''
  });

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [subjectFormData, setSubjectFormData] = useState({
    goalId: '',
    name: '',
    color: '#3B82F6',
    trackingMode: 'SCHEDULE' as 'SCHEDULE',
    scheduleDays: [] as string[],
    scheduleTime: '',
    scheduleDuration: '',
    totalTargetHours: '' // New field
  });

  const colors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
  ];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
        if (err.message.includes('401')) {
          navigate('/login');
        }
        toast.error("Failed to fetch data");
      }
    };
    fetchData();
  }, [navigate]);

  const handleCreateGoal = async () => {
    if (goalType === 'MONTHLY' && !goalFormData.month) {
      toast.error("Please select a month");
      return;
    }
    if (goalType === 'EXAM' && (!goalFormData.examName || !goalFormData.examDate)) {
      toast.error("Please fill in exam details");
      return;
    }

    try {
      const newGoal: Goal = {
        id: Date.now().toString(),
        title: goalType === 'MONTHLY' ? `${goalFormData.month} Study Goal` : goalFormData.examName,
        type: goalType!,
        details: goalType === 'MONTHLY' ? { month: goalFormData.month } : { ...goalFormData }
      };

      const savedGoal = await api.createGoal(newGoal);
      setGoals([...goals, savedGoal]);
      toast.success("Goal created successfully!");
      setIsGoalDialogOpen(false);
      resetGoalForm();

      setSubjectFormData(prev => ({ ...prev, goalId: savedGoal.id }));
      setTimeout(() => setIsSubjectDialogOpen(true), 100);
    } catch (err: any) {
      toast.error(err.message || "Failed to create goal");
    }
  };

  const resetGoalForm = () => {
    setGoalStep('type');
    setGoalType(null);
    setGoalFormData({ month: '', examName: '', startDate: '', examDate: '' });
  };

  const toggleDay = (day: string) => {
    if (subjectFormData.scheduleDays.includes(day)) {
      setSubjectFormData(prev => ({ ...prev, scheduleDays: prev.scheduleDays.filter(d => d !== day) }));
    } else {
      setSubjectFormData(prev => ({ ...prev, scheduleDays: [...prev.scheduleDays, day] }));
    }
  };

  const resetSubjectForm = () => {
    setEditingSubjectId(null);
    setSubjectFormData({
      goalId: '', name: '', color: '#3B82F6',
      trackingMode: 'SCHEDULE',
      scheduleDays: [], scheduleTime: '', scheduleDuration: '',
      totalTargetHours: ''
    });
  };

  const handleEditClick = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectFormData({
      goalId: subject.goalId,
      name: subject.name,
      color: subject.color,
      trackingMode: 'SCHEDULE',
      scheduleDays: subject.schedule?.days || [],
      scheduleTime: subject.schedule?.time || '',
      scheduleDuration: subject.schedule?.duration?.toString() || '',
      totalTargetHours: subject.totalTargetHours?.toString() || ''
    });
    setIsSubjectDialogOpen(true);
  };

  const handleAddOrUpdateSubject = async () => {
    if (!subjectFormData.goalId) {
      toast.error("Please select a goal/target");
      return;
    }
    if (!subjectFormData.name) {
      toast.error("Please enter a subject name");
      return;
    }

    if (subjectFormData.scheduleDays.length === 0 || !subjectFormData.scheduleTime || !subjectFormData.scheduleDuration) {
      toast.error("Please fill in all schedule fields");
      return;
    }

    const schedule: Schedule = {
      days: subjectFormData.scheduleDays,
      time: subjectFormData.scheduleTime,
      duration: parseFloat(subjectFormData.scheduleDuration)
    };

    const timeToMinutes = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const newStart = timeToMinutes(schedule.time);
    const newEnd = newStart + (schedule.duration * 60);

    const conflict = subjects.find(s => {
      if (editingSubjectId && s.id === editingSubjectId) return false;
      if (!s.schedule) return false;
      const commonDays = s.schedule.days.filter(d => schedule.days.includes(d));
      if (commonDays.length === 0) return false;
      const sStart = timeToMinutes(s.schedule.time);
      const sEnd = sStart + (s.schedule.duration * 60);
      return (newStart < sEnd) && (newEnd > sStart);
    });

    if (conflict) {
      const parentGoal = goals.find(g => g.id === conflict.goalId);
      toast.error(`you already have fixed plan to study for the ${conflict.name} subject in ${parentGoal?.title || 'this goal'}`);
      return;
    }

    try {
      const subjectData: any = {
        id: editingSubjectId || Date.now().toString(),
        goalId: subjectFormData.goalId,
        name: subjectFormData.name,
        color: subjectFormData.color,
        trackingMode: 'SCHEDULE',
        schedule: schedule,
        totalStudyHours: editingSubjectId ? subjects.find(s => s.id === editingSubjectId)?.totalStudyHours : 0,
        totalTargetHours: subjectFormData.totalTargetHours ? parseFloat(subjectFormData.totalTargetHours) : undefined
      };

      const savedSubject = await api.saveSubject(subjectData);

      if (editingSubjectId) {
        setSubjects(subjects.map(s => s.id === editingSubjectId ? savedSubject : s));
        toast.success("Subject updated successfully!");
      } else {
        setSubjects([...subjects, savedSubject]);
        toast.success("Subject added successfully!");
      }

      setIsSubjectDialogOpen(false);
      resetSubjectForm();
    } catch (err: any) {
      toast.error(err.message || "Failed to save subject");
    }
  };

  const handleDeleteSubject = async (id: string) => {
    try {
      await api.deleteSubject(id);
      setSubjects(subjects.filter(s => s.id !== id));
      toast.success("Subject deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete subject");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm("Delete this goal and all its subjects?")) {
      try {
        await api.deleteGoal(id);
        setGoals(goals.filter(g => g.id !== id));
        setSubjects(subjects.filter(s => s.goalId !== id));
        toast.success("Goal deleted");
      } catch (err: any) {
        toast.error(err.message || "Failed to delete goal");
      }
    }
  };

  return (
    <div className="p-0 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="dark:text-slate-400 dark:hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl text-gray-900 dark:text-white">Subject Management</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsGoalDialogOpen(true)} className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                <Target className="w-4 h-4 mr-2" />
                Add Goal
              </Button>
              <Button onClick={() => { resetSubjectForm(); setIsSubjectDialogOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {goals.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800">
            <Target className="w-16 h-16 text-gray-300 dark:text-slate-800 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-900 dark:text-white">No Goals Set</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6">Create a Monthly Study Goal or Exam Target to get started.</p>
            <Button onClick={() => setIsGoalDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Goal
            </Button>
          </Card>
        ) : (
          goals.map(goal => (
            <div key={goal.id}>
              <div className="flex items-center justify-between mb-4 border-b dark:border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  {goal.type === 'MONTHLY' ? (
                    <Calendar className="w-5 h-5 text-blue-500" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-green-500" />
                  )}
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">{goal.title}</h2>
                  <span className="text-xs font-medium px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400">
                    {goal.type === 'MONTHLY' ? 'Monthly Goal' : 'Exam Target'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteGoal(goal.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10">
                  <Trash2 className="w-4 h-4" />
                  Delete Goal
                </Button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.filter(s => s.goalId === goal.id).length === 0 ? (
                  <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-dashed dark:border-slate-800 text-gray-500 dark:text-slate-400">
                    No subjects in this goal yet.
                    <Button variant="link" className="text-blue-600 dark:text-blue-400" onClick={() => {
                      setSubjectFormData(prev => ({ ...prev, goalId: goal.id }));
                      setIsSubjectDialogOpen(true);
                    }}>Add Subject</Button>
                  </div>
                ) : (
                  subjects.filter(s => s.goalId === goal.id).map(subject => (
                    <Card key={subject.id} className="p-6 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:shadow-lg transition-all group relative overflow-hidden">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                            style={{ backgroundColor: subject.color + '20' }}
                          >
                            <BookOpen className="w-6 h-6" style={{ color: subject.color }} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                            <div className="flex gap-2">
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 flex items-center gap-1 font-bold uppercase tracking-wider">
                                <Clock className="w-3 h-3" />
                                Recurring
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            onClick={() => handleEditClick(subject)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {subject.schedule ? (
                          <div className="text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-lg border dark:border-slate-800/50">
                            <p className="font-semibold text-gray-900 dark:text-slate-200">{subject.schedule.time} • {subject.schedule.duration}h session</p>
                            <p className="text-xs mt-1 font-medium">{subject.schedule.days.join(', ')}</p>
                          </div>
                        ) : null}

                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-tighter text-gray-500 dark:text-slate-500">
                            <span>Study Progress</span>
                            <span className="text-gray-900 dark:text-slate-200 font-mono">
                              {subject.totalStudyHours}h / {subject.totalTargetHours || '?'}h
                            </span>
                          </div>
                          {subject.totalTargetHours ? (
                            <div className="h-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full transition-all duration-700 ease-out"
                                style={{
                                  width: `${Math.min(((subject.totalStudyHours || 0) / subject.totalTargetHours) * 100, 100)}%`,
                                  backgroundColor: subject.color
                                }}
                              />
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-400 dark:text-slate-600 italic">No target set for this subject</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ))
        )}

        {/* Create Goal Dialog */}
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="dark:text-white">{goalStep === 'type' ? 'Choose Goal Type' : 'Goal Details'}</DialogTitle>
            </DialogHeader>
            {goalStep === 'type' ? (
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div onClick={() => { setGoalType('MONTHLY'); setGoalStep('details'); }} className="p-4 border dark:border-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 cursor-pointer text-center space-y-2 transition-all">
                  <Calendar className="w-8 h-8 mx-auto text-blue-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Goal</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Plan for a specific month</p>
                </div>
                <div onClick={() => { setGoalType('EXAM'); setGoalStep('details'); }} className="p-4 border dark:border-slate-800 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800 cursor-pointer text-center space-y-2 transition-all">
                  <GraduationCap className="w-8 h-8 mx-auto text-green-500" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">Exam Target</h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">Prepare for an upcoming exam</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-4">
                {goalType === 'MONTHLY' ? (
                  <div>
                    <Label className="dark:text-slate-300">Select Month</Label>
                    <Select value={goalFormData.month} onValueChange={(v) => setGoalFormData({ ...goalFormData, month: v })}>
                      <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"><SelectValue placeholder="Choose Month" /></SelectTrigger>
                      <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                        {months.map(m => <SelectItem key={m} value={m} className="dark:text-white">{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="dark:text-slate-300">Exam Name</Label>
                      <Input value={goalFormData.examName} onChange={e => setGoalFormData({ ...goalFormData, examName: e.target.value })} placeholder="e.g. Finals 2026" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                    </div>
                    <div>
                      <Label className="dark:text-slate-300">Exam Date</Label>
                      <Input type="date" value={goalFormData.examDate} onChange={e => setGoalFormData({ ...goalFormData, examDate: e.target.value })} className="dark:bg-slate-800 dark:border-slate-700 dark:text-white [color-scheme:dark]" />
                    </div>
                  </>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800" onClick={() => setGoalStep('type')}>Back</Button>
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateGoal}>Create Goal</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Add Subject Dialog */}
        <Dialog open={isSubjectDialogOpen} onOpenChange={(open) => {
          setIsSubjectDialogOpen(open);
          if (!open) resetSubjectForm();
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto dark:bg-slate-900 dark:border-slate-800">
            <DialogHeader><DialogTitle className="dark:text-white">{editingSubjectId ? 'Edit Subject' : 'Add Subject'}</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label className="dark:text-slate-300">Select Goal / Target</Label>
                <Select value={subjectFormData.goalId} onValueChange={(v) => {
                  if (v === 'NEW') {
                    setIsSubjectDialogOpen(false);
                    setIsGoalDialogOpen(true);
                  } else {
                    setSubjectFormData({ ...subjectFormData, goalId: v });
                  }
                }}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"><SelectValue placeholder="Choose a Goal" /></SelectTrigger>
                  <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                    {goals.map(g => <SelectItem key={g.id} value={g.id} className="dark:text-white">{g.title}</SelectItem>)}
                    <SelectItem value="NEW" className="text-blue-600 dark:text-blue-400 font-bold">+ Create New Goal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {subjectFormData.goalId && subjectFormData.goalId !== 'NEW' && (
                <>
                  <div>
                    <Label className="dark:text-slate-300">Subject Name</Label>
                    <Input value={subjectFormData.name} onChange={e => setSubjectFormData({ ...subjectFormData, name: e.target.value })} placeholder="e.g. Physics" className="dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border dark:border-slate-700 space-y-4">
                    <div>
                      <Label className="text-xs text-gray-500 dark:text-slate-400 mb-2 block font-bold uppercase tracking-widest">Notification Days</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {weekDays.map(day => (
                          <div
                            key={day}
                            onClick={() => toggleDay(day)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${subjectFormData.scheduleDays.includes(day)
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                              : 'bg-white dark:bg-slate-900 border dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                              }`}
                          >
                            {day.charAt(0)}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-slate-400 mb-1.5 block font-bold">Start Time</Label>
                        <Input type="time" value={subjectFormData.scheduleTime} onChange={e => setSubjectFormData({ ...subjectFormData, scheduleTime: e.target.value })} className="dark:bg-slate-900 dark:border-slate-700 dark:text-white [color-scheme:dark]" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 dark:text-slate-400 mb-1.5 block font-bold">Duration (h)</Label>
                        <Input type="number" step="0.5" placeholder="e.g. 2" value={subjectFormData.scheduleDuration} onChange={e => setSubjectFormData({ ...subjectFormData, scheduleDuration: e.target.value })} className="dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-500 dark:text-slate-400 mb-1.5 block font-bold">Total Target Hours</Label>
                      <Input type="number" step="1" placeholder="e.g. 50" value={subjectFormData.totalTargetHours} onChange={e => setSubjectFormData({ ...subjectFormData, totalTargetHours: e.target.value })} className="dark:bg-slate-900 dark:border-slate-700 dark:text-white" />
                      <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1.5 font-medium leading-tight">Used to calculate overall progress and completion percentage.</p>
                    </div>
                  </div>

                  <div>
                    <Label className="dark:text-slate-300">Color Tag</Label>
                    <div className="flex gap-2.5 mt-2.5">
                      {colors.map(c => (
                        <div
                          key={c.value}
                          className={`w-7 h-7 rounded-full cursor-pointer border-2 transition-transform hover:scale-125 ${subjectFormData.color === c.value ? 'border-gray-900 dark:border-white shadow-lg' : 'border-transparent opacity-60'}`}
                          style={{ backgroundColor: c.value }}
                          onClick={() => setSubjectFormData({ ...subjectFormData, color: c.value })}
                        />
                      ))}
                    </div>
                  </div>
                  <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-900/20" onClick={handleAddOrUpdateSubject}>
                    {editingSubjectId ? 'Save Changes' : 'Create Subject'}
                  </Button>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}