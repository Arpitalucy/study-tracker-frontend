import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { BookOpen, GraduationCap, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface GoalSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export default function GoalSelectionDialog({ isOpen, onClose, onComplete }: GoalSelectionDialogProps) {
  const [step, setStep] = useState<'goal' | 'details'>('goal');
  const [selectedGoal, setSelectedGoal] = useState<'monthly' | 'exam' | null>(null);
  const [examDetails, setExamDetails] = useState({
    examName: '',
    startDate: '',
    examDate: ''
  });
  const [monthlyDetails, setMonthlyDetails] = useState({
    month: ''
  });

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleGoalSelect = (goal: 'monthly' | 'exam') => {
    setSelectedGoal(goal);
    setStep('details');
  };

  const handleBack = () => {
    setStep('goal');
    setSelectedGoal(null);
  };

  const handleComplete = () => {
    if (selectedGoal === 'exam') {
      if (!examDetails.examName || !examDetails.startDate || !examDetails.examDate) {
        toast.error('Please fill in all fields');
        return;
      }
      localStorage.setItem('studyTracker_goal', 'exam');
      localStorage.setItem('studyTracker_examDetails', JSON.stringify(examDetails));
    } else {
      if (!monthlyDetails.month) {
        toast.error('Please select a month');
        return;
      }
      localStorage.setItem('studyTracker_goal', 'monthly');
      localStorage.setItem('studyTracker_monthlyDetails', JSON.stringify(monthlyDetails));
    }

    toast.success('Goal set successfully! Now add your subjects.');
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        {step === 'goal' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">What is your study goal?</DialogTitle>
              <p className="text-center text-gray-600 mt-2">Choose your focus to get personalized tracking</p>
            </DialogHeader>

            <div className="grid md:grid-cols-2 gap-4 py-6">
              <Card 
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedGoal === 'monthly' ? 'ring-2 ring-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleGoalSelect('monthly')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl mb-2 text-gray-900">Monthly Study</h3>
                  <p className="text-gray-600 text-sm">Build consistent study habits month by month</p>
                </div>
              </Card>

              <Card 
                className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                  selectedGoal === 'exam' ? 'ring-2 ring-blue-600 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleGoalSelect('exam')}
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                    <GraduationCap className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl mb-2 text-gray-900">Exam Preparation</h3>
                  <p className="text-gray-600 text-sm">Stay on track for your upcoming exams</p>
                </div>
              </Card>
            </div>
          </>
        ) : selectedGoal === 'exam' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Exam Details</DialogTitle>
              <p className="text-gray-600 mt-2">Set up your exam preparation timeline</p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="examName">Exam Name</Label>
                <Input
                  id="examName"
                  placeholder="e.g., Final Semester Exam"
                  value={examDetails.examName}
                  onChange={(e) => setExamDetails({...examDetails, examName: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={examDetails.startDate}
                  onChange={(e) => setExamDetails({...examDetails, startDate: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="examDate">Exam Date</Label>
                <Input
                  id="examDate"
                  type="date"
                  value={examDetails.examDate}
                  min={examDetails.startDate}
                  onChange={(e) => setExamDetails({...examDetails, examDate: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Complete & Add Subjects
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">Monthly Plan</DialogTitle>
              <p className="text-gray-600 mt-2">Select the month you want to focus on</p>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="month">Select Month</Label>
                <Select value={monthlyDetails.month} onValueChange={(value) => setMonthlyDetails({month: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a month" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month} value={month}>
                        {month} 2026
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleComplete} className="flex-1">
                  Complete & Add Subjects
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}