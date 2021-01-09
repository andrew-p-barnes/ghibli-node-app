let slider = document.getElementById('formControlRange');

slider.oninput = () => {
    let sliderValue = document.getElementById('rangeValue');
    sliderValue.innerHTML = slider.value;
}

resetRatingSlider = () => {
    slider.value = 50;
    let sliderValue = document.getElementById('rangeValue');
    sliderValue.innerHTML = slider.value;
}

resetRatingSlider(); 

let commentInput = document.querySelector('#commentInput');
let counter = document.querySelector('#counter');
let rateModalRateBtn = document.querySelector('.rateModal-rate-btn')
rateModalRateBtn.disabled = true;

// resets the rate film score slider and comment elements
resetRateModal = () => {
    resetRatingSlider();
    commentInput.value = "";
    rateModalRateBtn.disabled = true;
    counter.innerHTML = "0/200";
}

// function called on input into film review comment box
commentInput.addEventListener("keyup", () => {
    const commentInputMaxLength = 200;
    let charCount = commentInput.value.length;
    counter.innerHTML = charCount.toString() + "/200";
    if (charCount < 20 || charCount > commentInputMaxLength) {
        counter.classList.add("charLengthWarning");
        rateModalRateBtn.disabled = true;
    }
    else {
        counter.classList.remove("charLengthWarning");
        rateModalRateBtn.disabled = false;
    }
});

// function called on click of close button on rate film modal
rateModalCloseBtn = document.querySelector('.rateModal-close-btn').onclick = () => {
    let film = document.querySelector('.rate-film');
    film.classList.remove('rate-film');
    resetRateModal();
}

// function called on click of rate button on rate film modal
rateModalRateBtn.addEventListener('click', () => {
    let film = document.querySelector('.rate-film');
    let filmId = Number(film.dataset.id);
    let filmComment = commentInput.value;

    fetch('/rateFilm', {
        method: 'POST',  
        headers: {  
            'Content-Type': 'application/json'
        },  
        body: JSON.stringify(
            {filmId: filmId, ratingVal: slider.value, filmComment: filmComment}
        )
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response;
    })
    .then(function (data) {  
        console.log('Request success: ', data);
        let rateBtn = film.querySelector('.rate-btn');
        let filmFooter = film.querySelector('.footer');
        filmFooter.removeChild(rateBtn);
        let userScore = film.querySelector('.userScore');
        userScore.innerHTML = "User score: " + slider.value
        film.classList.remove('rate-film');
        resetRateModal();
    })  
    .catch(function (error) {  
      console.log('Request failure: ', error);
    });
});


