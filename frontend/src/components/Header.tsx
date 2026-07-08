import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/chatStore';
import { apiClient } from '../api/queries';

interface HeaderProps {
  roomId: string;
}

const S: Record<string, React.CSSProperties> = {
  header: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    flexShrink: 0,
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    position: 'relative',
    zIndex: 20,
  },
  leftGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  hash: {
    color: 'rgba(194,198,214,0.5)',
    fontSize: 14,
    fontWeight: 600,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#e2e2e2',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(194,198,214,0.4)',
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  onlineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  onlineDot: {
    width: 6,
    height: 6,
    background: '#adc6ff',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#adc6ff',
  },
  iconBtn: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  },
  materialIcon: {
    fontFamily: "'Material Symbols Outlined'",
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontSize: 20,
    lineHeight: 1,
    display: 'inline-block',
    color: 'rgba(194,198,214,0.5)',
    userSelect: 'none',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    background: '#0a0f1d',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    padding: 24,
    color: '#e2e2e2',
    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#adc6ff',
    margin: 0,
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: 10,
    background: 'rgba(255, 255, 255, 0.01)',
    border: '1px solid rgba(255,255,255,0.04)',
    marginBottom: 6,
  },
  modBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    color: 'rgba(194, 198, 214, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  badge: {
    fontSize: 9,
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
};

function parseGroupDescription(rawDescription: string | null) {
  if (!rawDescription) return { avatarUrl: '', description: '' };
  const match = rawDescription.match(/^\[avatar:([^\]]+)\]\s*(.*)$/);
  if (match) {
    return { avatarUrl: match[1], description: match[2] };
  }
  return { avatarUrl: '', description: rawDescription };
}

