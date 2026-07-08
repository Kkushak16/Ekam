import React, { useState, useEffect } from 'react';
import ChatPage from '../components/ChatPage';
import { apiClient } from '../api/queries';
import { useChatStore } from '../store/chatStore';

const S: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: '100%',
    width: '100%',
    background: '#0a0a0a',
    overflow: 'hidden',
  },
  middlePane: {
    width: 260,
    background: 'rgba(15, 15, 15, 0.4)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
  },
  paneHeader: {
    height: 56,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'between',
    padding: '0 16px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  paneTitle: {
    fontSize: 14,
    fontWeight: 750,
    letterSpacing: '0.1em',
    color: '#adc6ff',
    textTransform: 'uppercase',
  },
  createBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'rgba(194, 198, 214, 0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderRadius: 6,
    transition: 'all 0.2s',
  },
  groupList: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px 8px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  groupItem: {
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
  },
  groupItemActive: {
    background: 'rgba(173, 198, 255, 0.08)',
    color: '#adc6ff',
    border: '1px solid rgba(173, 198, 255, 0.15)',
  },
  chatPane: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    position: 'relative',
    minWidth: 0,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    color: 'rgba(194, 198, 214, 0.4)',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modalContent: {
    width: 400,
    background: '#131313',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 24,
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#e2e2e2',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 40,
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10,
    color: '#e2e2e2',
    fontSize: 14,
    padding: '0 12px',
    outline: 'none',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    marginBottom: 20,
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btnCancel: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: 'rgba(194,198,214,0.6)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
  },
  btnSubmit: {
    padding: '8px 16px',
    background: '#4d8eff',
    border: 'none',
    borderRadius: 8,
    color: '#00285d',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
    boxShadow: '0 0 12px rgba(77,142,255,0.3)',
  },
  hashIcon: {
    fontFamily: "'Material Symbols Outlined'",
    fontSize: 18,
    color: 'rgba(194, 198, 214, 0.4)',
  },
  hashIconActive: {
    color: '#adc6ff',
  }
};

export function parseGroupDescription(rawDescription: string | null) {
  if (!rawDescription) return { avatarUrl: '', description: '' };
  const match = rawDescription.match(/^\[avatar:([^\]]+)\]\s*(.*)$/);
  if (match) {
    return { avatarUrl: match[1], description: match[2] };
  }
  return { avatarUrl: '', description: rawDescription };
}

