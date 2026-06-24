import React from 'react';

export function LoadingOlderSkeleton() {
  return (
    <div 
      className="loading-older-skeleton" 
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        color: 'var(--text-secondary)',
        gap: '8px'
      }}
    >
      <div 
        className="spinner" 
        style={{
          border: '2px solid var(--border-color)',
          borderTop: '2px solid var(--bg-bubble-me)',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          animation: 'spin 1s linear infinite'
        }} 
      />
      <span style={{ fontSize: '14px' }}>Loading older messages…</span>
    </div>
  );
}

export default LoadingOlderSkeleton;
