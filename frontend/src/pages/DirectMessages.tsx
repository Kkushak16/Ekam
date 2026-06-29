import React, { useState, useEffect } from 'react';
import { useChatStore } from '../store/chatStore';
import { apiClient } from '../api/queries';

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
export function DirectMessages() {
  const username = useChatStore(state => state.username);
  const [searchQuery, setSearchQuery] = useState('');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<any | null>(null);

  const fetchFriends = async () => {
    try {
      const { data } = await apiClient.get('/api/friends');
      const mapped = data.friends.map((u: any) => ({
        id: u.id,
        name: u.display_name || u.email.split('@')[0],
        handle: `@${u.username || (u.display_name ? u.display_name.toLowerCase().replace(/\s+/g, '_') : u.email.split('@')[0])}`,
        email: u.email,
        status: u.status === 'online' ? 'online' : 'offline',
        statusMsg: u.status === 'online' ? 'Active now' : 'Offline',
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

  useEffect(() => {
    fetchFriends();
  }, []);

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

  const handleAddFriend = async (friendId: string) => {
    setAddingFriendId(friendId);
    try {
      await apiClient.post('/api/friends', { friend_id: friendId });
      await fetchFriends();
      // Remove from search results
      setSearchResults(prev => prev.filter(u => u.id !== friendId));
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add friend');
    } finally {
      setAddingFriendId(null);
    }
  };

  const hasFriends = friends.length > 0;

  const filteredFriends = friends.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          {['notifications', 'settings'].map(icon => (
            <button key={icon} style={{
              width: 36, height: 36, borderRadius: 10, border: 'none',
              background: 'transparent', cursor: 'pointer', color: 'rgba(194,198,214,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s ease',
              fontFamily: "'Material Symbols Outlined'", fontSize: 20,
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >{icon}</button>
          ))}
          {/* User avatar */}
          <div style={{
            width: 34, height: 34, borderRadius: 10, marginLeft: 4,
            background: 'linear-gradient(135deg, #1a2744 0%, #2a3f6e 100%)',
            border: '1px solid rgba(173,198,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#adc6ff', cursor: 'pointer',
          }}>
            {(username || 'U').slice(0, 1).toUpperCase()}
          </div>
          <span style={{ fontSize: 13, color: 'rgba(194,198,214,0.7)', fontWeight: 600, marginLeft: 4 }}>
            {username || 'User'}
          </span>
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
            <button
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
                            onClick={(e) => { e.stopPropagation(); handleAddFriend(user.id); }}
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
                            {addingFriendId === user.id ? 'Adding...' : (
                              <>
                                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 14 }}>person_add</span>
                                Add Friend
                              </>
                            )}
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
              <button style={{
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
          )}
        </div>
      </div>

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
            </div>

            {/* Actions */}
            {friends.some(f => f.id === selectedUserProfile.id) ? (
              <button style={{
                width: '100%', padding: '12px 0', borderRadius: 12, border: 'none',
                background: 'rgba(173,198,255,0.1)', color: '#adc6ff',
                fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                cursor: 'default'
              }}>
                <span style={{ fontFamily: "'Material Symbols Outlined'", fontSize: 18 }}>check</span>
                Already Friends
              </button>
            ) : (
              <button
                onClick={() => {
                  handleAddFriend(selectedUserProfile.id);
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
    </div>
  );
}

export default DirectMessages;
