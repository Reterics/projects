export interface CookieOptions {
    expires?: Date;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'Strict' | 'Lax' | 'None';
}

export const CookieManager = {
    set: (name: string, value: string, options: CookieOptions = {}) => {
        let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        if (options.expires) {
            cookieStr += `; expires=${options.expires.toUTCString()}`;
        }
        if (options.path) {
            cookieStr += `; path=${options.path}`;
        }
        if (options.domain) {
            cookieStr += `; domain=${options.domain}`;
        }
        if (options.secure) {
            cookieStr += `; secure`;
        }
        if (options.sameSite) {
            cookieStr += `; samesite=${options.sameSite}`;
        }
        document.cookie = cookieStr;
    },

    get: (name: string): string | undefined => {
        const cookies = document.cookie.split('; ').reduce(
            (acc, cookie) => {
                const [key, value] = cookie.split('=');
                acc[decodeURIComponent(key)] = decodeURIComponent(value);
                return acc;
            },
            {} as Record<string, string>
        );
        return cookies[name];
    },

    delete: (name: string, options: CookieOptions = {}): void => {
        CookieManager.set(name, '', { ...options, expires: new Date(0) });
    },

    getAll: (): Record<string, string> => {
        return document.cookie.split('; ').reduce(
            (acc, cookie) => {
                const [key, value] = cookie.split('=');
                acc[decodeURIComponent(key)] = decodeURIComponent(value);
                return acc;
            },
            {} as Record<string, string>
        );
    },
};
