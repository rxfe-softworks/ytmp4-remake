const F_MP3 = 'https://github.com/rxfe-a/ytmp3-remake';
const F_MP4 = 'https://github.com/rxfe-softworks/ytmp4-remake';

document.addEventListener("DOMContentLoaded", async () => {
    const gh = document.getElementById("github");
    if (!gh) return;
    let targetUrl = F_MP3;
    try {
        const response = await fetch('/serverdat/');
        if (!response.ok) throw new Error('Failed to fetch server data');

        const data = await response.json();
        const target = (data.TARGET_FORMAT || 'mp3').trim().toLowerCase();

        if (target === 'mp4') {
            console.log("Prefetching MP4 target..."); //no clue if this works saw it on tiktok
            targetUrl = F_MP4;
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = F_MP4;
            document.head.appendChild(link);
        } else {
            console.log("Prefetching MP3 target...");
            targetUrl = F_MP3;

            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = F_MP3;
            document.head.appendChild(link);
        }

    } catch (error) {
        console.error('Error prefetching target format:', error);
    }

    gh.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = targetUrl;
    });
});
