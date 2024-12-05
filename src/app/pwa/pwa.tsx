
export interface PWAProps {
    title?: string;
    src?: string;
}

export default function PWA({title, src} : Readonly<PWAProps>) {
    // TODO: Develop a local proxy
    return (
        <iframe title={title} src={src} className="w-full h-full"></iframe>
    )
}
