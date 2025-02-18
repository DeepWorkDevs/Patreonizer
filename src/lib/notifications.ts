import { supabase } from './supabase';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}

export async function createNotification(userId: string, data: NotificationData) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: userId,
        title: data.title,
        message: data.message,
        type: data.type,
        link: data.link,
        read: false
      }]);

    if (error) throw error;
  } catch (err) {
    console.error('Error creating notification:', err);
    throw err;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (err) {
    console.error('Error marking notification as read:', err);
    throw err;
  }
}

export async function markAllNotificationsAsRead(userId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) throw error;
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
    throw err;
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  } catch (err) {
    console.error('Error deleting notification:', err);
    throw err;
  }
}