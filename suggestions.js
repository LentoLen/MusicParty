const suggestions_div = document.getElementById("suggestion")
const searchbar = document.getElementById("searchbar")

function isSuggestEnabled() {
    // enable/disable
    return true
}

function suggest() {
    validateInput()

    // break if suggetions disabled
    if (!isSuggestEnabled) {
        return
    }

    const input = searchInput.value

    if (input == "") {
        // maybe move line out of if statement above
        suggestions_div.style.display = "none";
        return  
    }
    suggestions_div.innerHTML = ""

    const suggestUrl = `${apiUrl}/suggest/?query=${encodeURIComponent(input)}`
    fetch(suggestUrl, getJsonHeaders)
        .then(response => response.json())
        .then(data => {
            if (data.length < 1) {
                return
            }

            const sug_words = data[0].split(" ")
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
            if (sug_text.startsWith(input)) {
                const suggestion = sug_text.substring(input.length)
                suggestions_div.style.display = "block"
                suggestions_div.innerHTML = `${input}${suggestion}`;
                suggestions_div.dataset.suggestion = data[0]
            }
    })
}

document.getElementById("searchbar").addEventListener("focusin", (event) => {
    suggest();
});

document.getElementById("searchbar").addEventListener("focusout", (event) => {
    if (document.querySelector("#suggestions:hover") == null) {
        suggestions_div.style.display = "none";
    } 
});

document.getElementById("searchbar").addEventListener("keydown", (event) => {
    if ((event.key == "Tab" || event.key == "ArrowRight") && suggestions_div.innerHTML != "") {
        const { selectionStart, selectionEnd, value } = searchInput;
        if (selectionStart === value.length && selectionStart === selectionEnd) {
            if (event.key == "Tab") {
                event.preventDefault();
            }
            searchInput.value = suggestions_div.dataset.suggestion
            suggestions_div.innerHTML = suggestions_div.dataset.suggestion
            validateInput()
        }
    }
})
