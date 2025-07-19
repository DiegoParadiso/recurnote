import { useState } from 'react';
import CircleLarge from '../components/CircleLarge/CircleLarge';
import HalfCircleSidebar from '../components/HalfCircleSidebar/HalfCircleSidebar';
import { Eye, EyeOff } from 'lucide-react';
import HalfCircleDayView from '../components/HalfCircleDayView/HalfCircleDayView';

export default function Home() {
  const [showSmall, setShowSmall] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [showRightSidebar, setShowRightSidebar] = useState(true);

  return (
    <div className="pt-3 sm:pt-0 w-screen min-h-[100dvh] bg-gray-100 flex items-center justify-center relative">

      <HalfCircleSidebar />

      <div className="relative flex items-center justify-center">
        <CircleLarge
          showSmall={showSmall}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
        />

        <button
          onClick={() => setShowSmall(!showSmall)}
          className="absolute right-[-25px] top-1/2 transform -translate-y-1/2 z-10 text-gray-300 hover:text-gray-600 transition"
        >
          {showSmall ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showRightSidebar && <HalfCircleDayView selectedDay={selectedDay} />}

      {/* Flecha animada */}
      <button
        onClick={() => setShowRightSidebar((v) => !v)}
        aria-label="Toggle right sidebar"
        className="fixed right-0 z-20 cursor-pointer flex items-center justify-center w-8 h-8 text-gray-300 animate-[slideLeftRight_2s_ease-in-out_infinite]"
        style={{
          top: '50vh',
          transform: 'translateY(-50%)',
          background: 'transparent',
          border: 'none',
          padding: 0,
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
          className="w-6 h-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <style>{`
        @keyframes slideLeftRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(-6px); }
        }
      `}</style>
    </div>
  );
}
