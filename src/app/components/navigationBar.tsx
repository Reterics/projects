'use client';

import { useState } from 'react';

export interface NavItem {
    label: string;
    subLabel?: string;
    children?: Array<NavItem>;
    href?: string;
}

const NavigationBar = ({ navItems }: { navItems: NavItem[] }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <div className='fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-50'>
            <div className='flex justify-between items-center p-4'>
                {/* Search Bar */}
                <div className='relative flex items-center w-1/2'>
                    <input
                        type='text'
                        value={searchQuery}
                        onChange={handleSearchChange}
                        placeholder='Search...'
                        className='w-full py-2 px-4 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>

                {/* Navigation Items */}
                <div className='flex space-x-4'>
                    {navItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.href || '#'}
                            className='text-white hover:text-blue-400 transition-colors'
                        >
                            {item.label}
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NavigationBar;
