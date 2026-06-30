import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { apiClient } from '../api/queries';
import ChatPage from '../components/ChatPage';

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface Friend {
  id: string;
  name: string;
  handle: string;
  status: 'online' | 'offline';
  statusMsg: string;
  isFavorite?: boolean;
  avatarColor: string;
  avatarBg: string;
}

interface SuggestedConnect {
  id: string;
  name: string;
  subtitle: string;
  avatarColor: string;
  avatarBg: string;
}

/* ─── Demo Data ──────────────────────────────────────────────────────────── */
const DEMO_FRIENDS: Friend[] = [
  {
    id: '1', name: 'Elena Vance', handle: '@elena_v', status: 'online',
    statusMsg: '"Working on this, don\'t disturb"',
    avatarColor: '#adc6ff', avatarBg: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 50%, #1e3a5a 100%)',
  },
  {
    id: '2', name: 'Marcus Thorne', handle: '@mthorne_dev', status: 'offline',
    statusMsg: 'Away for the weekend',
    avatarColor: '#c2c6d6', avatarBg: 'linear-gradient(135deg, #1c1c24 0%, #2d2d3a 50%, #222230 100%)',
  },
  {
    id: '3', name: 'Sarah Chen', handle: '@schen_studio', status: 'online',
    statusMsg: '"Designing the future of Ekam"',
    avatarColor: '#a8d4b0', avatarBg: 'linear-gradient(135deg, #0f2a1a 0%, #1a4028 50%, #142d1e 100%)',
  },
  {
    id: '4', name: 'Aria Montgomery', handle: '@aria_m', status: 'online',
    statusMsg: '"In a meeting, back at 4 PM"', isFavorite: true,
    avatarColor: '#e8b4c0', avatarBg: 'linear-gradient(135deg, #2a1a22 0%, #3d2030 50%, #281a28 100%)',
  },
  {
    id: '5', name: 'Julian Vane', handle: '@jvane', status: 'offline',
    statusMsg: 'Last seen 3h ago',
    avatarColor: '#c2c6d6', avatarBg: 'linear-gradient(135deg, #1a1f2a 0%, #252d3d 50%, #1e2535 100%)',
  },
];

const DEMO_SUGGESTED: SuggestedConnect[] = [
  { id: 's1', name: 'Alex Rivera', subtitle: 'Shared projects: 4', avatarColor: '#adc6ff', avatarBg: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)' },
  { id: 's2', name: 'Jordan Lee',  subtitle: 'Design System team',  avatarColor: '#a8d4b0', avatarBg: 'linear-gradient(135deg, #0f2a1a 0%, #1a4028 100%)' },
];

/* ─── Sub-components ─────────────────────────────────────────────────────── */
function PhotoAvatar({ name, size = 64, color, bg }: { name: string; size?: number; color: string; bg: string }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: 14, flexShrink: 0,
      background: bg, border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.3, fontWeight: 700, color,
      letterSpacing: '-0.02em', position: 'relative', overflow: 'hidden',
    }}>
      {/* subtle inner sheen */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '50%',
        background: 'rgba(255,255,255,0.04)', borderRadius: '14px 14px 0 0',
      }} />
      <span style={{ position: 'relative', zIndex: 1 }}>{initials}</span>
    </div>
  );
}

