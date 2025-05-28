import { useState, useEffect, useRef } from 'react';

export default function NoteItem({ item, onDragStart, onUpdate }) {
  const [text, setText] = useState(item.content || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.minHeight = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      style={{
        position: 'absolute',
        left: item.x,
        top: item.y,
        maxWidth: '240px',
        maxHeight: '180px',
        minWidth: '120px',
      }}
      className="relative rounded-md p-2 cursor-grab transition-all 
        flex flex-col justify-between border bg-neutral-100 backdrop-blur-md 
      "
    >
      <div className="absolute left-1 top-1/2 -translate-y-1/2 flex flex-col pl-1 gap-1.5 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-[6px] h-[6px] bg-neutral-400/30 rounded-full" />
        ))}
      </div>

      <textarea
        ref={textareaRef}
        className="
          w-full
          min-w-full
          max-w-full
          pl-6 pr-2 pt-1
          text-xs
          bg-transparent
          outline-none
          text-gray-800
          resize
          rounded-md
          overflow-auto
        "
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          onUpdate(item.id, e.target.value);
        }}
        style={{
          minHeight: textareaRef.current?.scrollHeight
            ? `${textareaRef.current.scrollHeight}px`
            : '40px', // fallback
          resize: 'both',
        }}
      />
    </div>
  );
}