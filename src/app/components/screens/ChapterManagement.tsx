import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ArrowLeft, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Chapter {
  id: string;
  name: string;
  targetDate: string;
  targetTime: string;
  estimatedDuration: string;
  completed: boolean;
  startedAt?: string;
}
import { api } from '../../api/api';

export default function ChapterManagement() {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const [subjectName, setSubjectName] = useState('');
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    targetDate: '',
    targetTime: '',
    estimatedDuration: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!subjectId) return;

        // Load chapters
        const fetchedChapters = await api.getChapters(subjectId);
        setChapters(fetchedChapters);

        // Load subject details
        const subjects = await api.getSubjects();
        const subject = subjects.find((s: any) => s.id === subjectId);
        if (subject) {
          setSubjectName(subject.name);
        }
      } catch (err: any) {
        toast.error("Failed to fetch chapter data");
      }
    };
    fetchData();
  }, [subjectId]);

  const handleAddChapter = async () => {
    if (!formData.name || !formData.targetDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const newChapter: Chapter = {
        id: Date.now().toString(),
        subject_id: subjectId!, // backend expects subject_id or subjectId based on mapper
        ...formData,
        completed: false
      } as any;

      // The schema expects subjectId
      const chapterToSave = {
        ...newChapter,
        subjectId: subjectId
      };

      await api.saveChapter(chapterToSave);

      // Update local state by fetching fresh list
      const updatedChapters = await api.getChapters(subjectId!);
      setChapters(updatedChapters);

      // Update subject's total chapters if needed (optional if backend derives it, but frontend uses it)
      // For now, the backend subject doesn't have totalChapters field explicitly, 
      // but if it did, we'd update it here.

      setFormData({ name: '', targetDate: '', targetTime: '', estimatedDuration: '' });
      setIsDialogOpen(false);
      toast.success('Chapter added successfully!');
    } catch (err: any) {
      toast.error("Failed to add chapter");
    }
  };

  const handleToggleComplete = async (chapterId: string) => {
    try {
      const chapter = chapters.find(c => c.id === chapterId);
      if (!chapter) return;

      const updatedChapter = { ...chapter, completed: !chapter.completed, subjectId };
      await api.saveChapter(updatedChapter);

      // Update local state
      const updatedChapters = chapters.map(c =>
        c.id === chapterId ? { ...c, completed: !c.completed } : c
      );
      setChapters(updatedChapters);

      const completedCount = updatedChapters.filter(c => c.completed).length;
      const progress = Math.round((completedCount / updatedChapters.length) * 100);

      // Show progress notifications
      if (progress === 50 || progress === 70 || progress === 100) {
        const messages = {
          50: '🎉 Congratulations! You have completed 50% of ' + subjectName,
          70: '🔥 Amazing! 70% completed for ' + subjectName,
          100: '🏆 Subject completed – 100%! Well done on ' + subjectName
        };
        toast.success(messages[progress as keyof typeof messages]);
      }
    } catch (err: any) {
      toast.error("Failed to update chapter status");
    }
  };

  const getChapterStatus = (chapter: Chapter) => {
    if (chapter.completed) return 'completed';

    const targetDateTime = new Date(`${chapter.targetDate}T${chapter.targetTime || '00:00'}`);
    const now = new Date();
    const estimatedMinutes = parseInt(chapter.estimatedDuration) || 60;
    const doubleTime = new Date(targetDateTime.getTime() + (estimatedMinutes * 2 * 60000));

    if (now > doubleTime) return 'overdue';
    if (now > targetDateTime) return 'due';
    return 'upcoming';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-900 shadow-sm border-b dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/subjects')} className="dark:text-slate-400 dark:hover:text-white">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl text-gray-900 dark:text-white">{subjectName}</h1>
                <p className="text-sm text-gray-600 dark:text-slate-400">{chapters.length} chapters • {chapters.filter(c => c.completed).length} completed</p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Chapter
                </Button>
              </DialogTrigger>
              <DialogContent className="dark:bg-slate-900 dark:border-slate-800">
                <DialogHeader>
                  <DialogTitle className="dark:text-white">Add New Chapter</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="name" className="dark:text-slate-300">Chapter Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Chapter 1: Introduction"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetDate" className="dark:text-slate-300">Target Date</Label>
                    <Input
                      id="targetDate"
                      type="date"
                      value={formData.targetDate}
                      onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="targetTime" className="dark:text-slate-300">Target Time</Label>
                    <Input
                      id="targetTime"
                      type="time"
                      value={formData.targetTime}
                      onChange={(e) => setFormData({ ...formData, targetTime: e.target.value })}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white [color-scheme:dark]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration" className="dark:text-slate-300">Estimated Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="e.g., 60"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                      className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                    />
                  </div>

                  <Button onClick={handleAddChapter} className="w-full bg-blue-600 hover:bg-blue-700">
                    Add Chapter
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {chapters.length === 0 ? (
          <Card className="p-12 text-center bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800">
            <Clock className="w-16 h-16 text-gray-300 dark:text-slate-800 mx-auto mb-4" />
            <h3 className="text-xl mb-2 text-gray-900 dark:text-white">No chapters yet</h3>
            <p className="text-gray-600 dark:text-slate-400 mb-6">Start by adding chapters to track your progress</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Chapter
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {chapters.map((chapter) => {
              const status = getChapterStatus(chapter);

              return (
                <Card
                  key={chapter.id}
                  className={`p-4 transition-all ${chapter.completed ? 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800/50' :
                      status === 'overdue' ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50' :
                        status === 'due' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800/50' :
                          'bg-white dark:bg-slate-900 dark:border-slate-800'
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={chapter.completed}
                      onCheckedChange={() => handleToggleComplete(chapter.id)}
                      className="w-5 h-5 dark:border-slate-700 data-[state=checked]:bg-green-600"
                    />

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-lg font-medium ${chapter.completed ? 'line-through text-gray-500 dark:text-slate-500' : 'text-gray-900 dark:text-white'}`}>
                          {chapter.name}
                        </h3>
                        {status === 'completed' && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        )}
                        {status === 'overdue' && (
                          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600 dark:text-slate-400">
                        <span className="flex items-center gap-1.5">📅 {chapter.targetDate}</span>
                        {chapter.targetTime && <span className="flex items-center gap-1.5">🕐 {chapter.targetTime}</span>}
                        {chapter.estimatedDuration && <span className="flex items-center gap-1.5">⏱️ {chapter.estimatedDuration} min</span>}
                      </div>
                      {status === 'overdue' && !chapter.completed && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1 font-medium">
                          ⚠️ Overdue: You missed your planned study window.
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
