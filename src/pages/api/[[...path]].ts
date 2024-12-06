import { NextApiRequest, NextApiResponse } from 'next';
import { Readable } from 'stream';

interface ActivePWACollection {
    [key: string]: string
}

const activePWAs:ActivePWACollection = {};


function streamToNodeStream(stream: ReadableStream) {
    const reader = stream.getReader();
    return new Readable({
        async read() {
            const { done, value } = await reader.read();
            if (done) {
                this.push(null);
            } else {
                this.push(Buffer.from(value));
            }
        },
    });
}


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { path = [], url } = req.query; // Catch-all path
    const referer = req.headers.referer;
    const rawCookies = req.headers.cookie || '';



    if ((!url || typeof url !== 'string') && !referer) {
        res.status(400).json({ error: 'Missing or invalid "url" query parameter and missing Referer header.' });
        return;
    }

    let baseUrl: string = url as string;
    let targetUrl;

    if (referer && !(path.length === 1 && path[0] === 'proxy')) {
        let cookieUrl;
        rawCookies.split('; ').forEach(cookie => {
            const [key, value] = cookie.split('=');
            const decodedUrl = decodeURIComponent(value);
            if (referer === decodedUrl) {
                cookieUrl = decodedUrl;
                baseUrl = decodedUrl;
            }
        });
        if (!cookieUrl) {
            const refererUrl = new URL(referer);
            const baseSubUrl = refererUrl.searchParams.get('url'); // Extract `url` query param from the iframe `src`
            if (baseSubUrl) {
                // Reconstruct the full target URL
                targetUrl = new URL(baseSubUrl);
                targetUrl.pathname = `/${(path as string[]).join('/')}`;
                targetUrl.search = req.url?.split('?')[1] ?? ''; //
                baseUrl = targetUrl.toString()
            }
        }

    } else {
        rawCookies.split('; ').forEach(cookie => {
            const [key, value] = cookie.split('=');
            const decodedUrl = decodeURIComponent(value);
            if (url === decodedUrl) {
                baseUrl = decodedUrl;
                activePWAs[key] = decodedUrl;
            }
        });
    }
    if (baseUrl === undefined) {
        baseUrl = activePWAs[Object.keys(activePWAs)[0]];
    }
    targetUrl = new URL(baseUrl);
    console.error('REQ: ', baseUrl);

    const headers: Record<string, string> = {};

    for (const [key, value] of Object.entries(req.headers)) {
        try {
            if (key !== 'referer' && !key.startsWith('x-forwarded')) {
                if (Array.isArray(value)) {
                    headers[key] = value.join(', ');
                } else if (typeof value === 'string') {
                    headers[key] = value;
                }
            }
        } catch (e) {
            console.error(e);
        }
    }
    if (!(path.length === 1 && path[0] === 'proxy')) {
        headers['host'] = targetUrl.host;
        headers['origin'] = targetUrl.origin;
    }
    /*if (req.headers.cookie) {
        headers['Cookie'] = req.headers.cookie;
    }*/

    let body: BodyInit | undefined = undefined;
    if (req.method === 'POST' || req.method === 'PUT') {
        if (typeof req.body === 'object') {
            body = JSON.stringify(req.body);
            headers['Content-Type'] = 'application/json';
        } else {
            body = req.body as BodyInit;
        }
    }

    try {

        const response = await fetch(baseUrl, {
            method: req.method, // Forward the request method
            headers: headers,
            body: body
        });


        // Set the response headers
        res.status(response.status);
        response.headers.forEach((value, key) => {
            if (key.toLowerCase() !== 'content-encoding') {
                res.setHeader(key, value);
            }
        });

        const reader = response.body?.getReader();
        if (reader) {
            const stream = new ReadableStream({
                start(controller) {
                    function push() {
                        reader?.read().then(({ done, value }) => {
                            if (done) {
                                controller.close();
                                return;
                            }
                            controller.enqueue(value);
                            push();
                        });
                    }
                    push();
                },
            });
            const nodeStream = streamToNodeStream(stream);
            nodeStream.pipe(res);
        } else {
            res.end();
        }
    } catch (error) {
        console.error('Error fetching proxy content:', error);
        console.error((error as Error).stack)
        res.status(500).json({ error: 'Failed to fetch content.' });
    }
}
