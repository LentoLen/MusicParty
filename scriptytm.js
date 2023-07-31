function search() {
    const searchbar = document.getElementById("searchbar")
    const inp = searchbar.value
    if (inp == "") {
        return
    }
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
        if (data.videos.length > 0) {
            const videoId = data.videos[0].videoId;
            const thumbnail = data.videos[0].thumbnail;
            const background_image = document.getElementById("bg_img")
            background_image.style.backgroundImage = (`url(${thumbnail})`)
            console.log(thumbnail)
            const vid_frame = document.getElementById("vid_frame")
            vid_frame.src = `https://www.youtube.com/embed/${videoId}?&autoplay=1`
        }
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
      });
}