const F_MP3= 'https://github.com/rxfe-a/ytmp3-remake';
const F_MP4= 'https://github.com/rxfe-softworks/ytmp4-remake';


document.addEventListener("DOMContentLoaded", function() {
    const githubIcon = document.getElementById("github");
    githubIcon.addEventListener("click", function(event) {
        event.preventDefault();
        fetch('/serverdat/')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch server data');
                }
                return response.json();
            })
            .then(data => {
                const target = (data.TARGET_FORMAT || 'mp3').trim().toLowerCase();
                const redirectUrl = target === 'mp4' ? F_MP4 : F_MP3;
                window.location.href = redirectUrl;
            })
            .catch(error => {
                console.error('Error:', error);
                window.location.href = F_MP3;
            });
    });
});