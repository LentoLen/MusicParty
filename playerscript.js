let player;
let videoQueue = [];
let autoQueue = {}
let history = []
let currentVideoId;

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
    let video;

    if (videoQueue.length > 0) {
      video = videoQueue.shift();
    } else if (autoQueue["videoId"]){
        video = autoQueue;
    } else {
        getAutoplay();
    }
    history.push(video);
    updatePlayer(video["videoId"], video["thumbnail"], video["title"], video["artist"]);
}

function updatePlayer(videoId, thumbnail, title, artist) {
    document.getElementById("bg_img").style.backgroundImage = (`url(${thumbnail})`);
    console.log(thumbnail);
    player.loadVideoById(videoId);
    player.getIframe().style.display = "block";
    document.getElementById("player_controls").style.visibility = "visible";
    document.getElementById("queue_lyrics_div").style.display= "block";
    document.getElementById("vid_info").innerText = `${title} - ${artist}`;
    currentVideoId = videoId;
    getAutoplay();
    getLyrics();
    showQueueNext();
    showHistory();
    scrollToNextQueue();
}

function addToQueue(videoId, thumbnail, title, artist) {
    videoQueue.push({"videoId": videoId, "thumbnail": thumbnail, "title": title, "artist": artist});
    
    if (player.getPlayerState() === 5) {
        playNextVideo();
    } else {
        showSnackbar(`added "${title} - ${artist}" to queue`);
    }
    showQueueNext();
    scrollToNextQueue();
}

function playFromQueue(index) {
    let video = videoQueue.splice(index, 1)[0];
    history.push(video);
    updatePlayer(video["videoId"], video["thumbnail"], video["title"], video["artist"]);
}

function playFromHistory(index) {
    let video = history[index];
    history.push(video);
    updatePlayer(video["videoId"], video["thumbnail"], video["title"], video["artist"]);
}

function showQueueNext() {
    if (videoQueue.length > 0) {
        document.getElementById("queue_next").innerHTML = "<p>queue</p>";
        videoQueue.forEach((element, i) => {
            document.getElementById("queue_next").innerHTML += `<div class="queue_item" onclick="playFromQueue(${i})"><img src="${element["thumbnail"]}" class="queue_item_thumbnail"></img><div class="queue_item_details"><div class="queue_item_title">${element["title"]}</div><div class="queue_item_artist">${element["artist"]}</div></div><div class="material-symbols-outlined queue_item_dismiss" onclick="dismissQueue(event, ${i})">close</div>`;
        });
    } else {
        document.getElementById("queue_next").innerHTML = "";
    }
    
}

function addAutoplayToQueue() {
    addToQueue(autoQueue["videoId"], autoQueue["thumbnail"], autoQueue["title"], autoQueue["artist"]);
    getAutoplay();
}

function showHistory() {
    if (history.length > 1) {
        document.getElementById("queue_history").innerHTML = "<p>history</p>";
        history.slice(0, history.length - 1).forEach((element, i) => {
            document.getElementById("queue_history").innerHTML += `<div class="queue_item" onclick="playFromHistory(${i})" style="opacity:0.7;"><img src="${element["thumbnail"]}" class="queue_item_thumbnail"></img><div class="queue_item_details"><div class="queue_item_title">${element["title"]}</div><div class="queue_item_artist">${element["artist"]}</div></div><div class="material-symbols-outlined queue_item_dismiss" onclick="dismissHistory(event, ${i})">close</div>`;
        });
    } else {
        document.getElementById("queue_history").innerHTML = "";
    }
}

function dismissQueue(e, index) {
    e.stopPropagation();
    videoQueue.splice(index, 1);
    showQueueNext();
}

function dismissHistory(e, index) {
    e.stopPropagation();
    history.splice(index, 1);
    showHistory();
}

function dismissAutoplay(e) {
    e.stopPropagation();
    getAutoplay();
}

function scrollToNextQueue() {
    if (document.getElementById("queue_next").innerHTML != "") {
        document.getElementById("queue_div").scrollTop = document.getElementById("queue_next").offsetTop;
    } else {
        document.getElementById("queue_div").scrollTop = document.getElementById("queue_autoplay").offsetTop;
    }
}

function getAutoplay() {
    document.getElementById("queue_autoplay").innerHTML = `<p>autoplay</p><div class="queue_item">loading...</div>`;
    const autoplayUrl = `${apiUrl}/autoplay/?videoId=${encodeURIComponent(currentVideoId)}`;
    fetch(autoplayUrl, getJsonHeaders)
        .then(response => response.json())
        .then(data => {
            autoQueue = {"videoId": data["videoId"], "thumbnail": data["thumbnail"], "title": data["title"], "artist": data["artists"][0]["name"]};
            document.getElementById("queue_autoplay").innerHTML = `<p>autoplay</p><div class="queue_item" onclick="addAutoplayToQueue()"><img src="${autoQueue["thumbnail"]}" class="queue_item_thumbnail"></img><div class="queue_item_details"><div class="queue_item_title">${autoQueue["title"]}</div><div class="queue_item_artist">${autoQueue["artist"]}</div></div><div class="material-symbols-outlined queue_item_dismiss" onclick="dismissAutoplay(event)">close</div>`;
        })
        .catch(error => {
            showSnackbar("Couldn't load autoplay title...");
            console.error("Error fetching autoplay data:", error);
        });
}

function getLyrics() {
    document.getElementById("lyrics").innerHTML = `loading...`;
    const lyricsUrl = `${apiUrl}/lyrics/?videoId=${encodeURIComponent(currentVideoId)}`
    fetch(lyricsUrl, getJsonHeaders)
        .then(response => response.json())
        .then(data => {
            document.getElementById("lyrics").innerHTML = `${data["lyrics"]}<br>${data["source"]}`;
    })
}

function playPrevious() {
    if (history.length > 1) {
        videoQueue.unshift(history.pop());
        let video = history[history.length-1];
        updatePlayer(video["videoId"], video["thumbnail"], video["title"], video["artist"]);
    } else {
        showSnackbar("no titles in history");
    }
    
}

function playPause() {
    switch (player.getPlayerState()) {
        case YT.PlayerState.PLAYING:
            player.pauseVideo();
            break;

        case YT.PlayerState.PAUSED:
            player.playVideo();
    
        default:
            break;
    } 
}

window.addEventListener("keydown", e => {if (e.code === 'Space' && document.activeElement !== searchInput) {e.preventDefault(); playPause()}})
