import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { notificationService } from '../services/notificationService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth(); // Get user from Auth Context
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const stompClientRef = useRef(null);
    const processedIds = useRef(new Set());
    const pollIntervalRef = useRef(null);

    // Use user.id if available, otherwise don't connect
    const userId = user?.id;

    useEffect(() => {
        if (!userId) return; // Don't fetch if not logged in

        fetchInitialData();
        connectWebSocket();
        
        // Add polling every 10 seconds to fetch latest notifications
        pollIntervalRef.current = setInterval(() => {
            fetchInitialData();
        }, 10000);

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.disconnect();
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [userId]); // Re-run when userId changes

    const fetchInitialData = async () => {
        try {
            const notifs = await notificationService.getNotifications();
            setNotifications(notifs);
            
            // Calculate unread count from notifications array instead of relying on API
            const unreadCountCalculated = notifs.filter(n => !n.isRead).length;
            setUnreadCount(unreadCountCalculated);

            // Sync processed IDs
            notifs.forEach(n => processedIds.current.add(n.notificationId));
        } catch (error) {
            console.error('Error fetching initial notification data:', error);
        }
    };

    const connectWebSocket = () => {
        // Prevent multiple connections
        if (stompClientRef.current && stompClientRef.current.connected) {
            return;
        }

        const socket = new SockJS('http://localhost:8080/ws');
        const client = Stomp.over(socket);

        // Disable debug logs to keep console clean
        client.debug = () => { };

        client.connect({}, () => {
            stompClientRef.current = client;

            client.subscribe(`/topic/user/${userId}`, (message) => {
                // Check if the message is a simpler string command first
                if (message.body === 'REFRESH_COMMAND') {
                    console.log('Received refresh command, syncing notifications...');
                    fetchInitialData();
                    return;
                }

                try {
                    const newNotification = JSON.parse(message.body);
                    // Also check if the object has a type of REFRESH_COMMAND
                    if (newNotification.notificationType === 'REFRESH_COMMAND') {
                        console.log('Received refresh command type, syncing notifications...');
                        fetchInitialData();
                        return;
                    }
                    handleNewNotification(newNotification);
                } catch (e) {
                    console.warn('Failed to parse notification message:', message.body);
                }
            });
        }, (error) => {
            console.error('WebSocket connection error:', error);
            // Optional: Implement reconnection logic here if needed
            setTimeout(connectWebSocket, 5000);
        });
    };

    const handleNewNotification = (notification) => {
        // Prevent duplicate processing using Ref (handles rapid updates and Strict Mode side-effects)
        if (processedIds.current.has(notification.notificationId)) {
            return;
        }
        processedIds.current.add(notification.notificationId);

        // Play a subtle sound
        try {
            const audio = new Audio('/notification-sound.mp3');
            audio.play().catch(e => console.log('Audio play failed', e));
        } catch (e) {
            console.log('Audio initialization failed', e);
        }

        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
    };

    const markRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => n.notificationId === id ? { ...n, isRead: true } : n)
            );
            // Decrement unread count if the notification was previously unread
            const notification = notifications.find(n => n.notificationId === id);
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    };

    const removeNotification = async (id, event) => {
        if (event) event.stopPropagation();
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.notificationId !== id));
            // Adjust unread count if we deleted an unread one
            const notification = notifications.find(n => n.notificationId === id);
            if (notification && !notification.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error deleting notification:', error);
            // Optimistically remove even if backend fails (or acts like it doesnt exist)
            setNotifications(prev => prev.filter(n => n.notificationId !== id));
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            markRead,
            markAllRead,
            removeNotification,
            refreshNotifications: fetchInitialData
        }}>
            {children}
        </NotificationContext.Provider>
    );
};