function PresenceGem({ status }: { status: string }) {
  return (
    <div style={{
      width: 13, height: 13, borderRadius: '50%',
      border: '2px solid #000',
      background: status === 'online'
        ? 'radial-gradient(circle at 35% 35%, #adc6ff 0%, #005ac2 100%)'
        : 'radial-gradient(circle at 35% 35%, #424754 0%, #1b1b1b 100%)',
      boxShadow: status === 'online' ? '0 0 8px rgba(173,198,255,0.5)' : 'none',
    }} />
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
interface DirectMessagesProps {
  onNavigateToChat?: () => void;
}

export function DirectMessages({ onNavigateToChat }: DirectMessagesProps) {
  const username = useChatStore(state => state.username);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);

  // Friend Request States
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestingFriendUser, setRequestingFriendUser] = useState<any | null>(null);
  const [oneTimeMessage, setOneTimeMessage] = useState('');
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);

  // Activity Status States
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [myActivityDescription, setMyActivityDescription] = useState('');
  const [tempActivityDescription, setTempActivityDescription] = useState('');
  const [savingActivity, setSavingActivity] = useState(false);

  // Refs
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const activeRoomId = useChatStore(state => state.activeRoomId);
  const [isActiveRoomDm, setIsActiveRoomDm] = useState(false);
  const [activeFriendId, setActiveFriendId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeRoomId) {
      setIsActiveRoomDm(false);
      setActiveFriendId(null);
      return;
    }
    apiClient.get(`/api/rooms/${activeRoomId}`)
      .then(({ data }) => {
        const isDm = data.room?.type === 'dm';
        setIsActiveRoomDm(isDm);
        if (isDm && data.room?.dmRecipientId) {
          setActiveFriendId(data.room.dmRecipientId);
        } else {
          setActiveFriendId(null);
        }
      })
      .catch(() => {
        setIsActiveRoomDm(false);
        setActiveFriendId(null);
      });
  }, [activeRoomId]);

  const fetchFriends = async () => {
    try {
      const { data } = await apiClient.get('/api/friends');
      const mapped = data.friends.map((u: any) => ({
        id: u.id,
        name: u.display_name || u.email.split('@')[0],
        handle: `@${u.username || (u.display_name ? u.display_name.toLowerCase().replace(/\s+/g, '_') : u.email.split('@')[0])}`,
        email: u.email,
        status: u.status === 'online' ? 'online' : 'offline',
        statusMsg: u.activity_description ? `"${u.activity_description}"` : (u.status === 'online' ? 'Active now' : 'Offline'),
        activity_description: u.activity_description,
        avatarColor: '#adc6ff',
        avatarBg: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 50%, #1e3a5a 100%)',
      }));
      setFriends(mapped);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const fetchIncomingRequests = async () => {
    try {
      const { data } = await apiClient.get('/api/friends/requests');
      setIncomingRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to fetch incoming requests:', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchMyProfile = async () => {
    try {
      const { data } = await apiClient.get('/api/users/me');
      if (data?.user) {
        setMyActivityDescription(data.user.activity_description || '');
        setTempActivityDescription(data.user.activity_description || '');
      }
    } catch (err) {
      console.error('Failed to fetch my profile:', err);
    }
  };

  useEffect(() => {
    fetchFriends();
    fetchIncomingRequests();
    fetchMyProfile();
  }, []);

  const handleSaveActivity = async () => {
    setSavingActivity(true);
    try {
      await apiClient.put('/api/users/activity', {
        activity_description: tempActivityDescription.trim()
      });
      setMyActivityDescription(tempActivityDescription.trim());
      setShowActivityModal(false);
    } catch (err) {
      console.error('Failed to save activity description:', err);
      alert('Failed to update activity description. Please try again.');
    } finally {
      setSavingActivity(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await apiClient.get('/api/users/search', {
          params: { q: searchQuery }
        });
        setSearchResults(data.users || []);
      } catch (err) {
        console.error('Error searching users:', err);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSendFriendRequest = async () => {
    if (!requestingFriendUser) return;
    setAddingFriendId(requestingFriendUser.id);
    try {
      const { data } = await apiClient.post('/api/friends', {
        friend_id: requestingFriendUser.id,
        message: oneTimeMessage.trim()
      });
      alert(data.message || 'Friend request sent!');
      setRequestingFriendUser(null);
      setOneTimeMessage('');
      await fetchFriends();
      await fetchIncomingRequests();
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== requestingFriendUser.id));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send friend request');
    } finally {
      setAddingFriendId(null);
    }
  };

  const handleAcceptRequest = async (friendId: string) => {
    try {
      await apiClient.post('/api/friends/accept', { friend_id: friendId });
      await fetchFriends();
      await fetchIncomingRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleDeclineRequest = async (friendId: string) => {
    try {
      await apiClient.post('/api/friends/decline', { friend_id: friendId });
      await fetchIncomingRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to decline request');
    }
  };

  const handleChatWithFriend = async (friendId: string) => {
    try {
      const { data } = await apiClient.post('/api/rooms/dm', { friendId });
      if (data.room_id) {
        useChatStore.getState().setActiveRoomId(data.room_id);
        setSelectedUserProfile(null);
        if (onNavigateToChat) {
          onNavigateToChat();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to start chat with friend');
    }
  };

  const handleFocusSearch = () => {
    searchInputRef.current?.focus();
  };

  const hasFriends = friends.length > 0;

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isActiveRoomDm && activeRoomId) {
    return (
      <div style={{ display: 'flex', height: '100%', width: '100%', background: '#0a0a0a', overflow: 'hidden' }}>
        {/* Left DM Sidebar */}
        <div style={{
          width: 260,
          background: 'rgba(15, 15, 15, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}>
          {/* Header */}
          <div style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          }}>
            <span style={{
              fontSize: 14,
              fontWeight: 750,
              letterSpacing: '0.1em',
              color: '#adc6ff',
              textTransform: 'uppercase',
            }}>Direct Messages</span>
          </div>

          {/* DM List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }} className="custom-scrollbar">
            {/* Friends / Dashboard button */}
            <button
              onClick={() => useChatStore.getState().setActiveRoomId(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                transition: 'all 0.2s ease',
                textAlign: 'left',
                cursor: 'pointer',
                border: 'none',
                background: 'transparent',
                color: 'rgba(194, 198, 214, 0.6)',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.color = '#e2e2e2';
                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.color = 'rgba(194, 198, 214, 0.6)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span style={{
                fontFamily: "'Material Symbols Outlined'",
                fontSize: 18,
                color: 'rgba(194, 198, 214, 0.4)',
              }}>group</span>
              <span>Friends Dashboard</span>
            </button>

            <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '8px 4px' }} />

            {friends.map(friend => {
              const isActive = activeFriendId === friend.id;
              return (
                <button
                  key={friend.id}
                  onClick={() => handleChatWithFriend(friend.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: 'none',
                    background: isActive ? 'rgba(77, 142, 255, 0.08)' : 'transparent',
                    color: isActive ? '#4d8eff' : 'rgba(194, 198, 214, 0.7)',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#e2e2e2';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(194, 198, 214, 0.7)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div style={{ position: 'relative' }}>
                    <PhotoAvatar
                      name={friend.name}
                      size={32}
                      color="#adc6ff"
                      bg="linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)"
                    />
                    <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
                      <PresenceGem status={friend.status} />
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: isActive ? '#adc6ff' : '#e2e2e2'
                    }}>{friend.name}</p>
                    {friend.statusMsg && (
                      <p style={{
                        margin: 0,
                        fontSize: 11,
                        color: isActive ? 'rgba(173, 198, 255, 0.6)' : 'rgba(194, 198, 214, 0.4)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>{friend.statusMsg}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Chat Pane */}
        <div style={{ flex: 1, height: '100%', position: 'relative' }}>
          <ChatPage roomId={activeRoomId} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0a', overflow: 'hidden' }}>

      {/* ── Top Navigation Bar ───────────────────────────────────────────── */}
      <div style={{
        height: 56, flexShrink: 0, display: 'flex', alignItems: 'center',
        padding: '0 24px', gap: 16,
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        zIndex: 20,
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: '#4d8eff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(77,142,255,0.4)',
          }}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, color: '#001a3d', fontVariationSettings: "'FILL' 1" }}>diamond</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: 17, color: '#e2e2e2', letterSpacing: '-0.02em' }}>Ekam</span>
        </div>

        {/* Search bar */}
        <div style={{ flex: 1, maxWidth: 380, position: 'relative' }}>
          <span style={{
            fontFamily: "'Material Symbols Outlined'", fontSize: 16,
            color: 'rgba(194,198,214,0.4)',
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          }}>search</span>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search friends or groups..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: 36, background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
              color: '#e2e2e2', fontSize: 13, paddingLeft: 36, paddingRight: 40,
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 5, padding: '2px 6px', fontSize: 10, color: 'rgba(194,198,214,0.4)',
            fontFamily: 'monospace',
          }}>⌘K</div>
        </div>

        {/* Right icons */}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          
          {/* Notifications Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => {
                setIsNotificationPanelOpen(!isNotificationPanelOpen);
              }}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none',
                background: isNotificationPanelOpen ? 'rgba(255,255,255,0.08)' : 'transparent', 
                cursor: 'pointer', color: isNotificationPanelOpen ? '#adc6ff' : 'rgba(194,198,214,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s ease',
                fontFamily: "'Material Symbols Outlined'", fontSize: 20,
              }}
              onMouseEnter={e => { if (!isNotificationPanelOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isNotificationPanelOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              notifications
            </button>
            {incomingRequests.length > 0 && (
              <span style={{
                position: 'absolute', top: -2, right: -2,
                background: '#4d8eff', color: '#00285d',
                fontSize: 9, fontWeight: 800,
                borderRadius: '50%', width: 15, height: 15,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 8px rgba(77,142,255,0.6)',
                border: '1.5px solid #0a0a0a',
                pointerEvents: 'none',
              }}>
                {incomingRequests.length}
              </span>
            )}

            {/* Notification Dropdown Panel */}
            {isNotificationPanelOpen && (
              <div style={{
                position: 'absolute', top: 46, right: 0,
                width: 320, background: 'rgba(20,20,24,0.95)',
                backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18,
                padding: 16, boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
                zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e2e2' }}>Notifications</span>
                  {incomingRequests.length > 0 && (
                    <span style={{ fontSize: 11, color: '#4d8eff', fontWeight: 600 }}>{incomingRequests.length} pending</span>
                  )}
                </div>

                <div style={{ maxHeight: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }} className="custom-scrollbar">
                  {incomingRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(194,198,214,0.4)', fontSize: 12 }}>
                      No new notifications
                    </div>
                  ) : (
                    incomingRequests.map(req => (
                      <div key={req.id} style={{
                        display: 'flex', flexDirection: 'column', gap: 8, padding: 10,
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 12,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <PhotoAvatar name={req.display_name} size={32} color="#adc6ff" bg="linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)" />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: '#e2e2e2', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{req.display_name}</p>
                            <p style={{ fontSize: 10, color: 'rgba(194,198,214,0.45)', margin: 0 }}>@{req.username}</p>
                          </div>
                        </div>
                        {req.message && (
                          <p style={{ fontSize: 11, color: 'rgba(194,198,214,0.6)', fontStyle: 'italic', margin: '2px 0 4px 0', paddingLeft: 8, borderLeft: '2px solid rgba(77,142,255,0.3)', textAlign: 'left' }}>
                            "{req.message}"
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                          <button
                            onClick={() => handleAcceptRequest(req.id)}
                            style={{
                              flex: 1, padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                              background: '#4d8eff', color: '#00285d', fontSize: 11, fontWeight: 750,
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineRequest(req.id)}
                            style={{
                              flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                              background: 'transparent', color: 'rgba(194,198,214,0.6)', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                            }}
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button style={{
            width: 36, height: 36, borderRadius: 10, border: 'none',
            background: 'transparent', cursor: 'pointer', color: 'rgba(194,198,214,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s ease',
            fontFamily: "'Material Symbols Outlined'", fontSize: 20,
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            settings
          </button>

          {/* User avatar */}
          <div 
            onClick={() => {
              setTempActivityDescription(myActivityDescription);
              setShowActivityModal(true);
            }}
            style={{
              width: 34, height: 34, borderRadius: 10, marginLeft: 4,
              background: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)',
              border: '1px solid rgba(173,198,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: '#adc6ff', cursor: 'pointer',
            }}
          >
            {(username || 'U').slice(0, 1).toUpperCase()}
          </div>
          <div 
            onClick={() => {
              setTempActivityDescription(myActivityDescription);
              setShowActivityModal(true);
            }}
            style={{ display: 'flex', flexDirection: 'column', marginLeft: 6, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 13, color: 'rgba(194,198,214,0.85)', fontWeight: 600, lineHeight: 1.2 }}>
              {username || 'User'}
            </span>
            {myActivityDescription && (
              <span style={{ fontSize: 11, color: 'rgba(194,198,214,0.45)', fontStyle: 'italic', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }} title={myActivityDescription}>
                {myActivityDescription}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }} className="custom-scrollbar">
        {/* Atmospheric glows */}
        <div style={{ position: 'absolute', top: '-5%', right: '-5%', width: 600, height: 600, background: 'rgba(173,198,255,0.03)', borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '-5%', width: 500, height: 500, background: 'rgba(173,198,255,0.02)', borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 10, padding: '48px 56px', maxWidth: 1100 }}>

          {/* ── Page Header Row ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 48 }}>
            <div>
              <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', color: '#e2e2e2', marginBottom: 10, lineHeight: 1.15 }}>
                Connected Friends
              </h1>
              <p style={{ color: 'rgba(194,198,214,0.6)', fontSize: 14, maxWidth: 340, lineHeight: 1.7 }}>
                Manage your network and start seamless real-time collaborations.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => {
                  setTempActivityDescription(myActivityDescription);
                  setShowActivityModal(true);
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px',
                  background: 'transparent', color: '#adc6ff',
                  border: '1px solid rgba(173,198,255,0.35)',
                  borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap', flexShrink: 0,
                  marginTop: 4,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(173,198,255,0.6)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(173,198,255,0.35)';
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>edit_note</span>
                Set Status
              </button>
              <button
                onClick={handleFocusSearch}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px',
                  background: 'transparent', color: '#adc6ff',
                  border: '1px solid rgba(173,198,255,0.35)',
                  borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.2s ease', whiteSpace: 'nowrap', flexShrink: 0,
                  marginTop: 4,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.08)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(173,198,255,0.6)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(173,198,255,0.35)';
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>person_add</span>
                Add Friend
              </button>
            </div>
          </div>

          {/* ── Incoming Friend Requests Section ────────────────────────── */}
          {incomingRequests.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: '#adc6ff' }}>pending</span>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#e2e2e2', margin: 0 }}>Pending Friend Requests</h2>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {incomingRequests.map(req => (
                  <div key={req.id} style={{
                    display: 'flex', flexDirection: 'column', gap: 12, padding: '16px 18px',
                    background: 'rgba(173,198,255,0.03)', border: '1px solid rgba(173,198,255,0.12)',
                    borderRadius: 18, minWidth: 280, maxWidth: 360,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <PhotoAvatar name={req.display_name} size={42} color="#adc6ff" bg="linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)" />
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e2e2', marginBottom: 2 }}>{req.display_name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(194,198,214,0.45)' }}>@{req.username}</p>
                      </div>
                    </div>
                    {req.message && (
                      <div style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: 10, padding: 10, fontSize: 12, color: 'rgba(194,198,214,0.7)',
                        fontStyle: 'italic', lineHeight: 1.4,
                      }}>
                        "{req.message}"
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                      <button
                        onClick={() => handleAcceptRequest(req.id)}
                        style={{
                          flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                          background: '#4d8eff', color: '#00285d', fontSize: 12, fontWeight: 750,
                        }}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req.id)}
                        style={{
                          flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                          background: 'transparent', color: 'rgba(194,198,214,0.6)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginTop: 32 }} />
            </div>
          )}

          {/* ── Search Results / Add Friends ────────────────────────────── */}
          {searchQuery.trim() && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: '#adc6ff' }}>person_search</span>
                <h2 style={{ fontSize: 20, fontWeight: 600, color: '#e2e2e2', margin: 0 }}>Add Friends</h2>
              </div>
              
              {searching ? (
                <p style={{ color: 'rgba(194,198,214,0.4)', fontSize: 14 }}>Searching users...</p>
              ) : searchResults.length === 0 ? (
                <p style={{ color: 'rgba(194,198,214,0.4)', fontSize: 14 }}>No users found matching "{searchQuery}"</p>
              ) : (
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                  {searchResults.map(user => {
                    const isAlreadyFriend = friends.some(f => f.id === user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => setSelectedUserProfile(user)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                          background: 'rgba(20,20,24,0.7)', backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16,
                          minWidth: 260, cursor: 'pointer', transition: 'all 0.25s ease',
                        }}
                      >
                        <PhotoAvatar
                          name={user.display_name || user.email.split('@')[0]}
                          size={46}
                          color="#adc6ff"
                          bg="linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)"
                        />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e2e2', marginBottom: 2 }}>
                            {user.display_name || user.email.split('@')[0]}
                          </p>
                          <p style={{ fontSize: 11, color: 'rgba(194,198,214,0.45)', fontWeight: 500 }}>
                            @{user.username || (user.display_name ? user.display_name.toLowerCase().replace(/\s+/g, '_') : user.email.split('@')[0])}
                          </p>
                        </div>
                        {isAlreadyFriend ? (
                          <span style={{ fontSize: 12, color: 'rgba(194,198,214,0.4)', fontWeight: 600 }} onClick={e => e.stopPropagation()}>Friend</span>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setRequestingFriendUser(user); }}
                            disabled={addingFriendId === user.id}
                            style={{
                              padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
                              background: 'rgba(173,198,255,0.1)', color: '#adc6ff',
                              fontSize: 12, fontWeight: 600,
                              display: 'flex', alignItems: 'center', gap: 4,
                              transition: 'all 0.2s ease', flexShrink: 0,
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.2)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.1)'; }}
                          >
                            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14 }}>person_add</span>
                            Add Friend
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginTop: 32 }} />
            </div>
          )}

          {/* ── Friends Grid or Empty State ──────────────────────────────── */}
          {loadingFriends ? (
            <p style={{ color: 'rgba(194,198,214,0.4)', fontSize: 14 }}>Loading friends...</p>
          ) : hasFriends ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 16, marginBottom: 56,
              }}>
                {filteredFriends.map(friend => (
                  <div
                    key={friend.id}
                    onClick={() => setSelectedUserProfile(friend)}
                    style={{
                      background: friend.isFavorite ? 'rgba(173,198,255,0.04)' : 'rgba(20,20,24,0.7)',
                      backdropFilter: 'blur(20px)',
                      border: friend.isFavorite ? '1px solid rgba(173,198,255,0.18)' : '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 18, padding: '20px 18px', cursor: 'pointer',
                      transition: 'all 0.25s ease', position: 'relative',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.07)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(173,198,255,0.2)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = friend.isFavorite ? 'rgba(173,198,255,0.04)' : 'rgba(20,20,24,0.7)';
                      (e.currentTarget as HTMLElement).style.borderColor = friend.isFavorite ? 'rgba(173,198,255,0.18)' : 'rgba(255,255,255,0.06)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Favorite badge */}
                    {friend.isFavorite && (
                      <div style={{
                        position: 'absolute', top: 14, right: 14,
                        fontSize: 9, background: 'rgba(173,198,255,0.15)',
                        color: '#adc6ff', padding: '3px 8px', borderRadius: 6,
                        fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                      }} onClick={e => e.stopPropagation()}>FAVORITE</div>
                    )}

                    {/* More options (non-favorites) */}
                    {!friend.isFavorite && (
                      <button style={{
                        position: 'absolute', top: 12, right: 12,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'rgba(194,198,214,0.25)', padding: 4,
                        borderRadius: 6, transition: 'color 0.2s',
                        fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1,
                      }}
                        onClick={e => e.stopPropagation()}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(194,198,214,0.7)'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(194,198,214,0.25)'; }}
                      >more_horiz</button>
                    )}

                    {/* Avatar + presence */}
                    <div style={{ position: 'relative', width: 64, marginBottom: 14 }}>
                      <PhotoAvatar name={friend.name} size={64} color={friend.avatarColor} bg={friend.avatarBg} />
                      <div style={{ position: 'absolute', bottom: -1, right: -1 }}>
                        <PresenceGem status={friend.status} />
                      </div>
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e2e2', marginBottom: 3, letterSpacing: '-0.01em' }}>
                      {friend.name}
                    </h3>
                    <p style={{
                      fontSize: 12, fontWeight: 600, marginBottom: 9,
                      color: friend.status === 'online' ? 'rgba(173,198,255,0.65)' : 'rgba(194,198,214,0.35)',
                    }}>
                      {friend.handle}
                    </p>
                    <p style={{
                      fontSize: 12, lineHeight: 1.55, fontStyle: 'italic',
                      color: friend.status === 'online' ? 'rgba(194,198,214,0.75)' : 'rgba(194,198,214,0.4)',
                    }}>
                      {friend.statusMsg}
                    </p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* ── Empty State ──────────────────────────────────────────────── */
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{
                width: 88, height: 88, borderRadius: 24, margin: '0 auto 28px',
                background: 'rgba(173,198,255,0.06)', border: '1px solid rgba(173,198,255,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 40, color: 'rgba(173,198,255,0.4)', lineHeight: 1 }}>group</span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e2e2e2', marginBottom: 10, letterSpacing: '-0.02em' }}>
                No friends yet
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(194,198,214,0.5)', maxWidth: 320, margin: '0 auto 36px', lineHeight: 1.7 }}>
                Add friends to start collaborating in real-time. Your network is waiting to be built.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={() => {
                    setTempActivityDescription(myActivityDescription);
                    setShowActivityModal(true);
                  }}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px',
                    background: 'transparent', color: '#adc6ff',
                    border: '1px solid rgba(173,198,255,0.3)', borderRadius: 12,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.08)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>edit_note</span>
                  Set Status
                </button>
                <button
                  onClick={handleFocusSearch}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px',
                    background: 'rgba(173,198,255,0.1)', color: '#adc6ff',
                    border: '1px solid rgba(173,198,255,0.3)', borderRadius: 12,
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.18)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.1)'; }}
                >
                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18, lineHeight: 1 }}>person_add</span>
                  Add Friends
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── One-time Message / Send Friend Request Modal ─────────────── */}
      {requestingFriendUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 10000,
        }} onClick={() => setRequestingFriendUser(null)}>
          <div style={{
            width: 420, background: '#131313',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20,
            padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#e2e2e2', marginBottom: 8 }}>
              Send Friend Request
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(194,198,214,0.5)', marginBottom: 20 }}>
              You are sending a request to <strong>{requestingFriendUser.display_name || requestingFriendUser.email.split('@')[0]}</strong>. Add a one-time message to tell them who you are.
            </p>
            <textarea
              placeholder="e.g. Hi, I'm Julian from the design team!"
              value={oneTimeMessage}
              onChange={e => setOneTimeMessage(e.target.value)}
              rows={3}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                color: '#e2e2e2', fontSize: 14, padding: 12, outline: 'none',
                fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 20,
                resize: 'none', lineHeight: 1.5,
              }}
              maxLength={200}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setRequestingFriendUser(null)}
                style={{
                  padding: '8px 16px', background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8,
                  color: 'rgba(194,198,214,0.6)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendFriendRequest}
                disabled={addingFriendId === requestingFriendUser.id}
                style={{
                  padding: '8px 16px', background: '#4d8eff', border: 'none',
                  borderRadius: 8, color: '#00285d', cursor: 'pointer', fontSize: 13,
                  fontWeight: 700, boxShadow: '0 0 12px rgba(77,142,255,0.3)',
                }}
              >
                {addingFriendId === requestingFriendUser.id ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── User Profile Modal ────────────────────────────────────────── */}
      {selectedUserProfile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, transition: 'all 0.3s ease',
        }}
          onClick={() => setSelectedUserProfile(null)}
        >
          <div style={{
            width: 380, background: 'rgba(20,20,24,0.9)',
            border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24,
            padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center',
            boxShadow: '0 24px 48px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.05)',
            position: 'relative',
          }}
            onClick={e => e.stopPropagation()}
          >
            {/* Close Button */}
            <button style={{
              position: 'absolute', top: 20, right: 20,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(194,198,214,0.5)', transition: 'color 0.2s',
              fontFamily: "'Material Symbols Outlined'", fontSize: 22,
            }}
              onClick={() => setSelectedUserProfile(null)}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(194,198,214,0.5)'; }}
            >close</button>

            {/* Profile Avatar */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <PhotoAvatar
                name={selectedUserProfile.display_name || selectedUserProfile.name || selectedUserProfile.email.split('@')[0]}
                size={96}
                color="#adc6ff"
                bg="linear-gradient(135deg, #1a2744 0%, #2a3f6e 50%, #1e3a5a 100%)"
              />
              <div style={{ position: 'absolute', bottom: 2, right: 2 }}>
                <PresenceGem status={selectedUserProfile.status || 'offline'} />
              </div>
            </div>

            {/* User Details */}
            <h2 style={{ fontSize: 22, fontWeight: 700, color: '#e2e2e2', marginBottom: 6, textAlign: 'center' }}>
              {selectedUserProfile.display_name || selectedUserProfile.name || selectedUserProfile.email.split('@')[0]}
            </h2>
            <p style={{ fontSize: 14, color: '#4d8eff', fontWeight: 600, marginBottom: 16 }}>
              @{selectedUserProfile.username || (selectedUserProfile.display_name || selectedUserProfile.name)?.toLowerCase().replace(/\s+/g, '_') || selectedUserProfile.email.split('@')[0]}
            </p>

            {/* Extra Metadata */}
            <div style={{
              width: '100%', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16,
              padding: '16px 20px', marginBottom: 24, boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: 12, color: 'rgba(194,198,214,0.4)', fontWeight: 500 }}>Email</span>
                <span style={{ fontSize: 13, color: '#e2e2e2', fontWeight: 500 }}>{selectedUserProfile.email}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'rgba(194,198,214,0.4)', fontWeight: 500 }}>Status</span>
                <span style={{
                  fontSize: 13,
                  color: selectedUserProfile.status === 'online' ? '#a8d4b0' : 'rgba(194,198,214,0.5)',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}>
                  {selectedUserProfile.status || 'offline'}
                </span>
              </div>
              {selectedUserProfile.activity_description && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                  <span style={{ fontSize: 12, color: 'rgba(194,198,214,0.4)', fontWeight: 500 }}>Activity</span>
                  <span style={{ fontSize: 13, color: '#adc6ff', fontWeight: 500, fontStyle: 'italic' }}>
                    "{selectedUserProfile.activity_description}"
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            {friends.some(f => f.id === selectedUserProfile.id) ? (
              <button
                onClick={() => handleChatWithFriend(selectedUserProfile.id)}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                  background: '#4d8eff', color: '#001a3d',
                  fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', boxShadow: '0 8px 24px rgba(77,142,255,0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#3b7de6';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(77,142,255,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '#4d8eff';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(77,142,255,0.25)';
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18 }}>chat</span>
                Chat with Friend
              </button>
            ) : (
              <button
                onClick={() => {
                  setRequestingFriendUser(selectedUserProfile);
                  setSelectedUserProfile(null);
                }}
                disabled={addingFriendId === selectedUserProfile.id}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                  background: '#4d8eff', color: '#001a3d',
                  fontSize: 14, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', boxShadow: '0 8px 24px rgba(77,142,255,0.25)',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = '#3b7de6';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(77,142,255,0.4)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = '#4d8eff';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(77,142,255,0.25)';
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18 }}>person_add</span>
                {addingFriendId === selectedUserProfile.id ? 'Adding...' : 'Add Friend'}
              </button>
            )}
          </div>
        </div>
      )}
      {/* ── Activity Status Modal ─────────────────────────────────────── */}
      {showActivityModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            width: '100%', maxWidth: 420,
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            border: '1px solid rgba(173, 198, 255, 0.15)',
            borderRadius: 24, padding: '28px 32px', boxSizing: 'border-box',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e2e2e2', margin: '0 0 8px 0' }}>
              Set Activity Status
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(194,198,214,0.6)', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Share what you're up to with your connected friends.
            </p>

            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 14, padding: '12px 16px', display: 'flex', gap: 12,
              alignItems: 'center', marginBottom: 24,
            }}>
              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20, color: '#adc6ff' }}>edit_note</span>
              <input
                type="text"
                value={tempActivityDescription}
                onChange={e => setTempActivityDescription(e.target.value)}
                placeholder="What's your status?"
                maxLength={100}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#e2e2e2', fontSize: 14, fontFamily: 'inherit',
                }}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveActivity();
                  if (e.key === 'Escape') setShowActivityModal(false);
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button
                onClick={() => setShowActivityModal(false)}
                style={{
                  padding: '10px 20px', borderRadius: 12, border: 'none',
                  background: 'rgba(255, 255, 255, 0.05)', color: 'rgba(194, 198, 214, 0.8)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.05)'; }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveActivity}
                disabled={savingActivity}
                style={{
                  padding: '10px 24px', borderRadius: 12, border: 'none',
                  background: '#4d8eff', color: '#002e6a',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer',
                  transition: 'filter 0.2s',
                  opacity: savingActivity ? 0.6 : 1,
                }}
                onMouseEnter={e => { if (!savingActivity) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)'; }}
                onMouseLeave={e => { if (!savingActivity) (e.currentTarget as HTMLElement).style.filter = 'brightness(1)'; }}
              >
                {savingActivity ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DirectMessages;
