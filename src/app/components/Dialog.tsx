import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Rnd} from 'react-rnd';
import {BsCopy, BsDashLg, BsSquare, BsXLg} from 'react-icons/bs';

export interface DialogProps {
  title?: string;
  initialWidth?: number;
  initialHeight?: number;
  initialX?: number;
  initialY?: number;
  onClose?: () => void;
  children?: React.ReactNode;
}

export const titleBarClasses = `
    flex items-center justify-between
    bg-gradient-to-r from-gray-300 to-gray-100
    border-b border-gray-300
    cursor-move
    select-none
  `;

export const windowClasses = `
    border border-gray-400
    shadow-lg
    bg-gray-50
    text-black
    flex flex-col
  `;

const minimizeButtonClasses = `
    w-6 h-6 flex items-end justify-center
    hover:bg-gray-200
    cursor-pointer p-1
  `;
const maximizeButtonClasses = `
    w-6 h-6 flex items-center justify-center
    hover:bg-gray-200
    cursor-pointer p-1.5
  `;
export const controlButtonClasses = `
    w-6 h-6 flex items-center justify-center
    hover:bg-gray-200
    cursor-pointer p-1
  `;

export default function Dialog({
  title = 'Untitled',
  initialWidth = 400,
  initialHeight = 300,
  initialX = 0,
  initialY = 0,
  onClose,
  children,
}: Readonly<DialogProps>) {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const dialogRef = useRef<HTMLDivElement>(null);
  const posRef = useRef<{x: number; y: number}>({
    x: initialX,
    y: initialY,
  });
  const previous = useRef<{
    position: {x: number; y: number};
    width: number;
    height: number;
  }>({
    position: posRef.current,
    width: width,
    height: height,
  });

  const updatePrevious = useCallback(() => {
    if (previous.current) {
      previous.current = {
        position: posRef.current,
        width: width,
        height: height,
      };
    }
  }, [height, width]);

  const parent = dialogRef.current?.parentElement;
  const isMinimized = height < 33 && width < 151;
  const isMaximized =
    parent && parent.offsetHeight === height && parent.offsetWidth === width;

  const focusDialog = () => {
    const dialog = dialogRef.current?.parentElement as HTMLElement | null;
    if (!dialog?.classList.contains('active')) {
      document.querySelectorAll('.dialog-modal').forEach((element) => {
        if (element !== dialog) {
          element.classList.remove('active');
        } else {
          element.classList.add('active');
        }
      });
    }
  };

  useEffect(() => {
    focusDialog();
  }, []);

  return (
    <Rnd
      bounds='window'
      default={{
        ...posRef.current,
        width: width,
        height: height,
      }}
      dragHandleClassName='title-bar'
      className='dialog-modal z-40'
      enableUserSelectHack={true}
      onResizeStop={(_e, _dir, _elementRef, delta) => {
        setHeight(height + delta.height);
        setWidth(width + delta.width);
      }}
    >
      <div ref={dialogRef} className={windowClasses + ' w-full h-full'}>
        <div className={`title-bar ${titleBarClasses}`} onClick={focusDialog}>
          <div className='flex items-center space-x-2 ml-1'>
            <span className='font-bold text-sm'>{title}</span>
          </div>
          <div className='flex items-center'>
            <button
              className={minimizeButtonClasses}
              onClick={() => {
                if (isMinimized) {
                  setHeight(previous.current.height);
                  setWidth(previous.current.width);
                  if (posRef.current) {
                    posRef.current.x = previous.current.position.x;
                    posRef.current.y = previous.current.position.y;
                  }
                } else {
                  updatePrevious();
                  setHeight(32);
                  setWidth(150);
                }
              }}
              title='Minimize'
            >
              {isMinimized && <BsCopy />}
              {!isMinimized && <BsDashLg />}
            </button>
            <button
              className={maximizeButtonClasses}
              onClick={() => {
                const parent = dialogRef.current?.parentElement;
                if (parent) {
                  if (
                    parent.offsetHeight === height &&
                    parent.offsetWidth === width
                  ) {
                    setHeight(previous.current.height);
                    setWidth(previous.current.width);
                    if (posRef.current) {
                      posRef.current.x = previous.current.position.x;
                      posRef.current.y = previous.current.position.y;
                    }
                  } else {
                    updatePrevious();

                    setHeight(parent.offsetHeight);
                    setWidth(parent.offsetWidth);
                    if (posRef.current) {
                      posRef.current.x = 0;
                      posRef.current.y = 0;
                    }
                  }
                }
              }}
              title='Maximize'
            >
              {isMaximized && <BsCopy />}
              {!isMaximized && <BsSquare />}
            </button>
            <button
              className={controlButtonClasses}
              onClick={onClose}
              title='Close'
            >
              <BsXLg />
            </button>
          </div>
        </div>

        <div
          className='flex-1 overflow-auto'
          style={{
            display: height < 64 ? 'none' : 'flex',
          }}
        >
          {children}
        </div>
      </div>
    </Rnd>
  );
}
