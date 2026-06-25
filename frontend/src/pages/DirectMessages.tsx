import React from 'react';

const DEMO_FRIENDS = [
  { name: 'Elena Vance', handle: '@elena_v', status: 'online', statusMsg: '"Working on this, don\'t disturb"' },
  { name: 'Marcus Thorne', handle: '@mthorne_dev', status: 'offline', statusMsg: 'Away for the weekend' },
  { name: 'Sarah Chen', handle: '@schen_studio', status: 'online', statusMsg: '"Designing the future of Ekam"' },
  { name: 'Aria Montgomery', handle: '@aria_m', status: 'online', statusMsg: '"In a meeting, back at 4 PM"', isFavorite: true },
  { name: 'Julian Vane', handle: '@jvane', status: 'offline', statusMsg: 'Last seen 3h ago' },
];

function Avatar({ name, size = 64 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '14px', flexShrink: 0,
        background: 'linear-gradient(135deg, rgba(77,142,255,0.2) 0%, rgba(173,198,255,0.1) 100%)',
        border: '1px solid rgba(173,198,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size / 3, fontWeight: 700, color: '#adc6ff',
      }}
    >
      {initials}
    </div>
  );
}

function PresenceGem({ status }: { status: string }) {
  return (
    <div
      style={{
        width: 12, height: 12, borderRadius: '50%',
        border: '1.5px solid #000',
        background: status === 'online'
          ? 'radial-gradient(circle at 30% 30%, #adc6ff 0%, #005ac2 100%)'
          : 'radial-gradient(circle at 30% 30%, #424754 0%, #1b1b1b 100%)',
        boxShadow: status === 'online' ? '0 0 10px rgba(173,198,255,0.4)' : 'none',
        animation: status === 'online' ? 'status-glow 3s infinite ease-in-out' : 'none',
      }}
    />
  );
}

export function DirectMessages() {
  return (
    <div
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', height: '100%',
        background: '#000', overflowY: 'auto', position: 'relative',
      }}
      className="custom-scrollbar"
    >
      {/* Atmospheric bg */}
      <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 600, height: 600, background: 'rgba(173,198,255,0.04)', borderRadius: '50%', filter: 'blur(130px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: '-5%', width: 500, height: 500, background: 'rgba(173,198,255,0.03)', borderRadius: '50%', filter: 'blur(110px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, padding: '40px 48px', maxWidth: 1280 }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: '#e2e2e2', marginBottom: 8 }}>
            Connected Friends
          </h1>
          <p style={{ color: 'rgba(194,198,214,0.7)', fontSize: 15, maxWidth: 480, lineHeight: 1.6 }}>
            Manage your network and start seamless real-time collaborations.
          </p>
        </div>

        {/* Add Friend */}
        <div style={{ marginBottom: 40 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
            background: '#adc6ff', color: '#002e6a', borderRadius: 12, border: 'none',
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(173,198,255,0.2)',
            transition: 'all 0.2s ease',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
            Add Friend
          </button>
        </div>

        {/* Friends Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 48 }}>
          {DEMO_FRIENDS.map(friend => (
            <div
              key={friend.name}
              style={{
                background: friend.isFavorite ? 'rgba(173,198,255,0.05)' : 'rgba(31,31,31,0.4)',
                backdropFilter: 'blur(20px)',
                border: friend.isFavorite ? '1px solid rgba(173,198,255,0.2)' : '1px solid rgba(255,255,255,0.05)',
                borderRadius: 16, padding: 20, cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(173,198,255,0.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = friend.isFavorite ? 'rgba(173,198,255,0.05)' : 'rgba(31,31,31,0.4)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ position: 'relative' }}>
                  <Avatar name={friend.name} size={60} />
                  <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
                    <PresenceGem status={friend.status} />
                  </div>
                </div>
                {friend.isFavorite ? (
                  <span style={{
                    fontSize: 9, background: 'rgba(173,198,255,0.2)', color: '#adc6ff',
                    padding: '4px 8px', borderRadius: 8, fontWeight: 700, letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                  }}>Favorite</span>
                ) : (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(194,198,214,0.3)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>more_horiz</span>
                  </button>
                )}
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#e2e2e2', marginBottom: 2, letterSpacing: '-0.01em' }}>{friend.name}</h3>
              <p style={{ fontSize: 12, color: friend.status === 'online' ? 'rgba(173,198,255,0.7)' : 'rgba(194,198,214,0.4)', fontWeight: 600, marginBottom: 8 }}>{friend.handle}</p>
              <p style={{ fontSize: 12, color: friend.status === 'online' ? 'rgba(194,198,214,0.8)' : 'rgba(194,198,214,0.5)', fontStyle: 'italic', lineHeight: 1.5 }}>{friend.statusMsg}</p>
            </div>
          ))}
        </div>

        {/* Suggested */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <span className="material-symbols-outlined" style={{ color: '#adc6ff', fontSize: 20 }}>auto_awesome</span>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#e2e2e2', letterSpacing: '-0.01em' }}>Suggested Connects</h2>
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Alex Rivera', 'Jordan Lee'].map(name => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: 16,
                background: 'rgba(31,31,31,0.4)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16,
                minWidth: 260, cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}>
                <Avatar name={name} size={44} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#e2e2e2' }}>{name}</p>
                  <p style={{ fontSize: 11, color: 'rgba(194,198,214,0.5)', fontWeight: 500 }}>Shared projects: 2</p>
                </div>
                <button style={{
                  width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: 'rgba(173,198,255,0.1)', color: '#adc6ff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DirectMessages;
