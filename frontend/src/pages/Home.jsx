import { useState } from 'react';
import CircleLarge from '../components/CircleLarge/CircleLarge';
import HalfCircleSidebar from '../components/HalfCircleSidebar/HalfCircleSidebar';
import { Eye, EyeOff } from 'lucide-react';

export default function Home() {
  const [showSmall, setShowSmall] = useState(true);

  return (
    <div className="pt-3 sm:pt-0 w-screen min-h-[100dvh] bg-gray-100 flex items-center justify-center relative">
      <HalfCircleSidebar />

      {/* Contenedor de CircleLarge con botón flotante */}
      <div className="relative flex items-center justify-center">
        <CircleLarge showSmall={showSmall} />

        {/* Botón flotante a la derecha del círculo */}
        <button
          onClick={() => setShowSmall(!showSmall)}
          className="absolute right-[-25px] top-1/2 transform -translate-y-1/2 z-10 text-gray-300 hover:text-gray-600 transition"
        >
          {showSmall ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}