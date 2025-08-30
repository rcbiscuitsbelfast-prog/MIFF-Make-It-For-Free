export function loadResources(manifest) {
    const entries = Object.entries(manifest);
    return new Promise((resolve) => {
        const out = {};
        let pending = entries.length;
        if (pending === 0)
            return resolve(out);
        for (const [key, src] of entries) {
            const img = new Image();
            img.onload = () => { out[key] = img; if (--pending === 0)
                resolve(out); };
            img.onerror = () => {
                // Resolve with a 1x1 transparent pixel to avoid hard failures
                const fallback = new Image();
                fallback.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                out[key] = fallback;
                if (--pending === 0)
                    resolve(out);
            };
            img.src = src;
        }
    });
}
