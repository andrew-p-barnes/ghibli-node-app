let locationPath = window.location.pathname;

let navLink = document.querySelectorAll('.nav-link');

navLink.forEach(nav => {
    if (nav.classList.contains("active")) {
        nav.classList.remove("active");
    }
});

if (locationPath == "/browse") {
    document.getElementById("browse-tab").classList.add("active");
} else if (locationPath == "/watchlist") {
    document.getElementById("watchlist-tab").classList.add("active");
} else if (locationPath == "/watched") {
    document.getElementById("watched-tab").classList.add("active");
} else if (locationPath == "/metrics") {
    document.getElementById("metrics-tab").classList.add("active");
}

let container = document.querySelector('.container');

// function called on click of Watchlist button
container.addEventListener('click', event => {

    if (event.target.classList.contains('add-btn')) {
        let filmId = event.target.parentElement.parentElement.parentElement.dataset.id;

        fetch('/addFilm', {
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json' 
            },  
            body: JSON.stringify({
                filmId: filmId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response;
        })
        .then(function (data) {  
          console.log('Request success: ', data);
          console.log(event.target);
          event.target.classList.replace('btn-outline-primary', 'btn-primary');
          event.target.innerText = "Added";
          event.target.disabled = true;
        })  
        .catch(function (error) {  
          console.log('Request failure: ', error);  
        });
    }
});

// function called on click of Remove button
container.addEventListener('click', event => {

    if (event.target.classList.contains('remove-btn')) {
        let filmId = event.target.parentElement.parentElement.parentElement.dataset.id;

        fetch('/removeFilm', {
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json' 
            },  
            body: JSON.stringify({
                filmId: filmId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response;
        })
        .then(function (data) {  
          console.log('Request success: ', data);
          let removedFilm = event.target.parentElement.parentElement.parentElement;
          container.removeChild(removedFilm);
        })  
        .catch(function (error) {  
          console.log('Request failure: ', error);  
        });
    }
});

// function called on click of Watched? button
container.addEventListener('click', event => {

    if (event.target.classList.contains('watched-btn')) {
        let filmId = event.target.parentElement.parentElement.parentElement.dataset.id;

        fetch('/watchFilm', {
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json' 
            },  
            body: JSON.stringify({
                filmId: filmId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response;
        })
        .then(function (data) {  
          console.log('Request success: ', data);
          let removedFilm = event.target.parentElement.parentElement.parentElement;
          container.removeChild(removedFilm);
        })  
        .catch(function (error) {  
          console.log('Request failure: ', error);  
        });
    }
});

// function called on click of Rate film button
container.addEventListener('click', event => {

    if (event.target.classList.contains('rate-btn')) {
        let film = event.target.parentElement.parentElement.parentElement;
        film.classList.add('rate-film');
        let filmTitle = event.target.parentElement.parentElement.children[0].innerHTML;
        document.getElementById("rateModalLabel").innerHTML = "Rate " + filmTitle;
    }
});

// function called on click of More info button
container.addEventListener('click', event => {

    if (event.target.classList.contains('more-info-btn')) {
        console.log(event.target.parentElement.parentElement.parentElement.dataset.id);
        let filmId = event.target.parentElement.parentElement.parentElement.dataset.id;

        fetch('/moreInfo', {
            method: 'POST',  
            headers: {  
                'Content-Type': 'application/json' 
            },  
            body: JSON.stringify({
                filmId: filmId
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json()
        })
        .then(function (data) {  
            console.log('Request success: ', data);
            document.getElementById("moreInfoModalLabel").innerHTML = data.filmTitle;
            document.getElementById("moreInfoDescription").innerHTML = data.filmDescription;
            let tableBody = document.getElementById("modalTableBody");
            tableBody.innerHTML = "";

            for (let i = 0; i < data.filmReviews.length; i++) {
                let tableRow = document.createElement("tr");
                let reviewUser = document.createElement("td");
                reviewUser.innerHTML = data.filmReviews[i].name;
                tableRow.append(reviewUser);
                let reviewRating = document.createElement("td");
                reviewRating.innerHTML = data.filmReviews[i].filmRating;
                tableRow.append(reviewRating);
                let reviewComment = document.createElement("td");
                reviewComment.innerHTML = data.filmReviews[i].filmComment;
                tableRow.append(reviewComment);
                tableBody.append(tableRow);
            }
        })  
        .catch(function (error) {  
            console.log('Request failure: ', error);  
        });
    }
});