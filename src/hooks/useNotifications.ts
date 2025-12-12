import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ScheduledReminder {
  id: string;
  medicineName: string;
  scheduledTime: Date;
  timeoutId?: NodeJS.Timeout;
  followUpTimeoutId?: NodeJS.Timeout;
}

export const useNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [scheduledReminders, setScheduledReminders] = useState<ScheduledReminder[]>([]);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast({
        title: 'Notifications not supported',
        description: 'Your browser does not support notifications.',
        variant: 'destructive',
      });
      return false;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === 'granted') {
      toast({
        title: 'Notifications enabled! 🔔',
        description: 'You will now receive medicine reminders.',
      });
      return true;
    } else {
      toast({
        title: 'Notifications blocked',
        description: 'Please enable notifications in your browser settings.',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const sendNotification = useCallback((title: string, body: string, options?: NotificationOptions) => {
    if (permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'medicine-reminder',
        requireInteraction: true,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
    return null;
  }, [permission]);

  const scheduleReminder = useCallback((
    id: string,
    medicineName: string,
    scheduledTime: Date,
    onIgnored?: () => void
  ) => {
    const now = new Date();
    const delay = scheduledTime.getTime() - now.getTime();

    if (delay < 0) return; // Don't schedule past reminders

    // Main reminder
    const timeoutId = setTimeout(() => {
      sendNotification(
        '💊 Medicine Reminder',
        `Time to take ${medicineName}!`,
        { tag: `reminder-${id}` }
      );

      // Toast fallback for when app is open
      toast({
        title: '💊 Medicine Reminder',
        description: `Time to take ${medicineName}!`,
        duration: 10000,
      });

      // Follow-up reminder after 10 minutes if ignored
      const followUpTimeoutId = setTimeout(() => {
        sendNotification(
          '⏰ Follow-up Reminder',
          `Don't forget to take ${medicineName}!`,
          { tag: `followup-${id}` }
        );

        toast({
          title: '⏰ Follow-up Reminder',
          description: `Don't forget to take ${medicineName}!`,
          variant: 'destructive',
          duration: 15000,
        });

        onIgnored?.();
      }, 10 * 60 * 1000); // 10 minutes

      setScheduledReminders(prev => prev.map(r => 
        r.id === id ? { ...r, followUpTimeoutId } : r
      ));
    }, delay);

    setScheduledReminders(prev => [...prev, {
      id,
      medicineName,
      scheduledTime,
      timeoutId,
    }]);

    return id;
  }, [sendNotification]);

  const cancelReminder = useCallback((id: string) => {
    setScheduledReminders(prev => {
      const reminder = prev.find(r => r.id === id);
      if (reminder) {
        if (reminder.timeoutId) clearTimeout(reminder.timeoutId);
        if (reminder.followUpTimeoutId) clearTimeout(reminder.followUpTimeoutId);
      }
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const cancelFollowUp = useCallback((id: string) => {
    setScheduledReminders(prev => prev.map(r => {
      if (r.id === id && r.followUpTimeoutId) {
        clearTimeout(r.followUpTimeoutId);
        return { ...r, followUpTimeoutId: undefined };
      }
      return r;
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      scheduledReminders.forEach(reminder => {
        if (reminder.timeoutId) clearTimeout(reminder.timeoutId);
        if (reminder.followUpTimeoutId) clearTimeout(reminder.followUpTimeoutId);
      });
    };
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder,
    cancelReminder,
    cancelFollowUp,
    isSupported: 'Notification' in window,
  };
};
