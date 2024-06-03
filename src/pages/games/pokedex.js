import React from 'react';
import './pokedex.css';

const pokeColor = {
    normal: '#facd4b',
    fire: '#f0776a',
    water: '#58abf6',
    electric: '#facd4b',
    grass: '#64dbb2',
    ice: '#58abf6',
    fighting: '#ca8179',
    poison: '#9f5bba',
    ground: '#ca8179',
    flying: '#58abf6',
    psychic: '#9f5bba',
    bug: '#64dbb2',
    rock: '#ca8179',
    ghost: '#9f5bba',
    dragon: '#f0776a',
    dark: '#9f5bba',
    steel: '#facd4b',
    fairy: '#64dbb2'
}

class Pokemon extends React.Component {
    render() {
        const types = this.props.pokeData.types.map((type, i) => {
            return (
                <div className='pokeSkill' key={i}>
                    {type.type.name}
                </div>
            );
        });
        const backgroundColor = pokeColor[this.props.pokeData.types[0].type.name];

        return (
            <div id="pokemon">
                <div className='pokeType' style={{ backgroundColor: backgroundColor }}>
                    <img className='pokeImage' src={this.props.pokeData.sprites.front_default} alt='pokemon' />
                    <div className='pokeName'>
                        {this.props.pokeData.name}
                    </div>
                    <div className='pokeOwned'>
                        <div># <span>{this.props.pokeData.order}</span></div>
                    </div>
                    <div className='pokeTypes'>
                        {types}
                    </div>
                </div>
            </div>
        )
    }
}

class Generation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pokemon: [],
            currPokeData: null
        };
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

    render() {
        const { pokemon } = this.state;

        const links = pokemon.map((pokeData) => {
            return (
                <div key={"#" + pokeData.id}>
                    <button onClick={() => this.loadPokemon(pokeData)}>
                        {"#" + pokeData.id + " " + pokeData.name}
                    </button>
                </div>
            );
        });

        return (
            <div>
                <h1>{this.props.genNum === 0 ? "All Pokemon" : "Generation " + this.props.genNum}</h1>

                <div id="pokemon-list">
                    {links}
                </div>

                <div id="selected-pokemon">
                    { this.state.currPokeData !== null ? <Pokemon pokeData={this.state.currPokeData}/> : null }
                </div>
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