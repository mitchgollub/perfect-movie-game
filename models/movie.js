export class Movie {
    constructor(name, score, poster) {
        this.name = name || '';
        this.score = score || '__';
        this.poster = poster || '';
    }
}