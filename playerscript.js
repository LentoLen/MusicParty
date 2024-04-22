let player;
let videoQueue = [];
let autoQueue = {};
let history = [];
let lyricsLoaded = "";
let currentVideoId;
let lyrics_dict;
let last_scrolled = Date.now();

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
            getLyrics();
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
    showQueueNext();
    showPlaying();
    showHistory();
    scrollToNextQueue();
}

function addToQueue(videoId, thumbnail, title, artist, album, artists) {
    videoQueue.push({"videoId": videoId, "thumbnail": thumbnail, "title": title, "artist": artist, "album": album, "artists": artists});
    
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
        document.getElementById("queue_next").innerHTML = "<p style='user-select: none;'>queue</p>";
        videoQueue.forEach((element, i) => {
            document.getElementById("queue_next").innerHTML += `<div class="queue_item" onclick="playFromQueue(${i})"><img src="${element["thumbnail"]}" class="queue_item_thumbnail"></img><div class="queue_item_details"><div class="queue_item_title">${element["title"]}</div><div class="queue_item_artist">${element["artist"]}</div></div><div class="material-symbols-outlined queue_item_dismiss" onclick="dismissQueue(event, ${i})">close</div>`;
        });
    } else {
        document.getElementById("queue_next").innerHTML = "";
    }
    
}

function showPlaying() {
    console.log("playing", history[0]["title"]);
    if (history.length > 0) {
        const vidPlaying = history[history.length-1];
        const videoId = vidPlaying["videoId"];
        const title = vidPlaying["title"];
        document.getElementById("queue_playing").innerHTML = "<p style='user-select: none;'>playing</p>";
        document.getElementById("queue_playing").innerHTML += `<div class="queue_item" onclick="playPause()"><img src="${vidPlaying["thumbnail"]}" class="queue_item_thumbnail"></img><div class="queue_item_details"><div class="queue_item_title">${vidPlaying["title"]}</div><div class="queue_item_artist">${vidPlaying["artist"]}</div></div><div id="dl-btn" style="padding-top:20px; padding-bottom:20px; height:fit-content;" class="material-symbols-outlined queue_item_dismiss">download</div>`;
        const dlBtn = document.getElementById("dl-btn");
        dlBtn.addEventListener("click", function (event) {
            dlBtn.style.color = "var(--secBg)";
            dlBtn.innerHTML = "progress_activity";
            dlBtn.style.animation = "spin 1.2s cubic-bezier(.25,.41,.68,.55) infinite";
            dlBtn.style.pointerEvents = "none";
            download_audio(videoId, title);
            event.stopPropagation();
        });
        
    } else {
        document.getElementById("queue_playing").innerHTML = "";
    }
    
}

function addAutoplayToQueue() {
    addToQueue(autoQueue["videoId"], autoQueue["thumbnail"], autoQueue["title"], autoQueue["artist"]);
    getAutoplay();
}

function showHistory() {
    if (history.length > 1) {
        document.getElementById("queue_history").innerHTML = "<p style='user-select: none;'>history</p>";
        history.slice(0, history.length - 1).forEach((element, i) => {
            document.getElementById("queue_history").innerHTML += `<div class="queue_item" onclick="playFromHistory(${i})" style="opacity:0.7;"><img src="${element["thumbnail"]}" class="queue_item_thumbnail"></img><div class="queue_item_details"><div class="queue_item_title">${element["title"]}</div><div class="queue_item_artist">${element["artist"]}</div></div><div class="material-symbols-outlined queue_item_dismiss" onclick="dismissHistory(event, ${i})">close</div>`;
        });
    } else {
        document.getElementById("queue_history").innerHTML = "";
    }
}

