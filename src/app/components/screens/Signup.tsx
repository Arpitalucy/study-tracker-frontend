import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { BookOpen, Lock, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../api/api';

interface SignupProps {
  setIsAuthenticated: (value: boolean) => void;
}

export default function Signup({ setIsAuthenticated }: SignupProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      await api.signup({
        email: formData.email,
        password: formData.password
      });

      // After signup, we log them in to get the token
      const loginFormData = new FormData();
      loginFormData.append('username', formData.email);
      loginFormData.append('password', formData.password);

      const { access_token } = await api.login(loginFormData);
      localStorage.setItem('studyTracker_token', access_token);

      localStorage.setItem('studyTracker_auth', 'true');
      setIsAuthenticated(true);

      if ('Notification' in window) {
        Notification.requestPermission();
      }

      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 dark:bg-blue-600 rounded-[2rem] mb-6 shadow-xl shadow-blue-500/20 -rotate-3 hover:rotate-0 transition-transform duration-300">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-2 text-gray-900 dark:text-white tracking-tighter uppercase">Join now</h1>
          <p className="text-gray-500 dark:text-slate-400 font-medium">Start your elite study tracking journey</p>
        </div>

        <Card className="p-8 bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 shadow-2xl shadow-blue-500/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="dark:text-slate-300 font-bold text-xs uppercase tracking-widest mb-2 block">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white h-11"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="dark:text-slate-300 font-bold text-xs uppercase tracking-widest mb-2 block">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white h-11"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="dark:text-slate-300 font-bold text-xs uppercase tracking-widest mb-2 block">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white h-11"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword" className="dark:text-slate-300 font-bold text-xs uppercase tracking-widest mb-2 block">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-400 dark:text-slate-500" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10 dark:bg-slate-800 dark:border-slate-700 dark:text-white h-11"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-lg shadow-blue-500/20" size="lg">
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center bg-slate-50 dark:bg-slate-800/50 -mx-8 -mb-8 p-6 border-t dark:border-slate-800 rounded-b-xl">
            <p className="text-sm text-gray-600 dark:text-slate-400 font-medium">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
                Login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
