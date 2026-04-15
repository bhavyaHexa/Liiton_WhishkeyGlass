export const isDebugMode = () => {
    if (typeof window === 'undefined') return false;
    
    const searchParams = new URLSearchParams(window.location.search);
    const hasDebugParam = searchParams.has('debug') && searchParams.get('debug') !== 'false';
    const hasDebugPath = window.location.pathname.includes('/debug');
    
    return hasDebugParam || hasDebugPath;
};
