import React, { Component } from 'react'
import Head from 'next/head'
import { Movie } from '../models/movie';

export default class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      movie1: new Movie(),
      movie2: new Movie(),
    }

    this.movie1OnChange = this.movie1OnChange.bind(this);
    this.movie2OnChange = this.movie2OnChange.bind(this);
    this.handleMovieEntry = this.handleMovieEntry.bind(this);
  }

  movie1OnChange(event) { this.state.movie1.title = event.target.value; this.setState({ movie1: this.state.movie1 }) }
  movie2OnChange(event) { this.state.movie2.title = event.target.value; this.setState({ movie2: this.state.movie2 }) }

  async handleMovieEntry(event) {
    const id = event.target.id;

    let movieTitle = this.state.movie2.title;

    if ((id === 'movie1Submit'))
      movieTitle = this.state.movie1.title;

    const res = await fetch(`/api/score/${movieTitle}`);

    const json = await res.json();
    const movie = new Movie({
      title: json.title,
      score: json.score,
      poster: json.poster
    });

    if (json.error || !json.score) {
      movie.score = 'Score Not Found';
    }
    else {
      movie.score += '%';
    }

    let update = { movie1: movie };

    if (!(id === 'movie1Submit')) {
      update = { movie2: movie };
    }

    this.setState(update)
  }

  calculateScore() {
    if (this.state.movie1.score !== '__' && this.state.movie2.score !== '__') {
      return Number(this.state.movie1.score.replace(/\D/g, ''))
        + Number(this.state.movie2.score.replace(/\D/g, ''))
        + '%';
    }

    return '?';
  }

  render() {
    return (
      <div>
        <Head>
          <title>Perfect Movie Game</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <div className="hero">
          <h1 className="title">Welcome to The Perfect Movie Game!</h1>
          <p className="description">
            You'll choose two movies.  We'll add the Rotten Tomatoes Movie Scores together to see if you can hit 100% without going over.
            Enter the name of a movie to get started!
          </p>

          <div className="movie-inputs">
            <h2>Movie 1: </h2>
            <div className="movie">
              <div className="movie-input">
                <input className="movie-input__child input-text" type="text" name="movie1" onChange={this.movie1OnChange} value={this.state.movie1.title} />
                <button className="movie-input__child button" id="movie1Submit" onClick={this.handleMovieEntry}>Submit</button>
              </div>
              <img src={this.state.movie1.poster}></img>
            </div>
            <h2>Movie 2: </h2>
            <div className="movie">
              <div className="movie-input">
                <input className="movie-input__child input-text" type="text" name="movie2" onChange={this.movie2OnChange} value={this.state.movie2.title} />
                <button className="movie-input__child button" id="movie2Submit" onClick={this.handleMovieEntry}>Submit</button>
              </div>
              <img src={this.state.movie2.poster}></img>
            </div>
          </div>

          <div className="row">
            <h1>{this.state.movie1.score} + {this.state.movie2.score} = {this.calculateScore()}</h1>
          </div>
        </div>

        <style jsx>{`
      .body {
        background: rgb(255,255,255);
        background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(42,190,189,1) 100%);
      }
      .hero {
        width: 100%;
        color: #333;
      }
      .title {
        margin: 0;
        width: 100%;
        padding-top: 80px;
        line-height: 1.15;
        font-size: 48px;
      }
      .title,
      .description {
        text-align: center;
      }
      .row {
        max-width: 880px;
        margin: 1em auto;
        display: flex;
        flex-direction: row;
        justify-content: space-around;
      }
      .movie {
        display: flex;
        flex-direction: row;
      }
      .movie-inputs {
        max-width: 880px;
        margin: 1em auto;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
      }
      .movie-input {
        display: flex;
        flex-direction: column;
        flex: auto;
      }
      .movie-input__child {
        flex: 0 0 0;
        margin: 1em;
      }
      .input-text {
        padding: 1em;
      }
      .button {
        background-color: #398AD7;
        border: none;
        border-radius: 5px;
        -webkit-appearance: none;
        padding: 1.5em;
        font-size: 1em;
      }
    `}</style>
      </div>
    )
  };
}