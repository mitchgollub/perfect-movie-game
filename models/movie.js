export class Movie {
    constructor({ title, request, score, poster } = {}) {
        this.title = title || '';
        this.request = request || '';
        this.score = score || '__';
        this.poster = poster || '';
    }
}