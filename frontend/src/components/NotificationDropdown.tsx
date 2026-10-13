import React from 'react';
import { Bell, Check, Clock, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { formatTimeAgo } from '../utils/formatters';

interface NotificationDropdownProps {
  onClose: () => void;
  onSelectIncident: (id?: number) => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose, onSelectIncident }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-panel border border-panel-border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 border-b border-panel-border bg-panel-subtle/50">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-accent-primary" />
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            Traffic Bulletins ({unreadCount} New)
          </h4>
        </div>
        <div className="flex items-center space-x-1.5">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="text-[11px] text-accent-primary hover:underline font-medium px-2 py-0.5 rounded"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-panel-border">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No active traffic notifications at this moment.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                if (!n.is_read) markAsRead(n.id);
                if (n.related_incident_id) onSelectIncident(n.related_incident_id);
              }}
              className={`p-3 text-left transition-colors cursor-pointer hover:bg-panel-subtle flex items-start space-x-3 ${
                !n.is_read ? 'bg-sky-950/20' : ''
              }`}
            >
              <div className="mt-0.5 p-1.5 rounded-lg bg-panel-subtle border border-panel-border flex-shrink-0">
                {n.notification_type === 'closure_alert' ? (
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-xs font-semibold truncate ${!n.is_read ? 'text-white' : 'text-slate-300'}`}>
                    {n.title}
                  </p>
                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-accent-primary flex-shrink-0 ml-2" />
                  )}
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                  {n.message}
                </p>
                <div className="flex items-center space-x-1 mt-1 text-[10px] text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(n.created_at)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-panel-border bg-panel-subtle/30 text-center text-[10px] text-slate-400">
        Simulated and recorded system traffic notifications
      </div>
    </div>
  );
};
