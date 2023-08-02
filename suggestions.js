const suggestions_div = document.getElementById("suggestion")
const searchbar = document.getElementById("searchbar")
let maxSuggestIndex = 3
let currentSuggestIndex = 0

function isSuggestEnabled() {
    // enable/disable
    return true
}

function suggest(sug_index) {
    validateInput()

    // break if suggetions disabled
    if (!isSuggestEnabled) {
        return
    }
    currentSuggestIndex = sug_index

    const input = searchInput.value
    suggestions_div.innerText = ""

    if (input == "") {
        return  
    }

    const suggestUrl = `${apiUrl}/suggest/?query=${encodeURIComponent(input)}`
    fetch(suggestUrl, getJsonHeaders)
        .then(response => response.json())
        .then(data => {
            if (data.length < 1 || input != searchInput.value) {
                return
            }

            maxSuggestIndex = data.length -1
            if (sug_index > maxSuggestIndex) {
                sug_index = 0
                currentSuggestIndex = 0
            }

            const sug_words = data[sug_index].split(" ")
            const inp_words = input.split(" ")
            let sug_text = "" 
            
            sug_words.forEach((word, index) => {
                const sug_word_cleaned = word.replace(/[^\w\s]/g, ""); // selects everything but words (letter, number, _) and whitespace
                if (sug_word_cleaned == inp_words[index]) {
                    sug_text += `${sug_word_cleaned} `
                } else {
                    sug_text += `${word} `
                }
            });
            console.log("sugtext: ", sug_text, "inp: ", input)
            if (sug_text.toLowerCase().startsWith(input.toLowerCase())) {
                const suggestion = sug_text.substring(input.length)
                suggestions_div.innerHTML = `${input}${suggestion}`;
                suggestions_div.dataset.suggestion = data[sug_index]
            }
    })
}

document.getElementById("searchbar").addEventListener("focusin", (event) => {
    suggest(0);
});

document.getElementById("searchbar").addEventListener("focusout", (event) => {
    if (document.querySelector("#suggestion:hover") == null) {
        suggestions_div.innerText = "";
    } 
});

document.getElementById("searchbar").addEventListener("keydown", (event) => {
    if (suggestions_div.innerHTML == "") {
        return
    }

    switch (event.key) {
        case "Tab":
            event.preventDefault()
            applySuggestion()
        break;

        case "ArrowRight":
            const { selectionStart, selectionEnd, value } = searchInput;
            if (selectionStart === value.length && selectionStart === selectionEnd) {
                applySuggestion()
            }
            break;
        
        case "ArrowDown":
            event.preventDefault()
            if (currentSuggestIndex < maxSuggestIndex) {
                suggest(currentSuggestIndex + 1)
            } else {
                suggest(0)
            }
            break;

        case "ArrowUp":
            event.preventDefault()
            if (currentSuggestIndex > 0) {
                suggest(currentSuggestIndex - 1)
            } else {
                suggest(maxSuggestIndex)
            }
        break
    
        default:
            break;
    }
})

function applySuggestion() {
    console.log("apply")
    searchInput.value = suggestions_div.dataset.suggestion
    suggestions_div.innerHTML = ""
    validateInput()
    searchInput.focus()
}
