import React from 'react';
import './pokedex.css';
import PokemonGame from "./pokemonGame";
import Pokemon from "./pokemon";

class Generation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pokemon: [],
            currPokeData: null,
            randomIndex: 0,
            triviaGame: false,
            triviaGuess: "",
            showTriviaPokeName: false,
            pokemonGame: false,
            loading: true
        };

        this.handleChange = this.handleChange.bind(this);
    }

    async fetchPokemon(pokemon) {
        const url = pokemon.url;
        const response = await fetch(url);
        return await response.json();
    }

    fetchGen(genNum) {
        const offsets = [0, 0, 151, 251, 386, 493, 649, 721, 809, 905];
        const limits = [1025, 151, 100, 135, 107, 156, 72, 88, 96, 120];

        const url = "https://pokeapi.co/api/v2/pokemon?offset=" + offsets[genNum] + "&limit=" + limits[genNum];
        fetch(url)
            .then(response => response.json())
            .then(allPokemon => {
                const promises = allPokemon.results.map(pokemon => this.fetchPokemon(pokemon));
                Promise.all(promises).then(allData => {
                    this.setState({ pokemon: allData });
                });
            });
    }

    componentDidMount() {
        this.fetchGen(this.props.genNum);
    }

    componentDidUpdate(prevProps) {
        if (this.props.genNum !== prevProps.genNum) {
            this.fetchGen(this.props.genNum);
        }
    }

    loadPokemon(pokeData) {
        this.setState({
            currPokeData: pokeData
        });
    }

    loadTriviaGame() {
        const pokemonLen = this.state.pokemon.length;
        this.setState({
            randomIndex: Math.floor(Math.random() * pokemonLen),
            triviaGame: true,
            triviaGuess: "",
            showTriviaPokeName: false
        });
    }

    nextTriviaQuestion() {
        const pokemonLen = this.state.pokemon.length;
        this.setState({
            randomIndex: Math.floor(Math.random() * pokemonLen),
            triviaGuess: "",
            showTriviaPokeName: false
        });
    }

    showName(name) {
        this.setState({
            triviaGuess: name,
            showTriviaPokeName: true
        });
    }

    exitGame() {
        this.setState({
            triviaGame: false,
            pokemonGame: false
        });
    }

    handleChange(event) {
        if (!this.state.showTriviaPokeName) {
            this.setState({
                triviaGuess: event.target.value.toLowerCase()
            });
        }
    }

    loadPokemonGame() {
        this.setState({
            pokemonGame: true
        });
    }

    render() {
        const {
            pokemon, 
            currPokeData, 
            randomIndex, 
            triviaGame, 
            triviaGuess, 
            showTriviaPokeName, 
            pokemonGame,
            loading
        } = this.state;

        const links = pokemon.map((pokeData) => {
            return (
                <div key={"#" + pokeData.id}>
                    <button onClick={() => this.loadPokemon(pokeData)}>
                        {"#" + pokeData.id + " " + pokeData.name}
                    </button>
                </div>
            );
        });

        if (loading && links.length > 0) {
            this.setState({
                loading: false
            });
        }

        return (
            <div>
                <h1>{this.props.genNum === 0 ? "All Pokemon" : "Generation " + this.props.genNum}</h1>

                { triviaGame ?
                    (
                        <div id="trivia-game">
                            <Pokemon pokeData={pokemon[randomIndex]} trivia={true}/>

                            <div style={{"margin": "20px"}}>
                                <input
                                    type="text"
                                    value={ showTriviaPokeName ? pokemon[randomIndex].name : triviaGuess }
                                    onChange={this.handleChange}
                                />
                                <button onClick={ () => this.nextTriviaQuestion() }>Next</button>
                                <button onClick={ () => this.showName(pokemon[randomIndex].name) }>Give Up</button>
                                <button onClick={ () => this.exitGame() }>Exit Game</button>
                                {
                                    triviaGuess === pokemon[randomIndex].name ? 
                                    <h2>Correct!</h2> :
                                    <h2>Incorrect!</h2>
                                }
                            </div>
                        </div>
                    ) :
                    ( pokemonGame ?
                        (
                            <div>
                                <button onClick={ () => this.exitGame() }>Exit Game</button>
                                <PokemonGame pokemon={pokemon} genNum={this.props.genNum}/>
                            </div>
                        ) :
                        (
                            <div>
                                {
                                    !loading ?
                                    <div style={{"width": "250px"}}>
                                        <button onClick={ () => this.loadTriviaGame() } style={{"marginBottom": "20px"}}>Trivia Game</button>
                                        <button onClick={ () => this.loadPokemonGame() } style={{"marginBottom": "20px", "float": "right"}}>Pokemon Game</button>
                                    </div> :
                                    null
                                }
                                <div className="grouping" id="pokedex-grouping">
                                    <div id="pokemon-list">
                                        {links}
                                    </div>

                                    <div id="selected-pokemon">
                                        { currPokeData !== null ? <Pokemon pokeData={currPokeData} trivia={false}/> : null }
                                    </div>
                                </div>
                            </div>
                        )
                    )
                }
            </div>
        );
    }
}

class Pokedex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            genNum: 0,
            showGen: false
        }
    }

    loadGen(genNum) {
        this.setState({
            genNum: genNum,
            showGen: true
        })
    }

    render() {
        const genNums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const generations = genNums.map((genNum) => {
            return (
                <div key={"gen" + genNum} style={{display: "inline-block", margin: "5px"}}>
                    <button onClick={ () => this.loadGen(genNum) }>
                        { genNum === 0 ? "All Pokemon" : "Generation " + genNum }
                    </button>
                </div>
            );
        });

        return (
            <div id='pokedex' style={{margin: "20px"}}>
                <div id="generations-list">
                    { generations }
                </div>
                <div id="curr-generation">
                    { this.state.showGen ? <Generation genNum={this.state.genNum} /> : null }
                </div>
            </div>
        );
    }
}

export default Pokedex;