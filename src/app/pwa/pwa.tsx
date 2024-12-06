import {CookieManager} from "@/app/utils/cookieManager";

export interface PWAProps {
    title?: string;
    src: string;
}

const titleToCookieKey = (title: string) => title.replace(/[\d\s=/\\;\.\:&\-]+/g, '_')



export default function PWA({title, src} : Readonly<PWAProps>) {
    const key = `pwa_${titleToCookieKey(title ?? src)}`;

    CookieManager.set(key, src)

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(src)}`;

    return (
        <iframe
            title={title}
            src={proxyUrl}
            className="w-full h-full" data-base-url={src}></iframe>
    )
}
