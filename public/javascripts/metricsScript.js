function drawWatchedChart(numFilmsWatched, numTotalFilms) {
    let numRemaining = numTotalFilms - numFilmsWatched;
    var data = google.visualization.arrayToDataTable([
      ['Category', 'Number'],
      ['Watched', numFilmsWatched],
      ['Still to watch', numRemaining],
    ]);

    var options = {
        chartArea:{left:0}
      };

    var chart = new google.visualization.PieChart(document.getElementById('watchedPiechart'));

    chart.draw(data, options);
}

function drawMostWatchedTable(mostWatched) {

    let tableBody = document.getElementById("mostWatchedTable");
    tableBody.innerHTML = "";

    for (let i = 0; i < mostWatched.length; i++) {
        let tableRow = document.createElement("tr");
        let filmTitle = document.createElement("td");
        filmTitle.innerHTML = mostWatched[i].filmTitle;
        tableRow.append(filmTitle);
        let filmViews = document.createElement("td");
        filmViews.innerHTML = mostWatched[i].count;
        tableRow.append(filmViews);
        tableBody.append(tableRow);
    }
}

function drawLatestCommentsTable(latestComments) {

    let tableBody = document.getElementById("latestCommentsTable");
    tableBody.innerHTML = "";

    for (let i = 0; i < latestComments.length; i++) {
        let tableRow = document.createElement("tr");
        let filmTitle = document.createElement("td");
        filmTitle.innerHTML = latestComments[i].filmTitle;
        tableRow.append(filmTitle);
        let userName = document.createElement("td");
        userName.innerHTML = latestComments[i].name;
        tableRow.append(userName);
        let reviewComment = document.createElement("td");
        reviewComment.innerHTML = latestComments[i].filmComment;
        tableRow.append(reviewComment);
        let reviewDate = document.createElement("td");
        // generate date str with a 'long' month from a datetime str 
        let dateStrArr = latestComments[i].date.slice(0,10).split("-")
        let dateObj = new Date(dateStrArr[0], dateStrArr[1] - 1, dateStrArr[2]) // int value representing month is zero indexed
        let commentDateStr = dateObj.toLocaleDateString(undefined, {year: 'numeric', month: 'long', day: 'numeric'});
        reviewDate.innerHTML = commentDateStr;
        tableRow.append(reviewDate);
        tableBody.append(tableRow);
    }
}

    fetch('/getMetrics', {
        method: 'POST',
        headers: {  
            'Content-Type': 'application/json' 
        },  
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(function (data) {  
        console.log('Request success: ', data);
        console.log(data);
        let numFilmsWatched = data.numFilmsWatched;
        let numTotalFilms = data.numTotalFilms;
        let mostWatched = data.mostWatched;
        let latestComments = data.latestComments;

        google.charts.load('current', {'packages':['corechart']});
            google.charts.setOnLoadCallback( function() {
                drawWatchedChart(numFilmsWatched, numTotalFilms);
            });
        drawMostWatchedTable(mostWatched);
        drawLatestCommentsTable(latestComments);
    })  
    .catch(function (error) {  
        console.log('Request failure: ', error);
    });