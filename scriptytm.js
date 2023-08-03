const searchInput = document.getElementById("searchInput")
const apiUrl = "https://musicpartyv2-1-k0554251.deta.app";
const getJsonHeaders = {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    },
}

function validateInput() {
    const inputValue = searchInput.value.trimStart().replace(/\s\s+/g, ' ');
    searchInput.value = inputValue
}

function search() {
    const inp = searchInput.value
    if (inp == "") {
        return
    }
    searchInput.value = ""
    suggestions_div.innerText = ""

    const searchUrl = `${apiUrl}/search/?query=${encodeURIComponent(inp)}&limit=1`

    fetch(searchUrl, getJsonHeaders)
   .then(response => response.json())
   .then(data => {
        if (data.videos.length > 0) {
            const videoId = data.videos[0].videoId;
            const thumbnail = data.videos[0].thumbnail;
            const title = data.videos[0].title
            const artist = data.videos[0].artists[0].name
            addToQueue(videoId, thumbnail, title, artist)
        }
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
      });
}

searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        search()
    }
}); 