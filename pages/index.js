import React, { Component } from 'react'
import Head from 'next/head'

export default class Home extends Component {
  constructor(props) {
    super(props)

    this.state = {
      movie1: '',
      movie2: '',
      movie1Score: '__',
      movie2Score: '__'
    }

    this.movie1OnChange = this.movie1OnChange.bind(this);
    this.movie2OnChange = this.movie2OnChange.bind(this);
    this.handleMovieEntry = this.handleMovieEntry.bind(this);
  }

  movie1OnChange(event) { this.setState({ movie1: event.target.value }) }
  movie2OnChange(event) { this.setState({ movie2: event.target.value }) }

  async handleMovieEntry(event) {
    const id = event.target.id;

    let submit = this.state.movie2;

    if (!this.state.movie2)
      submit = this.state.movie1;

    const res = await fetch(`/api/getScore`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        movie: submit
      })
    });
    const score = (await res.json()).score;

    let update = { movie1Score: score + '%' };

    if (!(id === 'movie1Submit')) {
      update = { movie2Score: score + '%' };
    }

    this.setState(update)
  }

  calculateScore() {
    return Number(this.state.movie1Score.replace(/\D/g, ''))
      + Number(this.state.movie2Score.replace(/\D/g, ''))
      + '%';
  }

  render() {
    return (
      <div>
        <Head>
          <title>Home</title>
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
            <div className="movie-input">
              <input className="movie-input__child" type="text" name="movie1" onChange={this.movie1OnChange} value={this.state.movie1} />
              <button className="movie-input__child" id="movie1Submit" onClick={this.handleMovieEntry}>Submit</button>
            </div>
            <h2>Movie 2: </h2>
            <div className="movie-input">
              <input className="movie-input__child" type="text" name="movie2" onChange={this.movie2OnChange} value={this.state.movie2} />
              <button className="movie-input__child" id="movie2Submit" onClick={this.handleMovieEntry}>Submit</button>
            </div>
          </div>

          <div className="row">
            <h1>{this.state.movie1Score} + {this.state.movie2Score} = {this.state.movie2Score !== '__' ? this.calculateScore() : '?'}</h1>
          </div>
        </div>

        <style jsx>{`
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
        flex:auto;
        margin: 1em;
      }
    `}</style>
      </div>
    )
  };
}