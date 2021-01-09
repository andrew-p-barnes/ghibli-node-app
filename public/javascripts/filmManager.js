class FilmManager {
    constructor() {
        this.films = [];
        this.currentId = 0;
    }
    createFilm(title, description, releaseDate, rtScore, userScore, avgUserScore, status) {
        this.currentId++;
        let rtImgSrc;
        if (rtScore >= 60) {
            rtImgSrc = '/images/fresh.svg';
        }
        else {
            rtImgSrc = '/images/rotten.svg';
        }
        let titleNoSpaces = title.replace(/ /g, '_');
        let imgSrc = '/images/films/' + titleNoSpaces + ".jpg";
        
        return {
            id: this.currentId,
            title: title,
            description: description,
            releaseDate: releaseDate,
            rtScore: rtScore,
            userScore: userScore,
            avgUserScore: avgUserScore,
            rtImgSrc: rtImgSrc,
            status: status,
            imgSrc: imgSrc
        }
    }

    getFilms() {
        return this.films;
    }

    addFilm(film) {
        this.films.push(film);
    }

    setFilmStatus(filmId, status) {
        for (let i=0; i<this.films.length; i++) {
            if (this.films[i].id==filmId) {
                if (status == "avail") {
                    this.films[i].status = "avail";
                }
                else if (status == "watchlist") {
                    this.films[i].status = "watchlist";
                }
                if (status == "watched") {
                    this.films[i].status = "watched";
                }
            }   
        }
    }

    setFilmUserScore(filmId, score) {
        for (let i=0; i<this.films.length; i++) {
            if (this.films[i].id==filmId) {
                if (0<=score<=100) {
                    this.films[i].userScore = score;
                }
            }
        }
    }

    getFilmById(filmId) {
        for (let i=0; i<this.films.length; i++) {
            if (this.films[i].id == filmId) {
                return this.films[i];
            }
        }
    }

    getFilmsByStatus(status) {
        let filmList = [];
        for (let i=0; i<this.films.length; i++) {
            if (this.films[i].status == status) {
                filmList.push(this.films[i]);
            }
        }
        return filmList;
    }

    // returns array of any titles with status as watchlist or watched, as a json str
    getFilmStatusJSONstr() {
        let statusMap = new Map()
        for (let i=0; i<this.films.length; i++) {
            if (this.films[i].status != "avail") {
                statusMap.set(this.films[i].title, this.films[i].status);
            }
        }
        for (let [key, value] of statusMap) {
            console.log(key + ' = ' + value)
        }
        let statusArray = Array.from(statusMap);
        let statusArrayJSONstr = JSON.stringify(statusArray);
        return statusArrayJSONstr;
    }
}

module.exports = FilmManager;