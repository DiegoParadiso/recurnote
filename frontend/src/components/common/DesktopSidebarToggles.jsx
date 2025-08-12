export default function DesktopSidebarToggles({ onToggleLeft, onToggleRight, isLeftSidebarPinned, isRightSidebarPinned }) {
  return (
    <>
      {/* Toggle derecho - pegado al borde derecho */}
      <button
        onClick={onToggleRight}
        aria-label="Toggle right sidebar"
        className="fixed right-0 z-20 cursor-pointer flex items-center justify-center w-8 h-8 text-gray-300 animate-[slideLeftRight_2s_ease-in-out_infinite] hidden sm:flex"
        style={{
          top: '50vh',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          opacity: isRightSidebarPinned ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Toggle izquierdo - pegado al borde izquierdo */}
      <button
        onClick={onToggleLeft}
        aria-label="Toggle left sidebar"
        className="fixed left-0 z-20 cursor-pointer flex items-center justify-center w-8 h-8 text-gray-300 animate-[slideRightLeft_2s_ease-in-out_infinite] hidden sm:flex"
        style={{
          top: '50vh',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          opacity: isLeftSidebarPinned ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <style>{`
        @keyframes slideLeftRight {
          0%, 100% { transform: translateX(0) translateY(-50%); }
          50% { transform: translateX(-6px) translateY(-50%); }
        }
        @keyframes slideRightLeft {
          0%, 100% { transform: translateX(0) translateY(-50%); }
          50% { transform: translateX(6px) translateY(-50%); }
        }
      `}</style>
    </>
  );
}
