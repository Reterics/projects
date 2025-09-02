'use client';
import React, {useEffect, useState} from 'react';
import Dialog from './components/Dialog';
import {ToastContainer} from 'react-toastify';
import './page.css';
import MenuBar, {MenuBarItem} from '@/app/components/MenuBar.tsx';
import {pwaItems} from '@/app/pwa';
import {useSearchParams} from 'next/navigation';
import PasswordDialog from '@/app/pwa/Password.tsx';

export interface RunningApp {
  id: string;
  label: string;
  className?: string;
  icon?: React.ReactNode;
  focus?: () => void;
  show: boolean;
  onClose?: () => void;
  entry: React.ReactNode;
  width?: number;
  height?: number;
}

export default function Home() {
  const [apps, setApps] = useState<RunningApp[]>([
    {
      id: '0_pwd',
      label: 'Password Entry',
      show: true,
      entry: (
        <PasswordDialog
          closeAction={() =>
            setApps((prevApps) => prevApps.filter((a) => a.id !== '0_pwd'))
          }
        />
      ),
      width: 200,
      height: 100,
    },
  ]);
  const [hydrated, setHydrated] = useState(false);

  const searchParams = useSearchParams();
  const appName = searchParams?.get('app');

  const onCreateAction = (runningApp: RunningApp) => {
    setApps((prevApps) => {
      // Strip a trailing " (n)" if someone passed in a suffixed label
      const base = runningApp.label.replace(/\s\(\d+\)$/, "");

      // Collect existing indices for the same base label:
      //  - "Base" (no suffix) counts as 0
      //  - "Base (n)" counts as n
      const nums = prevApps
        .map((a) => a.label)
        .map((l) => {
          const m = l.match(/^(.+?)(?:\s\((\d+)\))?$/);
          if (!m || m[1] !== base) return null;
          return m[2] ? parseInt(m[2], 10) : 0;
        })
        .filter((n): n is number => n !== null);

      // First instance: keep plain label (e.g., "Projects")
      if (nums.length === 0) {
        return [...prevApps, { ...runningApp, label: base }];
      }

      // Next instances: "Base (max+1)" => 2 for the third, 3 for the fourth, etc.
      const next = Math.max(...nums) + 1;
      const label = `${base} (${next})`;

      return [...prevApps, { ...runningApp, label }];
    });
  };

  useEffect(() => {
    if (appName && !apps.length) {
      const app = pwaItems.find(
        (item) => item.name === searchParams?.get('app')
      );
      if (app?.create) {
        const createdApp = app.create();
        createdApp.width = window.innerWidth;
        createdApp.height = window.innerHeight;
        onCreateAction(createdApp);
      }
    }
  }, [appName, apps, searchParams]);

  const menubarItems: MenuBarItem[] = [
    {
      label: 'Home',
      className: 'menubar-root',
    },
    {
      label: 'Apps',
      items: pwaItems,
    },
  ];

  useEffect(() => {
    // this forces a rerender
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return null;
  }

  return (
    <div className='system-outer w-full h-full flex flex-col'>
      {!appName && <MenuBar model={menubarItems} onCreate={onCreateAction} />}
      <div className='dock-window flex flex-1'>
        <ToastContainer />

        {apps.map((app, index) => (
          <Dialog
            key={'app_' + app.id + '_' + index}
            title={app.label}
            initialX={
              window.innerWidth / 2 -
              (app.width ?? window.innerWidth / 2) / 2 +
              index * 24
            }
            initialY={
              window.innerHeight / 2 -
              (app.height ?? window.innerHeight * 0.4) / 2 +
              index * 24
            }
            initialWidth={app.width ?? window.innerWidth / 2}
            initialHeight={app.height ?? window.innerHeight * 0.4}
            onClose={() =>
              setApps((prevApps) => prevApps.filter((a) => a !== app))
            }
          >
            {app.entry}
          </Dialog>
        ))}
      </div>
    </div>
  );
}
