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
    if (event.data === YT.PlayerState.ENDED) {
        playNextVideo();
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
    document.getElementById("vid_info").innerText = `${title} - ${artist}`
    currentVideoId = videoId
}

function addToQueue(videoId, thumbnail, title, artist) {
    videoQueue.push({"videoId": videoId, "thumbnail": thumbnail, "title": title, "artist": artist});

    if (player.getPlayerState() === 5) {
        playNextVideo()
    }
}

function getAutoplayNext() {
    const autoplayUrl = `${apiUrl}/autoplay/?videoId=${encodeURIComponent(currentVideoId)}`
    return fetch(autoplayUrl, getJsonHeaders)
        .then(response => response.json())
}
