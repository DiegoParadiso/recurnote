import { useState } from 'react';
import { CheckSquare } from 'lucide-react';

export default function HalfCircleSidebar() {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Archivo' },
  ]);

  const base =
    'relative w-[120px] h-[70px] rounded-md p-2 pl-2 cursor-grab transition-all flex flex-col justify-between border';

  const renderItem = (item) => {
    switch (item.label) {
      case 'nota':
        return (
          <div className={`${base} border-neutral-300 hover:bg-neutral-100`}>
            <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col pl-1 gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full" />
              ))}
            </div>
          </div>
        );

      case 'Evento':
        return (
          <div className={`${base} border-neutral-300 hover:bg-neutral-100`}>
            <div className="border-t-2 border-neutral-300 w-full absolute top-[9px] left-0" />
            <div className="flex flex-col items-center justify-center w-full h-full gap-[6px] p-2 pt-4">
              <div className="flex pl-0.5 gap-[6px] w-full items-start">
                {[...Array(4)].map((_, i) => (
                  <div key={`top-${i}`} className="w-[16px] h-[16px] bg-neutral-300 rounded-sm" />
                ))}
              </div>
              <div className="flex pl-0.5 gap-[6px] items-start w-full">
                {[...Array(3)].map((_, i) => (
                  <div key={`bottom-${i}`} className="w-[16px] h-[16px] bg-neutral-200 rounded-sm" />
                ))}
              </div>
            </div>
          </div>
        );

      case 'Tarea':
        return (
          <div className={`${base} border-neutral-300 hover:bg-neutral-100`}>
            <div className="flex flex-col gap-1 ml-1">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-neutral-600 text-xs">
                  <CheckSquare className='text-neutral-400' size={12} />
                  <div className="w-full h-[6px] bg-neutral-300 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'Archivo':
        return (
          <div className={`${base} border border-neutral-300 hover:bg-neutral-100 relative`}>
            <div className="border-t-2 border-neutral-200 w-[80%] absolute top-[24px] left-0" />
            <div className="absolute top-0 left-0 h-[16px] w-[40%] bg-neutral-200 rounded-t-sm" />
            <div className="absolute top-[16px] left-0 w-full border-t border-neutral-300" />
            <div className="flex justify-center items-center grow pt-4" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed top-0 left-0 h-screen w-[30px] group z-50">
      {/* Hover zone invisible */}
      <div className="absolute left-0 top-0 h-full w-[30px] z-10" />

      {/* Sidebar animado */}
      <div className="absolute left-[-270px] top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out group-hover:left-0">
        <div className="w-[300px] h-[600px] border border-neutral-700 rounded-r-full flex flex-col items-start justify-center gap-4 overflow-auto p-16 bg-neutral">
          {items.map((item) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', item.label);
                e.dataTransfer.setData('label', item.label);
                e.dataTransfer.setData('source', 'sidebar');
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}