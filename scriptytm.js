const searchInput = document.getElementById("searchInput")
const searchSubmit = document.getElementById("searchSubmit")
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
    searchInput.value = inputValue
}

function search() {
    const inp = searchInput.value
    if (inp == "") {
        return
    }
    searchInput.disabled = true
    searchSubmit.className += "spin"
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
            resetSearchbar()
        }
    })
    .catch((error) => {
        console.error("Error fetching data:", error);
        showSnackbar("network error... try again")
        resetSearchbar()
    });
}

function resetSearchbar() {
    searchSubmit.className = searchSubmit.className.replace("spin", "")
    searchInput.value = ""
    searchInput.disabled = false
    document.getElementById("lyrics").innerHTML = ""
}

function showSnackbar(message, timeout=3000) {
    snack.innerText = message
    snack.className = "show"
    setTimeout(function(){ snack.className = snack.className.replace("show", ""); }, timeout);
}

searchInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        search()
    }
}); 