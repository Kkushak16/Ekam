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

export function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedGroupId = useChatStore(state => state.activeRoomId) || '';
  const setSelectedGroupId = useChatStore(state => state.setActiveRoomId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchGroups = async () => {
    try {
      const { data } = await apiClient.get('/api/rooms/groups');
      const preGroupIds = [
        'da3c6d7d-5a9e-4e4f-bbfb-dc874e4c278a',
        'e8a36d7d-5a9e-4e4f-bbfb-dc874e4c278b',
        'f8a36d7d-5a9e-4e4f-bbfb-dc874e4c278c'
      ];
      const filtered = (data.rooms || []).filter((r: any) => !preGroupIds.includes(r.id));
      setGroups(filtered);
      
      const isActiveGroup = filtered.some(g => g.id === selectedGroupId);
      if (!isActiveGroup) {
        if (filtered.length > 0) {
          setSelectedGroupId(filtered[0].id);
        } else {
          setSelectedGroupId('');
        }
      }
    } catch (err) {
      console.error('Failed to fetch groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setCreating(true);
    try {
      const { data } = await apiClient.post('/api/rooms/groups', { name: newGroupName });
      setNewGroupName('');
      setIsModalOpen(false);
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
                  <span style={{
                    ...S.hashIcon,
                    ...(isActive ? S.hashIconActive : {}),
                  }}>
                    tag
                  </span>
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
        <div style={S.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div style={S.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Create Group Channel</h3>
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="e.g. Design Team"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                style={S.input}
                autoFocus
              />
              <div style={S.modalActions}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={S.btnCancel}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  style={S.btnSubmit}
                >
                  {creating ? 'Creating...' : 'Create Channel'}
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
