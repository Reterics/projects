'use client';
import {ReactNode, Suspense} from 'react';
import {Provider} from 'react-redux';
import store from '../store.ts';

export default function Providers(props: Readonly<{children: ReactNode}>) {
  return (
    <Provider store={store}>
      <Suspense fallback={null}>{props.children}</Suspense>
    </Provider>
  );
}
