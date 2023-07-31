async function search() {
    const searchbar = document.getElementById("searchbar")
    const inp = searchbar.value
    searchbar.value = ""

    const apiUrl = "https://musicpartyv2-1-k0554251.deta.app/search/";
    const searchUrl = `${apiUrl}?query=${encodeURIComponent(inp)}&limit=1`

    fetch(searchUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    })
   .then(response => response.json())
   .then(data => {
        const videoId = data.videos[0].videoId;
        const vid_frame = document.getElementById("vid_frame")
        vid_frame.src = `https://www.youtube.com/embed/${videoId}?&autoplay=1`
    })
}
