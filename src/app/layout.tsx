import './globals.css';
import Providers from '@/app/providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' suppressHydrationWarning={true}>
      <body className='w-dvw h-dvh m-0 p-0 block overflow-hidden font-display'>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
