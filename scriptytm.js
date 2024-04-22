const searchInput = document.getElementById("searchInput")
const searchSubmit = document.getElementById("searchSubmit")
const lyricsDiv = document.getElementById('lyrics_div');
const queueDiv = document.getElementById('queue_div');
const lyricsTab = document.getElementById('tab_lyrics');
const queueTab = document.getElementById('tab_queue');
const snack = document.getElementById("snackbar")
const apiUrl = "https://musicpartyv2-1-k0554251.deta.app";
const getJsonHeaders = {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    },
}

function validateInput() {
    const inputValue = searchInput.value.trimStart().replace(/\s\s+/g, ' ');
    searchInput.value = inputValue.substring(0,120);
}

function search() {
    const inp = searchInput.value;
    if (inp == "") {
        return
    }
    searchInput.disabled = true;
    searchSubmit.className += "spin";
    suggestions_div.innerText = "";

    const searchUrl = `${apiUrl}/search/?query=${encodeURIComponent(inp)}&limit=1`;

    fetch(searchUrl, getJsonHeaders)
   .then(response => response.json())
   .then(data => {
        if (data.videos.length > 0) {
            let artists_list = []
            data.videos[0].artists.forEach(element => {
                artists_list.push(element.name);
            });
            let album_name = data.videos[0].album.name;
            if (!album_name) {
                album_name = data.videos[0].title;
            } 
            const videoId = data.videos[0].videoId;
            const thumbnail = data.videos[0].thumbnail;
            const title = data.videos[0].title;
            const artist = data.videos[0].artists[0].name;
            const album = album_name;
            const artists = artists_list.join(", ");
            addToQueue(videoId, thumbnail, title, artist, album, artists);
            resetSearchbar();
        } else {
            showSnackbar(`"${inp}" not found`);
            resetSearchbar();
        }
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
        showSnackbar("network error... try again");
        resetSearchbar();
    });
}

function resetSearchbar() {
    searchSubmit.className = searchSubmit.className.replace("spin", "");
    searchInput.value = "";
    searchInput.disabled = false;
}

function showSnackbar(message, timeout=3000) {
    snack.innerText = message;
    snack.className = "show";
    setTimeout(function(){ snack.className = snack.className.replace("show", ""); }, timeout);
}

function showLyricsTab() {
    lyricsDiv.classList.add('active');
    queueDiv.classList.remove('active');
    lyricsTab.classList.add('active');
    queueTab.classList.remove('active');
}

function showQueueTab() {
    queueDiv.classList.add('active');
    lyricsDiv.classList.remove('active');
    queueTab.classList.add('active');
    lyricsTab.classList.remove('active');
}

searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        search();
    }
}); 