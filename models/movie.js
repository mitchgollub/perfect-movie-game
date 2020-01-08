export class Movie {
    constructor(title, score, poster) {
        this.title = title || '';
        this.score = score || '__';
        this.poster = poster || '';
    }
}