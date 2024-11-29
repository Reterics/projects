'use client';
import NavigationBar from '@/app/components/navigationBar';
import PDialog from '@/app/components/pDialog';
import { useState } from 'react';

export default function Home() {
    const [open, setOpen] = useState(true);
    return (
        <main className="min-h-screen w-screen">
            <PDialog open={open} setOpen={setOpen} title={'Title'}>
                Modal
            </PDialog>

            <NavigationBar navItems={[]} />
        </main>
    );
}
