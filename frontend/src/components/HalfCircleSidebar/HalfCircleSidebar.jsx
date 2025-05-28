import { useState } from 'react';
import { Calendar, CheckSquare, Lightbulb, FileText } from 'lucide-react';

export default function HalfCircleSidebar() {
  const [items] = useState([
    { id: 1, label: 'nota' },
    { id: 2, label: 'Tarea' },
    { id: 3, label: 'Evento' },
    { id: 4, label: 'Idea' },
    { id: 5, label: 'Archivo' },
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
            <div className="absolute left-0 top-0 h-full w-[5px] bg-neutral-300 rounded-l-md" />
            <div className="flex items-center justify-center grow">
              <Calendar size={20} className="text-neutral-600" />
            </div>
          </div>
        );

      case 'Tarea':
        return (
          <div className={`${base} border-neutral-300 hover:bg-neutral-100`}>
            <div className="flex flex-col gap-1 ml-1">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 text-neutral-600 text-xs">
                  <CheckSquare size={12} />
                  <div className="w-full h-[6px] bg-neutral-300 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        );

      case 'Idea':
        return (
          <div className={`${base} border-neutral-300 hover:bg-neutral-100`}>
            {/* Rombo arriba a la derecha */}
            <div className="absolute top-0 right-0 w-4 h-4 rotate-45 origin-top-left" />
            <div className="flex justify-center items-center grow">
              <Lightbulb size={20} />
            </div>
          </div>
        );

      case 'Archivo':
        return (
          <div className={`${base} border-neutral-300 hover:bg-neutral-100`}>
            <div className="border-t-2 border-neutral-300 w-full absolute top-0 left-0" />
            <div className="border-t-2 border-neutral-300 w-full absolute top-[6px] left-0" />
            <div className="flex justify-center items-center grow">
              <FileText size={18} className="text-neutral-700" />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
      <div className="w-[300px] h-[600px] border border-neutral-700 rounded-r-full flex flex-col items-start justify-center gap-4 overflow-auto p-10">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/plain', item.label);
              e.dataTransfer.setData('source', 'sidebar');
            }}
          >
            {renderItem(item)}
          </div>
        ))}
      </div>
    </div>
  );
}