export function Header({ roomId }: HeaderProps) {
  const presenceMap = useChatStore(state => state.presence);
  const onlineCount = Object.values(presenceMap).filter(p => p.online).length;
  const token = useChatStore(state => state.token);

  // Decoded current user ID
  let currentUserId = '';
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      currentUserId = payload.id || payload.sub || '';
    } catch {}
  }

  const [room, setRoom] = useState<any>(null);
  const [roomName, setRoomName] = useState<string>('');
  
  // Dropdown & Modal States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isGroupInfoModalOpen, setIsGroupInfoModalOpen] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Add Members Sub-state
  const [isAddingMembers, setIsAddingMembers] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [adding, setAdding] = useState(false);

  const fetchRoom = () => {
    if (roomId === 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' || roomId === 'general') {
      setRoomName('global-stream');
      setRoom({ name: 'global-stream', type: 'public' });
      return;
    }

    let isMounted = true;
    apiClient.get(`/api/rooms/${roomId}`)
      .then(({ data }) => {
        if (isMounted && data.room) {
          setRoom(data.room);
          setRoomName(data.room.name);
        }
      })
      .catch(err => {
        console.error('Failed to fetch room details:', err);
        if (isMounted) {
          setRoomName(roomId);
        }
      });

    return () => {
      isMounted = false;
    };
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const { data } = await apiClient.get(`/api/rooms/${roomId}/members`);
      setMembers(data.members || []);
    } catch (err) {
      console.error('Failed to fetch members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchRoom();
    if (isGroupInfoModalOpen) {
      fetchMembers();
    }
  }, [roomId, isGroupInfoModalOpen]);

  // Real-time synchronization
  useEffect(() => {
    const handleMembershipChanged = (e: any) => {
      if (e.detail?.roomId === roomId) {
        fetchRoom();
        if (isGroupInfoModalOpen) {
          fetchMembers();
        }
      }
    };
    window.addEventListener('room-membership-changed', handleMembershipChanged);
    return () => {
      window.removeEventListener('room-membership-changed', handleMembershipChanged);
    };
  }, [roomId, isGroupInfoModalOpen]);

  // Fetch friends for adding when adding members screen opens
  useEffect(() => {
    if (isAddingMembers) {
      apiClient.get('/api/friends')
        .then(({ data }) => {
          setFriends(data.friends || []);
        })
        .catch(err => console.error('Failed to fetch friends:', err));
    }
  }, [isAddingMembers]);

  const { avatarUrl: roomAvatar, description: roomDescription } = parseGroupDescription(room?.description);

  // Moderation Handlers
  const handleMute = async (targetUserId: string, isCurrentlyMuted: boolean) => {
    try {
      await apiClient.post(`/api/rooms/${roomId}/mute`, { userId: targetUserId, isMuted: !isCurrentlyMuted });
      await fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update mute status');
    }
  };

  const handlePromote = async (targetUserId: string, currentRole: string) => {
    try {
      const nextRole = currentRole === 'co-admin' ? 'member' : 'co-admin';
      await apiClient.post(`/api/rooms/${roomId}/promote`, { userId: targetUserId, role: nextRole });
      await fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to change promotion role');
    }
  };

  const handleKick = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to kick this member?')) return;
    try {
      await apiClient.post(`/api/rooms/${roomId}/kick`, { userId: targetUserId });
      await fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to kick member');
    }
  };

  const handleTransfer = async (targetUserId: string) => {
    if (!confirm('Are you sure you want to transfer ownership of this group to this member? You will become a regular member.')) return;
    try {
      await apiClient.post(`/api/rooms/${roomId}/transfer-ownership`, { targetUserId });
      await fetchMembers();
      await fetchRoom();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to transfer ownership');
    }
  };

  const handleLeaveGroup = async () => {
    if (!confirm('Are you sure you want to leave this group?')) return;
    try {
      await apiClient.post(`/api/rooms/${roomId}/leave`);
      setIsGroupInfoModalOpen(false);
      useChatStore.getState().setActiveRoomId(null);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to leave group');
    }
  };

  const handleAddMembersSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFriendIds.length === 0) return;
    setAdding(true);
    try {
      await apiClient.post(`/api/rooms/${roomId}/members`, { userIds: selectedFriendIds });
      setSelectedFriendIds([]);
      setIsAddingMembers(false);
      await fetchMembers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add members');
    } finally {
      setAdding(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriendIds(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Determine roles & permissions
  const callerMember = members.find(m => m.user_id === currentUserId);
  const callerRole = callerMember?.role || 'member';

  // Filter friends not already in the group
  const nonMemberFriends = friends.filter(friend => {
    const isAlreadyMember = members.some(m => m.user_id === friend.id);
    if (isAlreadyMember) return false;
    const name = friend.display_name || friend.email.split('@')[0] || '';
    const username = friend.username || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || username.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <header style={S.header}>
      <div style={S.leftGroup}>
        <button
          onClick={() => useChatStore.getState().setActiveRoomId(null)}
          style={{
            ...S.iconBtn,
            marginRight: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Back"
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span style={{ ...S.materialIcon, color: '#adc6ff' }}>arrow_back</span>
        </button>
        <div style={S.leftCol}>
          <div style={S.titleRow}>
            {roomAvatar && (
              <img
                src={roomAvatar}
                alt={roomName}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginRight: 2,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            )}
            <span style={S.roomName}>{roomName}</span>
          </div>
          <p style={S.subtitle}>{roomDescription || 'Ekam Real-Time Secure Gateway'}</p>
        </div>
      </div>

      <div style={S.rightGroup}>
        {onlineCount > 0 && (
          <div style={S.onlineBadge}>
            <span style={S.onlineDot} />
            <span style={S.onlineText}>{onlineCount} online</span>
          </div>
        )}
        <button
          style={S.iconBtn}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          <span style={S.materialIcon}>search</span>
        </button>
        
        {/* Dropdown triggers for group settings */}
        {room?.type === 'group' && (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(prev => !prev)}
              style={S.iconBtn}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!isDropdownOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <span style={{ ...S.materialIcon, color: isDropdownOpen ? '#adc6ff' : 'rgba(194,198,214,0.5)' }}>more_vert</span>
            </button>
            {isDropdownOpen && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 90,
                  }}
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: 8,
                    background: '#0a0f1d',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                    zIndex: 100,
                    width: 140,
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setIsGroupInfoModalOpen(true);
                      setIsAddingMembers(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'transparent',
                      border: 'none',
                      color: '#e2e2e2',
                      textAlign: 'left',
                      fontSize: 13,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16, color: '#adc6ff' }}>info</span>
                    Group Info
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Group Info Modal */}
      {isGroupInfoModalOpen && (
        <div style={S.modalOverlay} onClick={() => setIsGroupInfoModalOpen(false)}>
          <div
            style={{
              ...S.modalContent,
              width: 440,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {isAddingMembers && (
                  <button
                    onClick={() => setIsAddingMembers(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#adc6ff',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22 }}>arrow_back</span>
                  </button>
                )}
                <h3 style={S.modalTitle}>{isAddingMembers ? 'Add Group Members' : 'Group Information'}</h3>
              </div>
              <button
                onClick={() => setIsGroupInfoModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(194,198,214,0.4)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 22 }}>close</span>
              </button>
            </div>

            {/* Modal Body */}
            {!isAddingMembers ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
                {/* Group Details Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                  {roomAvatar ? (
                    <img src={roomAvatar} alt={roomName} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 50%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 28, color: '#adc6ff' }}>groups</span>
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#e2e2e2' }}>{roomName}</h4>
                    <p style={{ fontSize: 12, color: 'rgba(194,198,214,0.5)', marginTop: 4 }}>{roomDescription || 'No description provided'}</p>
                  </div>
                </div>

                {/* Administrative and Invite triggers */}
                {(callerRole === 'admin' || callerRole === 'co-admin') && (
                  <button
                    onClick={() => {
                      setIsAddingMembers(true);
                      setSelectedFriendIds([]);
                      setSearchQuery('');
                    }}
                    style={{
                      background: 'rgba(77, 142, 255, 0.1)',
                      border: '1px solid rgba(77, 142, 255, 0.2)',
                      borderRadius: 8,
                      color: '#adc6ff',
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      marginBottom: 16,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(77, 142, 255, 0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(77, 142, 255, 0.1)'}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18 }}>person_add</span>
                    Add Group Members
                  </button>
                )}

                {/* Members List */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#adc6ff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Members ({members.length})</span>
                  </div>

                  <div style={{ maxHeight: 240, overflowY: 'auto' }} className="custom-scrollbar">
                    {loadingMembers ? (
                      <p style={{ fontSize: 12, color: 'rgba(194,198,214,0.4)', padding: '8px 0' }}>Loading members list...</p>
                    ) : members.length === 0 ? (
                      <p style={{ fontSize: 12, color: 'rgba(194,198,214,0.4)', padding: '8px 0' }}>No members in group.</p>
                    ) : (
                      members.map(m => {
                        const user = m.users || {};
                        const displayName = user.display_name || user.email?.split('@')[0] || 'Unknown User';
                        const username = user.username || '';
                        const avatar = user.avatar_url;

                        // Call permissions check
                        const isSelf = m.user_id === currentUserId;
                        const isTargetAdmin = m.role === 'admin';
                        const isTargetCoadmin = m.role === 'co-admin';

                        // Moderation permission checks
                        let canModerate = false;
                        if (!isSelf) {
                          if (callerRole === 'admin' && !isTargetAdmin) {
                            canModerate = true;
                          } else if (callerRole === 'co-admin' && !isTargetAdmin && !isTargetCoadmin) {
                            canModerate = true;
                          }
                        }

                        return (
                          <div key={m.user_id} style={S.memberItem}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              {avatar ? (
                                <img src={avatar} alt={displayName} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'rgba(194,198,214,0.7)', fontWeight: 600 }}>
                                  {displayName.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e2' }}>{displayName}</span>
                                  {m.is_muted && (
                                    <span style={{ ...S.badge, background: 'rgba(255, 77, 79, 0.1)', color: '#ff4d4f' }} title="Muted by moderator">Muted</span>
                                  )}
                                  {m.role === 'admin' && (
                                    <span style={{ ...S.badge, background: 'rgba(173, 198, 255, 0.1)', color: '#adc6ff' }}>Owner</span>
                                  )}
                                  {m.role === 'co-admin' && (
                                    <span style={{ ...S.badge, background: 'rgba(127, 255, 212, 0.1)', color: '#7fffd4' }}>Co-Admin</span>
                                  )}
                                </div>
                                {username && (
                                  <div style={{ fontSize: 10, color: 'rgba(194,198,214,0.4)', marginTop: 2 }}>@{username}</div>
                                )}
                              </div>
                            </div>

                            {/* Inline Mod buttons */}
                            {canModerate && (
                              <div style={{ display: 'flex', gap: 4 }}>
                                {/* Mute Toggle */}
                                <button
                                  onClick={() => handleMute(m.user_id, m.is_muted)}
                                  title={m.is_muted ? 'Unmute Member' : 'Mute Member'}
                                  style={S.modBtn}
                                  onMouseEnter={e => e.currentTarget.style.color = '#adc6ff'}
                                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(194,198,214,0.6)'}
                                >
                                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16 }}>
                                    {m.is_muted ? 'volume_up' : 'volume_off'}
                                  </span>
                                </button>

                                {/* Promote/Demote */}
                                {callerRole === 'admin' && (
                                  <button
                                    onClick={() => handlePromote(m.user_id, m.role)}
                                    title={isTargetCoadmin ? 'Demote to Member' : 'Promote to Co-Admin'}
                                    style={S.modBtn}
                                    onMouseEnter={e => e.currentTarget.style.color = '#7fffd4'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(194,198,214,0.6)'}
                                  >
                                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16 }}>
                                      {isTargetCoadmin ? 'keyboard_double_arrow_down' : 'keyboard_double_arrow_up'}
                                    </span>
                                  </button>
                                )}

                                {/* Transfer Ownership */}
                                {callerRole === 'admin' && (
                                  <button
                                    onClick={() => handleTransfer(m.user_id)}
                                    title="Transfer Ownership"
                                    style={S.modBtn}
                                    onMouseEnter={e => e.currentTarget.style.color = '#ffd700'}
                                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(194,198,214,0.6)'}
                                  >
                                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16 }}>swap_horiz</span>
                                  </button>
                                )}

                                {/* Kick */}
                                <button
                                  onClick={() => handleKick(m.user_id)}
                                  title="Kick Member"
                                  style={S.modBtn}
                                  onMouseEnter={e => { e.currentTarget.style.color = '#ff4d4f'; e.currentTarget.style.background = 'rgba(255,77,79,0.06)'; }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(194,198,214,0.6)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                                >
                                  <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 16 }}>person_remove</span>
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Leave Group Action */}
                <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleLeaveGroup}
                    style={{
                      background: 'rgba(255,77,79,0.08)',
                      border: '1px solid rgba(255,77,79,0.2)',
                      borderRadius: 8,
                      color: '#ff4d4f',
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,77,79,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,77,79,0.08)'}
                  >
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18 }}>logout</span>
                    Leave Group
                  </button>
                </div>
              </div>
            ) : (
              /* Add Group Members View */
              <form onSubmit={handleAddMembersSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto' }}>
                <input
                  type="text"
                  placeholder="Search friends by name or username..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    color: '#e2e2e2',
                    padding: '8px 12px',
                    fontSize: 13,
                    outline: 'none',
                    width: '100%',
                    boxSizing: 'border-box',
                    marginBottom: 12,
                  }}
                />

                {selectedFriendIds.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {selectedFriendIds.map(fid => {
                      const friend = friends.find(f => f.id === fid);
                      if (!friend) return null;
                      const name = friend.display_name || friend.email?.split('@')[0] || '';
                      return (
                        <div
                          key={fid}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            background: 'rgba(77, 142, 255, 0.1)',
                            border: '1px solid rgba(77, 142, 255, 0.2)',
                            borderRadius: 16,
                            padding: '4px 10px',
                            fontSize: 11,
                            color: '#adc6ff',
                          }}
                        >
                          <span>{name}</span>
                          <button
                            type="button"
                            onClick={() => toggleFriendSelection(fid)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#adc6ff',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: 0,
                            }}
                          >
                            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14 }}>close</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  style={{
                    maxHeight: 240,
                    overflowY: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: 6,
                    marginBottom: 16,
                  }}
                  className="custom-scrollbar"
                >
                  {nonMemberFriends.length === 0 ? (
                    <p style={{ padding: 16, textAlign: 'center', fontSize: 12, color: 'rgba(194,198,214,0.4)' }}>
                      No eligible friends to invite.
                    </p>
                  ) : (
                    nonMemberFriends.map(friend => {
                      const isSelected = selectedFriendIds.includes(friend.id);
                      const name = friend.display_name || friend.email?.split('@')[0] || '';
                      const username = friend.username || '';
                      const avatar = friend.avatar_url;

                      return (
                        <div
                          key={friend.id}
                          onClick={() => toggleFriendSelection(friend.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            background: isSelected ? 'rgba(77, 142, 255, 0.08)' : 'transparent',
                            transition: 'all 0.15s ease',
                            marginBottom: 2,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {avatar ? (
                              <img src={avatar} alt={name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'rgba(194,198,214,0.7)' }}>
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e2' }}>{name}</div>
                              {username && (
                                <div style={{ fontSize: 10, color: 'rgba(194,198,214,0.4)' }}>@{username}</div>
                              )}
                            </div>
                          </div>
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: isSelected ? '1px solid #4d8eff' : '1px solid rgba(255,255,255,0.2)',
                              background: isSelected ? '#4d8eff' : 'transparent',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {isSelected && (
                              <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14, color: '#00285d', fontWeight: 700 }}>check</span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setIsAddingMembers(false)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: '#e2e2e2',
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding || selectedFriendIds.length === 0}
                    style={{
                      background: '#4d8eff',
                      border: 'none',
                      borderRadius: 8,
                      color: '#00285d',
                      padding: '8px 16px',
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: (adding || selectedFriendIds.length === 0) ? 'not-allowed' : 'pointer',
                      opacity: (adding || selectedFriendIds.length === 0) ? 0.5 : 1,
                    }}
                  >
                    {adding ? 'Adding...' : `Add Selected (${selectedFriendIds.length})`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
