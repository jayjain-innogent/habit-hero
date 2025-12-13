import React, { useState, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { FaBell, FaUserFriends, FaFire } from 'react-icons/fa';
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
                className={`dropdown-item d-flex align-items-start p-3 border-bottom ${notif.isRead ? 'text-muted' : ''}`}
                onClick={() => handleNotificationClick(notif)}
                style={{ whiteSpace: 'normal', cursor: isClickable(notif.notificationType) ? 'pointer' : 'default', paddingRight: '2.5rem', background: notif.isRead ? '#FFFBF0' : 'white', borderLeft: notif.isRead ? 'none' : '3px solid #6B8EFF' }}
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
                    <span className="rounded-circle p-1 ms-1 align-self-center" style={{ width: '10px', height: '10px', background: 'linear-gradient(135deg, #6B8EFF, #8CA9FF)' }}> </span>
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
        <>
        {isOpen && <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999998, background: 'rgba(0,0,0,0.2)' }} onClick={() => setIsOpen(false)} />}
        <div className="dropdown" style={{ position: 'relative', zIndex: 999999 }}>
            <button
                className="btn btn-link position-relative text-decoration-none"
                type="button"
                id="notificationDropdown"
                aria-expanded={isOpen}
                onClick={toggleDropdown}
                style={{ color: '#000' }}
            >
                <FaBell size={24} />
                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle rounded-circle" style={{ background: '#FF4444', width: '12px', height: '12px' }}>
                        <span className="visually-hidden">unread messages</span>
                    </span>
                )}
            </button>

            <div
                className={`dropdown-menu dropdown-menu-end p-0 ${isOpen ? 'show' : ''}`}
                aria-labelledby="notificationDropdown"
                style={{
                    width: '380px',
                    maxHeight: '550px',
                    overflowY: 'hidden',
                    display: isOpen ? 'flex' : 'none',
                    flexDirection: 'column',
                    position: 'fixed',
                    top: '60px',
                    right: '20px',
                    zIndex: 999999,
                    border: '3px solid #FFE5A0',
                    borderRadius: '16px',
                    background: 'white',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                }}
            >

                {/* Header */}
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #8CA9FF, #6B8EFF)', borderTopLeftRadius: '13px', borderTopRightRadius: '13px' }}>
                    <h6 className="m-0 fw-bold" style={{ color: '#fff' }}>Notifications</h6>
                </div>

                {/* Tabs */}
                {notifications.length > 0 && (
                    <div className="d-flex text-center border-bottom" style={{ background: '#FFFBF0' }}>
                        {Object.keys(groupedNotifications).map((tab) => {
                            const hasUnread = groupedNotifications[tab].some(n => !n.isRead);
                            return (
                                <div
                                    key={tab}
                                    className={`flex-fill py-3 cursor-pointer position-relative ${activeTab === tab ? 'border-bottom border-3' : ''}`}
                                    onClick={(e) => { e.stopPropagation(); setActiveTab(tab); }}
                                    style={{ cursor: 'pointer', color: activeTab === tab ? '#6B8EFF' : '#64748b', borderColor: '#6B8EFF', fontWeight: activeTab === tab ? '600' : '400' }}
                                    title={tab}
                                >
                                    {tab === 'Friends' && <FaUserFriends size={20} />}
                                    {tab === 'Streak Related' && <FaFire size={20} />}

                                    {hasUnread && (
                                        <span
                                            className="position-absolute rounded-circle"
                                            style={{ width: '8px', height: '8px', top: '10px', right: '35%', background: 'linear-gradient(135deg, #6B8EFF, #8CA9FF)' }}
                                        ></span>
                                    )}
                                </div>
                            );
                        })}
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
        </>
    );
};

export default NotificationDropdown;