function download_audio(videoId, title) {
    fetch(`https://ytdapi.onrender.com/download-audio/?video_id=${videoId}`)
        .then(response => response.blob())
        .then(blob => {
            const audioUrl = window.URL.createObjectURL(blob);
            const dlLink = document.getElementById("dl-link");
            dlLink.href = audioUrl;
            dlLink.download = `${title}.m4a`;
            dlLink.click();
            const dlBtn = document.getElementById("dl-btn");
            dlBtn.style.animation = "none";
            dlBtn.innerHTML = "download";
        })
    
    
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
    document.getElementById("queue_autoplay").innerHTML = `<p style="user-select: none;">autoplay</p><div class="queue_item">loading...</div>`;
    const autoplayUrl = `${apiUrl}/autoplay/?videoId=${encodeURIComponent(currentVideoId)}`;
    fetch(autoplayUrl, getJsonHeaders)
        .then(response => response.json())
        .then(data => {
            let artists_list = [];
            data.artists.forEach(element => {
                artists_list.push(element.name);
            });
            let album_name = data.album.name;
            if (!album_name) {
                album_name = data.title;
            } 
            autoQueue = {"videoId": data["videoId"], "thumbnail": data["thumbnail"], "title": data["title"], "artist": data["artists"][0]["name"], "album": album_name, "artists": artists_list.join(", ")};
            document.getElementById("queue_autoplay").innerHTML = `<p style="user-select: none;">autoplay</p><div class="queue_item" onclick="addAutoplayToQueue()"><img src="${autoQueue["thumbnail"]}" class="queue_item_thumbnail"></img><div class="queue_item_details"><div class="queue_item_title">${autoQueue["title"]}</div><div class="queue_item_artist">${autoQueue["artist"]}</div></div><div class="material-symbols-outlined queue_item_dismiss" onclick="dismissAutoplay(event)">close</div>`;
        })
        .catch(error => {
            showSnackbar("Couldn't load autoplay title...");
            console.error("Error fetching autoplay data:", error);
        });
}

function getLyrics() {
    if (lyricsLoaded == currentVideoId) {
        return
    }
    let info = history.at(-1)
    document.getElementById("lyrics").innerHTML = `loading...`;
    if (!info["album"]) {
        info["album"] = info["title"];
    }
    const lyricsUrl = `https://lrclib.net/api/get?artist_name=${info["artists"]}&track_name=${info["title"]}&album_name=${info["album"]}&duration=${player.getDuration()}`;
    fetch(lyricsUrl, getJsonHeaders)
        .then(response => response.json())
        .then(data => {
            if (data["syncedLyrics"]) {
                lyrics_dict = splitLrcToDict(data["syncedLyrics"]);
                document.getElementById("lyrics").innerHTML = "";
                for (let line in lyrics_dict) {
                    document.getElementById("lyrics").innerHTML += `<p id=${line} class="lrc" onclick="player.seekTo(${mmssToSeconds(line)}); syncLyricsOnClick('${line}');">${lyrics_dict[line]}</p>`;
                }
                lyricsLoaded = currentVideoId;
            } else if (data["plainLyrics"]) {
                document.getElementById("lyrics").innerHTML = data["plainLyrics"];
            } else {
                document.getElementById("lyrics").innerHTML = "no lyrics found";
            }
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

function removeClassFromChildren(parentElement, className) {
    const children = parentElement.children;
    for (let i = 0; i < children.length; i++) {
        children[i].classList.remove(className);
    }
}

function mmssToSeconds(timeString) {
    var parts = timeString.split(':');
    var minutes = parseInt(parts[0]);
    var seconds = parseFloat(parts[1]);
    return minutes * 60 + seconds;
}

function splitLrcToDict(lyrics) {
    const lrcDict = {};
    const regex = /\[(\d+:\d+\.\d+)\](.+)/g;
    let match;

    while ((match = regex.exec(lyrics)) !== null) {
        const timestamp = match[1];
        const lyricsLine = match[2].trim();
        
        if (lrcDict.hasOwnProperty(timestamp)) {
            lrcDict[timestamp] += "\n" + lyricsLine;
        } else {
            lrcDict[timestamp] = lyricsLine;
        }
    }

    return lrcDict;
}

function syncLyricsOnClick(lrcTime) {
    removeClassFromChildren(document.getElementById("lyrics"), "cur_lrc");
    document.getElementById(lrcTime).classList.add("cur_lrc");
    document.getElementById(lrcTime).scrollIntoView({behavior: "smooth", block: "center"});
}

function syncLyrics() {
    if (document.getElementById("tab_lyrics").classList.contains("active") && lyricsLoaded == currentVideoId && player.getPlayerState() == 1) {
        let curTime = player.getCurrentTime();
        let curLrc;
        for (let line in lyrics_dict) {
            if (curTime >= mmssToSeconds(line)) {
                removeClassFromChildren(document.getElementById("lyrics"), "cur_lrc");
                curLrc = line;
            }
        }
        if (curLrc) {
            document.getElementById(curLrc).classList.add("cur_lrc");
            if ((last_scrolled+3000) < Date.now()) {
                document.getElementById(curLrc).scrollIntoView({behavior: "smooth", block: "center"});
                setTimeout(function() {last_scrolled = 0;}, 800);
            }
        }
    }
}
setInterval(syncLyrics, 1000);

function updateScrollTimeout() {
    last_scrolled = Date.now();
}

document.getElementById("lyrics_div").addEventListener("scroll", updateScrollTimeout);