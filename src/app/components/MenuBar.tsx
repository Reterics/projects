import React, { useState, useEffect, useRef } from 'react';
import logoDark from "@/app/assets/logo_thick.png";
import Image from "next/image";

export interface MenuBarItem {
    label?: string
    icon?: string
    command?: () => void
    separator?: boolean
    items?: MenuBarItem[]
    className?: string
}

export interface MenuBarProps {
    model: MenuBarItem[]
}

export default function MenuBar ({model}: MenuBarProps) {
    const [currentTime, setCurrentTime] = useState<string|null>(null);
    const [openDropdown, setOpenDropdown] = useState<string|null>(null);
    const outsideRef = useRef<HTMLElement|null>(null);

    useEffect(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(
                now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            );
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (outsideRef.current && !outsideRef.current.contains(e.target as HTMLElement)) {
                setOpenDropdown(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuClick = (item: MenuBarItem) => {
        if (item.command && typeof item.command === 'function') {
            item.command();
        }
        if (!item.items) {
            setOpenDropdown(null);
        }
    };

    const toggleDropdown = (itemLabel?: string) => {
        const label = itemLabel || null;
        setOpenDropdown((prev) => (prev === label ? null : label));
    };

    return (
        <nav
            ref={outsideRef}
            className="fixed top-0 left-0 w-full h-8 bg-zinc-100 text-zinc-900 flex items-center justify-between px-4 z-50 border-b border-zinc-300"
        >
            <div className="flex items-center space-x-4">
                <Image src={logoDark} alt={'Logo'} width={18} height={18}/>

                {model.map((item) => {
                    const hasDropdown = item.items && Array.isArray(item.items);

                    if (item.separator) {
                        return (
                            <div
                                key={Math.random()}
                                className="w-px h-4 bg-zinc-300 mx-2"
                            ></div>
                        );
                    }

                    return (
                        <div className="relative" key={item.label}>
                            <button
                                onClick={() =>
                                    hasDropdown
                                        ? toggleDropdown(item.label)
                                        : handleMenuClick(item)
                                }
                                className={`text-sm font-medium hover:bg-zinc-200 px-2 py-1 rounded transition-colors ${
                                    item.className || ''
                                }`}
                            >
                                {item.icon && <i className={`${item.icon} mr-2`}></i>}
                                {item.label}
                            </button>
                            {hasDropdown && openDropdown === item.label && (
                                <div className="absolute left-0 top-full mt-1 w-32 bg-zinc-100 border border-zinc-300 rounded shadow z-50">
                                    <ul className="flex flex-col">
                                        {item.items?.map((subItem, index) => {
                                            if (subItem.separator) {
                                                return (
                                                    <li
                                                        key={index}
                                                        className="border-t border-zinc-300 my-1"
                                                    ></li>
                                                );
                                            }
                                            return (
                                                <li
                                                    key={subItem.label || index}
                                                    onClick={() => handleMenuClick(subItem)}
                                                    className="hover:bg-zinc-200 px-2 py-1 cursor-pointer text-sm flex items-center"
                                                >
                                                    {subItem.icon && (
                                                        <i className={`${subItem.icon} mr-2 text-zinc-700`}></i>
                                                    )}
                                                    {subItem.label}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center space-x-4">
                <input
                    type="text"
                    placeholder="Search"
                    className="text-sm bg-zinc-200 hover:bg-zinc-50 focus:bg-zinc-50 focus:outline-none rounded px-2 py-1 placeholder-zinc-500"
                />
                <div className="text-sm font-light">{currentTime}</div>
            </div>
        </nav>
    );
};
