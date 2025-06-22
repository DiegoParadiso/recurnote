function DragHandle({ onDragStart, id }) {
  return (
    <div
      className="draggable-note absolute left-1 top-1/2 -translate-y-1/2 flex flex-col pl-1 gap-1.5 cursor-grab"
      draggable
      onDragStart={(e) => onDragStart(e, id)}
    >
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full" />
      ))}
    </div>
  );
}
export default DragHandle;
