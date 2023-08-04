let player;
let videoQueue = [];
let currentVideoId 

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: '',
    playerVars: {
        autoplay: 1,
      },
    events: {
        'onStateChange': onPlayerStateChange
    }
  });
}

function onPlayerStateChange(event) {
    console.log('Player State Change:', event.data);

    switch (event.data) {
        case YT.PlayerState.ENDED:
            playNextVideo();
            break;

        case YT.PlayerState.PLAYING:
            document.getElementById("play_btn").innerText = "pause";
            break;

        case YT.PlayerState.PAUSED:
            document.getElementById("play_btn").innerText = "play_arrow";
            break;
    
        default:
            break;
    }
}

function playNextVideo() {
    let video

    if (videoQueue.length > 0) {
      video = videoQueue.shift();
      updatePlayer(video["videoId"], video["thumbnail"], video["title"], video["artist"]);
    } else {
        getAutoplayNext()
            .then(data => {
                updatePlayer(data["videoId"], data["thumbnail"], data["title"], data["artists"][0]["name"]);
            })
            .catch(error => {
                // Handle any errors that occur during the fetch request
                console.error("Error fetching autoplay data:", error);
            });
    }
}

function updatePlayer(videoId, thumbnail, title, artist) {
    document.getElementById("bg_img").style.backgroundImage = (`url(${thumbnail})`)
    console.log(thumbnail)
    player.loadVideoById(videoId)
    player.getIframe().style.display = "block"
    document.getElementById("player_controls").style.visibility = "visible"
    document.getElementById("queue_lyrics_div").style.display= "block"
    document.getElementById("vid_info").innerText = `${title} - ${artist}`
    currentVideoId = videoId
    getLyrics()
}

function addToQueue(videoId, thumbnail, title, artist) {
    videoQueue.push({"videoId": videoId, "thumbnail": thumbnail, "title": title, "artist": artist});

    if (player.getPlayerState() === 5) {
        playNextVideo()
    } else {
        showSnackbar(`added "${title} - ${artist}" to queue`)
    }
}

function getAutoplayNext() {
    const autoplayUrl = `${apiUrl}/autoplay/?videoId=${encodeURIComponent(currentVideoId)}`
    return fetch(autoplayUrl, getJsonHeaders)
        .then(response => response.json())
}

function getLyrics() {
    const lyricsUrl = `${apiUrl}/lyrics/?videoId=${encodeURIComponent(currentVideoId)}`
    fetch(lyricsUrl, getJsonHeaders)
        .then(response => response.json())
        .then(data => {
            document.getElementById("lyrics").innerHTML = `${data["lyrics"]}<br>${data["source"]}`
    })
}

function playPause() {
    switch (player.getPlayerState()) {
        case YT.PlayerState.PLAYING:
            player.pauseVideo()
            break;

        case YT.PlayerState.PAUSED:
            player.playVideo()
    
        default:
            break;
    } 
}

window.addEventListener("keydown", e => {if (e.code === 'Space' && document.activeElement !== searchInput) {e.preventDefault(); playPause()}})
