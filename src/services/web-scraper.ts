// CORS proxy services to bypass browser CORS restrictions
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest=',
];

let currentProxyIndex = 0;

export async function fetchUrlContent(url: string, onProgress?: (status: string) => void): Promise<string> {
    // Validate URL
    try {
        new URL(url);
    } catch (e) {
        throw new Error('Invalid URL format');
    }

    onProgress?.('Fetching URL content...');

    // Try each proxy in sequence
    for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyUrl = CORS_PROXIES[currentProxyIndex] + encodeURIComponent(url);

        onProgress?.(`Trying proxy ${i + 1}/${CORS_PROXIES.length}...`);

        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                },
                signal: AbortSignal.timeout(15000), // 15 second timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            onProgress?.('Extracting text from HTML...');
            const html = await response.text();
            const text = extractTextFromHtml(html);

            if (text.length < 50) {
                throw new Error('Extracted text too short, may be blocked');
            }

            onProgress?.('Content fetched successfully!');
            return text;
        } catch (error: any) {
            console.error(`Proxy ${currentProxyIndex} failed:`, error);
            currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;

            // If this was the last proxy, throw error
            if (i === CORS_PROXIES.length - 1) {
                throw new Error(`Failed to fetch URL content after trying ${CORS_PROXIES.length} proxies. The website may be blocking requests or the URL is invalid.`);
            }
        }
    }

    throw new Error('All proxies failed');
}

export function extractTextFromHtml(html: string): string {
    // Create a temporary DOM element to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Remove script, style, and other non-content elements
    const elementsToRemove = doc.querySelectorAll('script, style, nav, header, footer, iframe, noscript');
    elementsToRemove.forEach(el => el.remove());

    // Get text content
    let text = doc.body?.textContent || '';

    // Clean up whitespace
    text = text
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n\s*\n/g, '\n')  // Remove empty lines
        .trim();

    return text;
}

// Extract domain from URL for display
export function getDomainFromUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
    } catch (e) {
        return url;
    }
}
