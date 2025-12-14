import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { FaBell, FaUserFriends, FaFire } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './NotificationDropdown.css';

const NotificationDropdown = () => {
    const { notifications, unreadCount, markRead, markAllRead, removeNotification, refreshNotifications } = useNotification();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Friends');

    // Grouping Logic
    const groupedNotifications = {
        'Friends': [],
        'Streak Related': []
    };

    notifications.forEach(notif => {
        if (['FRIEND_REQUEST', 'FRIEND_ACCEPTED'].includes(notif.notificationType)) {
            groupedNotifications['Friends'].push(notif);
        } else {
            groupedNotifications['Streak Related'].push(notif);
        }
    });

    const isClickable = (type) => {
        const clickableTypes = ['FRIEND_REQUEST', 'FRIEND_ACCEPTED'];
        return clickableTypes.includes(type);
    };

    const handleNotificationClick = async (notification) => {
        if (!isClickable(notification.notificationType)) return;

        if (!notification.isRead) {
            await markRead(notification.notificationId);
        }

        const { notificationType, senderId } = notification;
        setIsOpen(false);

        switch (notificationType) {
            case 'FRIEND_REQUEST':
            case 'FRIEND_ACCEPTED':
                navigate(`/profile/${senderId}`);
                break;
            default:
                console.warn('Click handled but no redirect defined.');
        }
    };

    const toggleDropdown = async () => {
        const newIsOpen = !isOpen;
        setIsOpen(newIsOpen);
        if (newIsOpen) {
            refreshNotifications();
            // Mark all as read when opening dropdown
            if (unreadCount > 0) {
                markAllRead();
            }
        }
    };

    const renderNotificationItem = (notif) => {
        const itemClasses = `dropdown-item d-flex align-items-start p-3 border-bottom notification-item ${notif.isRead ? 'read text-muted' : ''} ${!isClickable(notif.notificationType) ? 'not-clickable' : ''}`;

        return (
            <li key={notif.notificationId} className="position-relative">
                <button
                    className={itemClasses}
                    onClick={() => handleNotificationClick(notif)}
                >
                    {notif.senderProfileImage && (
                        <img
                            src={notif.senderProfileImage}
                            alt="User"
                            className="rounded-circle me-2 notification-profile-img"
                            width="32"
                            height="32"
                        />
                    )}
                    <div className="flex-grow-1 header-text">
                        <p className="mb-1 small fw-semibold notification-message">{notif.message}</p>
                        <small className="text-secondary notification-time">
                            {new Date(notif.createdAt).toLocaleString()}
                        </small>
                    </div>
                    {!notif.isRead && (
                        <span className="rounded-circle p-1 ms-1 align-self-center notification-unread-dot"></span>
                    )}
                </button>
                <button
                    className="btn btn-sm text-danger position-absolute top-0 end-0 mt-1 me-1 p-0 border-0 bg-transparent notification-delete-btn"
                    onClick={(e) => removeNotification(notif.notificationId, e)}
                    title="Delete notification"
                >
                    &times;
                </button>
            </li>
        );
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && !event.target.closest('.dropdown')) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            {isOpen && <div className="notification-backdrop" onClick={() => setIsOpen(false)} />}
            <div className="dropdown notification-dropdown">
                <button
                    className="btn btn-link position-relative text-decoration-none notification-bell-btn"
                    type="button"
                    id="notificationDropdown"
                    aria-expanded={isOpen}
                    onClick={toggleDropdown}
                >
                    <FaBell size={24} />
                    {unreadCount > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle rounded-circle d-block notification-unread-badge">
                            <span className="visually-hidden">unread messages</span>
                        </span>
                    )}
                </button>

                <div
                    className={`dropdown-menu dropdown-menu-end p-0 notification-menu ${isOpen ? 'show' : ''}`}
                    aria-labelledby="notificationDropdown"
                >
                    {/* Header */}
                    <div className="p-3 border-bottom d-flex justify-content-between align-items-center notification-header">
                        <h6 className="m-0 fw-bold notification-header-title">Notifications</h6>
                    </div>

                    {/* Tabs */}
                    {notifications.length > 0 && (
                        <div className="d-flex text-center border-bottom notification-tabs">
                            {Object.keys(groupedNotifications).map((tab) => {
                                const hasUnread = groupedNotifications[tab].some(n => !n.isRead);
                                return (
                                    <div
                                        key={tab}
                                        className={`flex-fill py-3 position-relative notification-tab ${activeTab === tab ? 'active border-bottom border-3' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                                        title={tab}
                                    >
                                        {tab === 'Friends' && <FaUserFriends size={20} />}
                                        {tab === 'Streak Related' && <FaFire size={20} />}

                                        {hasUnread && (
                                            <span className="position-absolute rounded-circle notification-tab-indicator"></span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Content */}
                    <ul className="list-unstyled m-0 notification-list">
                        {notifications.length === 0 ? (
                            <li className="p-4 text-center text-muted">No notifications</li>
                        ) : (
                            groupedNotifications[activeTab].length === 0 ? (
                                <li className="p-4 text-center text-muted">No notifications in this section</li>
                            ) : (
                                groupedNotifications[activeTab].map(renderNotificationItem)
                            )
                        )}
                    </ul>
                </div>
            </div>
        </>
    );
};

export default NotificationDropdown;
