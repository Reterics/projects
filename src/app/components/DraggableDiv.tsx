import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  RefObject,
} from 'react';

export interface DraggableDivProps {
  ref: RefObject<HTMLDivElement | null>;
  pos: RefObject<{x: number; y: number}>;
  handle: string;
  className?: string;
  children?: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
}

export default function DraggableDiv({
  ref,
  pos,
  handle,
  onClick,
  className,
  children,
}: Readonly<DraggableDivProps>) {
  const [dragging, setDragging] = useState(false);
  const offsetRef = useRef({x: 0, y: 0});

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (e.button !== 0) return;

      const rect = ref.current?.getBoundingClientRect();

      if (rect) {
        offsetRef.current.x = e.pageX - pos.current.x;
        offsetRef.current.y = e.pageY - pos.current.y;
      }

      setDragging(true);

      if (onClick) {
        onClick(e);
      }
      // Prevent text selection or default actions
      e.preventDefault();
    },
    [onClick, pos, ref]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!dragging) return;

      const newX = e.pageX - offsetRef.current.x;
      const newY = e.pageY - offsetRef.current.y;

      if (ref.current) {
        ref.current.style.transform = `translate(${newX}px, ${newY}px)`;
      }
    };

    const handleMouseUp = () => {
      if (dragging) {
        setDragging(false);

        const transform = ref.current?.style.transform;
        const match = transform?.match(
          /translate\(([-0-9.]+)px,\s*([-0-9.]+)px\)/
        );
        if (match) {
          pos.current.x = parseFloat(match[1]);
          pos.current.y = parseFloat(match[2]);
        }

        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, pos, ref]);

  useEffect(() => {
    if (handle && ref.current) {
      const node = ref.current.querySelector(handle);
      if (node) {
        node.addEventListener('mousedown', handleMouseDown as EventListener);

        return () => {
          node.removeEventListener(
            'mousedown',
            handleMouseDown as EventListener
          );
        };
      }
    }
  }, [handle, handleMouseDown, ref]);

  return (
    <div
      className={'absolute select-none ' + (className ?? '')}
      ref={ref}
      style={{
        transform: `translate(${pos.current.x}px, ${pos.current.y}px)`,
        cursor: dragging ? 'grabbing' : undefined,
      }}
    >
      {children}
    </div>
  );
}
