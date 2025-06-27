function DragHandle({ onDragStart, id, children }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id)}
    >
      {children}
    </div>
  );
}
export default DragHandle;
