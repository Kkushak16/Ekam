import React from 'react';

export function DirectMessages() {
  return (
    <div style={{ padding: '32px', color: 'var(--text-primary)' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>💬 Direct Messages</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Secure, direct peer-to-peer conversation channels.</p>
      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>No active private conversations found.</div>
    </div>
  );
}

export default DirectMessages;
