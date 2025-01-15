import { useEffect, useRef } from 'react';
import { setActivePassphrase } from '@/app/utils/crypto.ts';

export default function PasswordDialog({
    closeAction,
}: Readonly<{ closeAction: () => void }>) {
    const input = useRef<HTMLInputElement>(null);
    const save = async () => {
        const value = input.current?.value;

        if (typeof value === 'string') {
            await setActivePassphrase(value);
            closeAction();
        }
    };

    useEffect(() => {
        if (input.current) {
            input.current.focus();
        }
    }, []);
    return (
        <div className='w-full'>
            <div>
                <input
                    ref={input}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            save();
                            e.preventDefault();
                        }
                    }}
                    type='password'
                    name='password'
                    id='password'
                    placeholder='••••••••'
                    className='rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white'
                />
            </div>
            <button
                type='button'
                onClick={() => save()}
                className='w-full border border-zinc-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-2.5 py-2.5 text-center bg-primary-600 hover:bg-primary-700 focus:ring-primary-800'
            >
                Access
            </button>
        </div>
    );
}
