import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { FaBell } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const NotificationDropdown = () => {
    const { notifications, unreadCount, markRead, markAllRead, removeNotification, refreshNotifications } = useNotification();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Friends'); // Default tab

    // Grouping Logic
    // Grouping Logic
    const groupedNotifications = {
        'Friends': [],
        'Streak Related': []
    };

    notifications.forEach(notif => {
        if (['FRIEND_REQUEST', 'FRIEND_ACCEPTED'].includes(notif.notificationType)) {
            groupedNotifications['Friends'].push(notif);
        } else {
            // Everything else (Streak, Comments, System) goes here
            groupedNotifications['Streak Related'].push(notif);
        }
    });

    const isClickable = (type) => {
        // Strict Redirection: Only Friends notifications are clickable
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
            // Auto-Read and Auto-Sync when opening
            refreshNotifications(); // Sync with backend to remove deleted notifications
            if (unreadCount > 0) {
                markAllRead();
            }
        }
    };

    const renderNotificationItem = (notif) => (
        <li key={notif.notificationId} className="position-relative">
            <button
                className={`dropdown-item d-flex align-items-start p-2 border-bottom ${notif.isRead ? 'bg-light text-muted' : 'bg-white'}`}
                onClick={() => handleNotificationClick(notif)}
                style={{ whiteSpace: 'normal', cursor: isClickable(notif.notificationType) ? 'pointer' : 'default', paddingRight: '2rem' }}
            >
                {notif.senderProfileImage && (
                    <img
                        src={notif.senderProfileImage}
                        alt="User"
                        className="rounded-circle me-2"
                        width="32"
                        height="32"
                        style={{ objectFit: 'cover' }}
                    />
                )}
                <div className="flex-grow-1 header-text">
                    <p className="mb-1 small fw-semibold" style={{ marginRight: '15px' }}>{notif.message}</p>
                    <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                        {new Date(notif.createdAt).toLocaleString()}
                    </small>
                </div>
                {!notif.isRead && (
                    <span className="badge bg-primary rounded-circle p-1 ms-1 align-self-center" style={{ width: '8px', height: '8px' }}> </span>
                )}
            </button>
            <button
                className="btn btn-sm text-danger position-absolute top-0 end-0 mt-1 me-1 p-0 border-0 bg-transparent"
                style={{ zIndex: 10, lineHeight: 1 }}
                onClick={(e) => removeNotification(notif.notificationId, e)}
                title="Delete notification"
            >
                &times;
            </button>
        </li>
    );

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
        <div className="dropdown">
            <button
                className="btn btn-link position-relative text-decoration-none text-dark"
                type="button"
                id="notificationDropdown"
                aria-expanded={isOpen}
                onClick={toggleDropdown}
            >
                <FaBell size={24} />
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                        <span className="visually-hidden">unread messages</span>
                    </span>
                )}
            </button>

            <div
                className={`dropdown-menu dropdown-menu-end p-0 shadow-lg ${isOpen ? 'show' : ''}`}
                aria-labelledby="notificationDropdown"
                style={{
                    width: '350px',
                    maxHeight: '550px',
                    overflowY: 'hidden',
                    display: isOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    zIndex: 1050, // Higher than most bootstrap elements
                    border: '1px solid rgba(0,0,0,0.15)'
                }}
            >

                {/* Header */}
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
                    <h6 className="m-0 fw-bold">Notifications</h6>
                </div>

                {/* Tabs */}
                {notifications.length > 0 && (
                    <div className="d-flex text-center border-bottom bg-light">
                        {Object.keys(groupedNotifications).map((tab) => (
                            <div
                                key={tab}
                                className={`flex-fill py-2 cursor-pointer ${activeTab === tab ? 'fw-bold text-primary border-bottom border-primary border-2' : 'text-muted'}`}
                                onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                                style={{ fontSize: '0.85rem', cursor: 'pointer' }}
                            >
                                {tab} ({groupedNotifications[tab].length})
                            </div>
                        ))}
                    </div>
                )}

                {/* Content */}
                <ul className="list-unstyled m-0" style={{ overflowY: 'auto', maxHeight: '400px' }}>
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
    );
};

export default NotificationDropdown;
