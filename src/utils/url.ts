const DDG_REDIRECT_PATTERN = /^\/\/duckduckgo\.com\/l\/\?uddg=/;

export function cleanDdgUrl(url: string): string {
    if (DDG_REDIRECT_PATTERN.test(url)) {
        const match = url.match(/uddg=([^&]+)/);
        return match ? decodeURIComponent(match[1]) : url;
    }
    return url;
}
