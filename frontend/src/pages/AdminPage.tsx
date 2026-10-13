import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Database,
  RotateCcw,
  CheckCircle2,
  FileText,
  AlertCircle,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { User, DataSourceLog, AuditLog } from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';

export const AdminPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [sources, setSources] = useState<DataSourceLog[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [u, s, a] = await Promise.all([
        api.getAllUsers(),
        api.getDataSources(),
        api.getAuditLogs(),
      ]);
      setUsers(u);
      setSources(s);
      setAuditLogs(a);
    } catch {
      // Handled
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const updated = await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleResetDemoData = async () => {
    if (!window.confirm('Reset all demonstration traffic incident records to clean baseline?')) return;
    try {
      const res = await api.resetDemoData();
      setResetMessage(res.message);
      await loadAdminData();
      setTimeout(() => setResetMessage(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to reset demo dataset');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              System Administration & Governance
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              ADMIN CONTROL
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage authenticated users, monitor data sources, review audit events, and manage demo datasets.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadAdminData}
            className="p-2.5 rounded-xl bg-panel border border-panel-border hover:border-slate-600 text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleResetDemoData}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-600/20 text-red-300 hover:bg-red-600/30 border border-red-500/40 transition-all flex items-center space-x-1.5 shadow"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Traffic Dataset</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* User Management Section */}
      <div className="rounded-2xl bg-panel border border-panel-border shadow-xl overflow-hidden">
        <div className="p-5 border-b border-panel-border flex items-center justify-between bg-panel-subtle/30">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-accent-primary" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Registered Platform Users ({users.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-panel-border text-slate-400 bg-panel-subtle/20 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Current Role</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-panel-border text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-panel-subtle/40 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{u.name}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono">{u.email}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800 uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{formatDate(u.created_at)}</td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      className="px-2.5 py-1 rounded-lg bg-panel-subtle border border-panel-border text-xs text-white focus:outline-none focus:border-accent-primary"
                    >
                      <option value="registered">Registered Commuter</option>
                      <option value="moderator">Traffic Moderator</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Data Sources and Sync Health */}
      <div className="rounded-2xl bg-panel border border-panel-border shadow-xl overflow-hidden">
        <div className="p-5 border-b border-panel-border flex items-center justify-between bg-panel-subtle/30">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Data Source Connections & Health
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          {sources.map((s) => (
            <div key={s.id} className="p-4 rounded-xl bg-panel-subtle border border-panel-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate">{s.source_name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {s.sync_status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Records managed: {s.record_count}</p>
              <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Last verified: {formatDate(s.last_sync_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log Stream */}
      <div className="rounded-2xl bg-panel border border-panel-border shadow-xl overflow-hidden">
        <div className="p-5 border-b border-panel-border flex items-center justify-between bg-panel-subtle/30">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Administrative & Operations Audit Log
            </h3>
          </div>
        </div>

        <div className="divide-y divide-panel-border max-h-72 overflow-y-auto text-xs">
          {auditLogs.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No audit logs recorded yet.</div>
          ) : (
            auditLogs.map((a) => (
              <div key={a.id} className="p-3.5 hover:bg-panel-subtle/40 transition-colors flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-accent-primary font-semibold">{a.action}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-white font-medium">{a.details}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Actor: {a.user_email || 'System'} | Entity: {a.entity_type} #{a.entity_id}
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono flex-shrink-0 ml-4">
                  {formatDate(a.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
