import React from 'react';

export default function RefreshButton({ 
  onClick, 
  loading, 
  className = "",
  size = "w-5 h-5",
  isDesktop = false
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2 transition-colors ${className}`}
      style={{
        color: isDesktop ? 'var(--color-text-primary)' : 'var(--color-neutral-darker)',
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
      title={loading ? "Sincronizando..." : "Sincronizado"}
      disabled={loading}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.color = isDesktop ? 'var(--color-text-primary)' : 'var(--color-muted)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = isDesktop ? 'var(--color-text-primary)' : 'var(--color-neutral-darker)';
      }}
    >
      {loading ? (
        <svg 
          className={`${size} animate-spin`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      ) : (
        <svg 
          className={`${size}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          style={{ color: isDesktop ? 'var(--color-text-primary)' : 'var(--color-neutral-darker)' }}
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      )}
    </button>
  );
}
