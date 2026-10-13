import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { login, register, quickLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Name is required');
        await register(name.trim(), email.trim(), password);
      } else {
        await login(email.trim(), password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (role: 'admin' | 'moderator' | 'commuter' | 'demo') => {
    setLoading(true);
    setError(null);
    try {
      await quickLogin(role);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-panel border border-panel-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-panel-border bg-panel-subtle/40">
          <div>
            <h2 className="text-base font-bold text-white">
              {isRegister ? 'Create RouteX Account' : 'Sign in to RouteX AI'}
            </h2>
            <p className="text-xs text-slate-400">
              {isRegister ? 'Join our community road intelligence network' : 'Access full road intelligence and traffic controls'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-panel-subtle transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="p-4 bg-sky-950/30 border-b border-panel-border">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-accent-primary mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Instant Demo Logins (1-Click Evaluation):</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuick('admin')}
              className="px-2.5 py-1.5 rounded-lg bg-panel border border-panel-border hover:border-purple-500/60 text-slate-200 hover:text-purple-300 transition-all text-left flex items-center justify-between"
            >
              <span className="font-semibold">Administrator</span>
              <span className="text-[10px] text-purple-400 font-mono">Full</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('moderator')}
              className="px-2.5 py-1.5 rounded-lg bg-panel border border-panel-border hover:border-blue-500/60 text-slate-200 hover:text-blue-300 transition-all text-left flex items-center justify-between"
            >
              <span className="font-semibold">Traffic Ops</span>
              <span className="text-[10px] text-blue-400 font-mono">Verify</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('commuter')}
              className="px-2.5 py-1.5 rounded-lg bg-panel border border-panel-border hover:border-emerald-500/60 text-slate-200 hover:text-emerald-300 transition-all text-left flex items-center justify-between"
            >
              <span className="font-semibold">Commuter</span>
              <span className="text-[10px] text-emerald-400 font-mono">User</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuick('demo')}
              className="px-2.5 py-1.5 rounded-lg bg-panel border border-panel-border hover:border-amber-500/60 text-slate-200 hover:text-amber-300 transition-all text-left flex items-center justify-between"
            >
              <span className="font-semibold">Demo Evaluator</span>
              <span className="text-[10px] text-amber-400 font-mono">Guest</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300">
              {error}
            </div>
          )}

          {isRegister && (
            <div>
              <label className="block font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Anil Biradar"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-panel-subtle border border-panel-border text-white placeholder-slate-500 focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-xs font-bold bg-accent-primary hover:bg-accent-hover text-black transition-all shadow-md shadow-accent-primary/20 flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'Processing...' : isRegister ? 'Register Account' : 'Sign In'}</span>
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setError(null);
              }}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
