import { useEffect } from 'react';

export default function useAutoScrollOnHover(ref, isHoveringTop, isHoveringBottom, scrollSpeed = 3) {
  useEffect(() => {
    let animationFrameId;

    function scrollStep() {
      if (!ref.current) return;
      const el = ref.current;
      const maxScroll = el.scrollHeight - el.clientHeight;

      if (isHoveringBottom && el.scrollTop < maxScroll) {
        el.scrollTop = Math.min(el.scrollTop + scrollSpeed, maxScroll);
      } else if (isHoveringTop && el.scrollTop > 0) {
        el.scrollTop = Math.max(el.scrollTop - scrollSpeed, 0);
      } else {
        animationFrameId = null;
        return;
      }
      animationFrameId = requestAnimationFrame(scrollStep);
    }

    if (isHoveringTop || isHoveringBottom) {
      animationFrameId = requestAnimationFrame(scrollStep);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [ref, isHoveringTop, isHoveringBottom, scrollSpeed]);
}
