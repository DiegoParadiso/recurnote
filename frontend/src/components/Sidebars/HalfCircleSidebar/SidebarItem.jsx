import { CheckSquare } from 'lucide-react';
import './SidebarItem.css';

export default function SidebarItem({ item }) {
  const base = 'sidebar-item';

  switch (item.label) {
    case 'nota':
      return (
        <div className={`${base} sidebar-item-nota`}>
          <div className="dots">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="dot" />
            ))}
          </div>
        </div>
      );

case 'Evento':
  return (
    <div className={`${base} sidebar-item-evento`}>
      <div className="top-line" />
      <div className="row">
        {[...Array(4)].map((_, i) => (
          <div key={`row1-${i}`} className="block" />
        ))}
      </div>
      <div className="row">
        {[...Array(3)].map((_, i) => (
          <div key={`row2-${i}`} className="block light" />
        ))}
      </div>
    </div>
  );


    case 'Tarea':
      return (
        <div className={`${base} sidebar-item-tarea`}>
          <div className="flex flex-col gap-1 ml-1">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="check-line">
                <CheckSquare className="text-neutral-400" size={12} />
                <div className="bar" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'Archivo':
      return (
        <div className={`${base} sidebar-item-archivo`}>
          <div className="top-bar" />
          <div className="tab" />
          <div className="separator" />
          <div className="flex justify-center items-center grow pt-4" />
        </div>
      );

    default:
      return null;
  }
}
