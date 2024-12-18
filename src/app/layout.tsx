import './globals.css';
import Providers from '@/app/providers';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang='en' suppressHydrationWarning>
            <body className="w-dvw h-dvh m-0 p-0 block overflow-hidden">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