export function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedGroupId = useChatStore(state => state.activeRoomId) || '';
  const setSelectedGroupId = useChatStore(state => state.setActiveRoomId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchGroups = React.useCallback(async () => {
    try {
      const { data } = await apiClient.get('/api/rooms/groups');
      const preGroupIds = [
        'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a',
        'e8a36d7d-5a9e-4e4f-bbfb-dc874e4c278b',
        'f8a36d7d-5a9e-4e4f-bbfb-dc874e4c278c'
      ];
      const filtered = (data.rooms || []).filter((r: any) => !preGroupIds.includes(r.id));
      setGroups(filtered);
      
      const isActiveGroup = filtered.some((g: any) => g.id === selectedGroupId);
      if (!isActiveGroup) {
        if (selectedGroupId === 'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a' && filtered.length > 0) {
          setSelectedGroupId(filtered[0].id);
        } else if (selectedGroupId !== '') {
          setSelectedGroupId('');
        }
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedGroupId, setSelectedGroupId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    const handleSyncEvent = () => {
      fetchGroups();
    };
    window.addEventListener('room-membership-changed', handleSyncEvent);
    window.addEventListener('friendship-changed', handleSyncEvent);
    return () => {
      window.removeEventListener('room-membership-changed', handleSyncEvent);
      window.removeEventListener('friendship-changed', handleSyncEvent);
    };
  }, [fetchGroups]);

  useEffect(() => {
    if (isModalOpen) {
      apiClient.get('/api/friends')
        .then(({ data }) => {
          const mapped = (data.friends || []).map((u: any) => ({
            id: u.id,
            name: u.display_name || u.email.split('@')[0],
            username: u.username || '',
            avatarUrl: u.avatar_url || ''
          }));
          setFriends(mapped);
        })
        .catch(err => console.error('Failed to fetch friends:', err));
    }
  }, [isModalOpen]);

  const closeModal = () => {
    setIsModalOpen(false);
    setNewGroupName('');
    setDescription('');
    setAvatarUrl('');
    setSearchQuery('');
    setSelectedFriendIds([]);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await apiClient.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAvatarUrl(data.secure_url);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const toggleFriendSelection = (friendId: string) => {
    setSelectedFriendIds(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const finalDescription = avatarUrl
        ? `[avatar:${avatarUrl}] ${description.trim()}`
        : description.trim();
      const { data } = await apiClient.post('/api/rooms/groups', {
        name: newGroupName.trim(),
        description: finalDescription,
        userIds: selectedFriendIds
      });
      closeModal();
      await fetchGroups();
      if (data.room) {
        setSelectedGroupId(data.room.id);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={S.container}>
      {/* Middle Pane: Groups List */}
      <div style={S.middlePane}>
        <div style={S.paneHeader}>
          <span style={S.paneTitle}>Group Channels</span>
          <button
            onClick={() => setIsModalOpen(true)}
            style={S.createBtn}
            title="Create Group"
            onMouseEnter={e => { e.currentTarget.style.color = '#adc6ff'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(194, 198, 214, 0.4)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 20 }}>add</span>
          </button>
        </div>

        <div style={S.groupList} className="custom-scrollbar">
          {loading ? (
            <p style={{ padding: '0 12px', color: 'rgba(194,198,214,0.4)', fontSize: 12 }}>Loading groups...</p>
          ) : groups.length === 0 ? (
            <p style={{ padding: '0 12px', color: 'rgba(194,198,214,0.4)', fontSize: 12 }}>No groups found</p>
          ) : (
            groups.map(group => {
              const isActive = selectedGroupId === group.id;
              const { avatarUrl: groupAvatar } = parseGroupDescription(group.description);
              return (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroupId(group.id)}
                  style={{
                    ...S.groupItem,
                    ...(isActive ? S.groupItemActive : {}),
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#e2e2e2';
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(194, 198, 214, 0.6)';
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  {groupAvatar ? (
                    <img
                      src={groupAvatar}
                      alt={group.name}
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                  ) : (
                    <span style={{
                      ...S.hashIcon,
                      ...(isActive ? S.hashIconActive : {}),
                    }}>
                      tag
                    </span>
                  )}
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {group.name}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Pane: Active Group Chat */}
      <div style={S.chatPane}>
        {selectedGroupId ? (
          <ChatPage roomId={selectedGroupId} />
        ) : (
          <div style={S.emptyState}>
            <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 48, marginBottom: 16 }}>forum</span>
            <p style={{ fontSize: 14, fontWeight: 600 }}>Select a group channel to start chatting</p>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <div style={S.modalOverlay} onClick={closeModal}>
          <div
            style={{
              ...S.modalContent,
              width: 440,
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
            className="custom-scrollbar"
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ ...S.modalTitle, marginBottom: 20 }}>Create Group Channel</h3>
            <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Photo Upload Section */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px dashed rgba(255,255,255,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                  onClick={() => document.getElementById('avatar-input')?.click()}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Group Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : uploadingAvatar ? (
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 24, color: '#adc6ff', animation: 'spin 1s linear infinite' }}>autorenew</span>
                  ) : (
                    <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 24, color: 'rgba(194,198,214,0.4)' }}>add_a_photo</span>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar-input')?.click()}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#e2e2e2',
                      padding: '6px 12px',
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Choose Group Photo
                  </button>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    style={{ display: 'none' }}
                  />
                  <p style={{ fontSize: 11, color: 'rgba(194,198,214,0.4)', marginTop: 4 }}>Optional, PNG or JPG format</p>
                </div>
              </div>

              {/* Group Name & Description */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#adc6ff', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Group Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Design Team"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  style={{ ...S.input, marginBottom: 0 }}
                  required
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#adc6ff', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Description</label>
                <input
                  type="text"
                  placeholder="What is this channel about?"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  style={{ ...S.input, marginBottom: 0 }}
                />
              </div>

              {/* Friends List Selection */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#adc6ff', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Select Friends ({selectedFriendIds.length} selected)
                </label>
                <input
                  type="text"
                  placeholder="Search friends by name or username..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ ...S.input, marginBottom: 8 }}
                />
                
                {/* Horizontal selected friends preview */}
                {selectedFriendIds.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, padding: '4px 0' }}>
                    {selectedFriendIds.map(fid => {
                      const friend = friends.find(f => f.id === fid);
                      if (!friend) return null;
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
                          <span>{friend.name}</span>
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
                    maxHeight: 160,
                    overflowY: 'auto',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.02)',
                    padding: 6,
                  }}
                  className="custom-scrollbar"
                >
                  {filteredFriends.length === 0 ? (
                    <p style={{ padding: 12, textAlign: 'center', fontSize: 12, color: 'rgba(194,198,214,0.4)' }}>
                      {friends.length === 0 ? 'No friends found. Add friends first!' : 'No friends match search query.'}
                    </p>
                  ) : (
                    filteredFriends.map(friend => {
                      const isSelected = selectedFriendIds.includes(friend.id);
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
                          onMouseEnter={e => {
                            if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                          }}
                          onMouseLeave={e => {
                            if (!isSelected) e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {friend.avatarUrl ? (
                              <img src={friend.avatarUrl} alt={friend.name} style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 50%)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 10,
                                  fontWeight: 700,
                                  color: '#adc6ff',
                                }}
                              >
                                {friend.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e2e2' }}>{friend.name}</div>
                              {friend.username && (
                                <div style={{ fontSize: 10, color: 'rgba(194,198,214,0.4)' }}>@{friend.username}</div>
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
              </div>

              {/* Action Buttons */}
              <div style={{ ...S.modalActions, marginTop: 12 }}>
                <button
                  type="button"
                  onClick={closeModal}
                  style={S.btnCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || uploadingAvatar}
                  style={{
                    ...S.btnSubmit,
                    opacity: (creating || uploadingAvatar) ? 0.5 : 1,
                    cursor: (creating || uploadingAvatar) ? 'not-allowed' : 'pointer',
                  }}
                >
                  {creating ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupsPage;
