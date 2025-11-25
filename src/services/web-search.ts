export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function searchDuckDuckGo(query: string, maxResults: number = 3): Promise<SearchResult[]> {
    try {
        // DuckDuckGo HTML search URL
        const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
        const proxyUrl = CORS_PROXY + encodeURIComponent(searchUrl);

        const response = await fetch(proxyUrl);

        if (!response.ok) {
            throw new Error('Search request failed');
        }

        const html = await response.text();
        const results = parseSearchResults(html, maxResults);

        return results;
    } catch (error) {
        console.error('DuckDuckGo search error:', error);
        throw new Error('Failed to search the web. Please try again.');
    }
}

function parseSearchResults(html: string, maxResults: number): SearchResult[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const results: SearchResult[] = [];

    // DuckDuckGo HTML uses specific classes for results
    const resultElements = doc.querySelectorAll('.result');

    for (let i = 0; i < Math.min(resultElements.length, maxResults); i++) {
        const element = resultElements[i];

        // Extract title and URL
        const titleLink = element.querySelector('.result__a');
        const title = titleLink?.textContent?.trim() || '';
        const url = titleLink?.getAttribute('href') || '';

        // Extract snippet
        const snippetElement = element.querySelector('.result__snippet');
        const snippet = snippetElement?.textContent?.trim() || '';

        // Only add if we have valid data
        if (title && url && url.startsWith('http')) {
            results.push({ title, url, snippet });
        }
    }

    // Fallback: try alternative parsing if no results found
    if (results.length === 0) {
        const links = doc.querySelectorAll('a.result__url');
        for (let i = 0; i < Math.min(links.length, maxResults); i++) {
            const link = links[i] as HTMLAnchorElement;
            const url = link.href;

            if (url && url.startsWith('http')) {
                results.push({
                    title: link.textContent?.trim() || url,
                    url: url,
                    snippet: ''
                });
            }
        }
    }

    return results;
}

// Detect if a message contains a search intent
export function detectSearchIntent(message: string): boolean {
    const searchKeywords = [
        'search for',
        'search the web',
        'look up',
        'find information about',
        'google',
        'search online',
        'web search'
    ];

    const lowerMessage = message.toLowerCase();
    return searchKeywords.some(keyword => lowerMessage.includes(keyword));
}

// Detect URLs in a message
export function extractUrls(message: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = message.match(urlRegex);
    return matches || [];
}
