import React from 'react';
import PokemonBackgroundImage from "./images/pokemon-background.jpg";
import Pokemon from "./pokemon";

// Position Possibilities:
// player: h: 0 to 1025, v: 0 to 400
// pokemon h: 0 to 1025, v: -100 to 315

// TODO:
//    - Add 6 party pokemon to state and ability to add pokemon to your party
//        - Change starter pokemon to primary and have 1st pokemon in party be the primary pokemon
//    - Fix evolution issues with pokemon that can evolve but aren't
//    - Sort all pokemon in pokedex when pokemon outside generation are added from evolutions
//    - Implement gym battles (moves, strength (based on number of the pokemon caught), gym pokemon, etc.)
//        - Must fight next gym if playerExp is so high (like maybe eery 30-40)
//    - Update rules to match what is going on
//    - Make sure evolution and playerExp is working good
//    - Separate into multiple components
// - Maybes:
//    - I could have wild pokemon move around randomly
//    - I could add items (pokeballs, berries, potions, evolution stones, etc.), but this isn't necessary
//    - I could have trainers pop up randomly as well
//    - I could have multiple pokemon pop up at once


// PokeAPI fetch methods

async function fetchPokemonSpecies(pokemonName) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}/`);
    const data = await response.json();
    return data;
}

async function fetchEvolutionChain(evolutionChainUrl) {
    const response = await fetch(evolutionChainUrl);
    const data = await response.json();
    return data;
}

function extractEvolutions(evolutionChain) {
    let evolutions = [];
    let currentEvolution = evolutionChain.chain;

    do {
        let species = currentEvolution.species;
        evolutions.push({
            name: species.name,
            url: species.url
        });

        currentEvolution = currentEvolution.evolves_to[0];
    } while (currentEvolution);

    return evolutions;
}

async function getPokemonEvolution(pokemonName) {
    try {
        const speciesData = await fetchPokemonSpecies(pokemonName);
        const evolutionChainUrl = speciesData.evolution_chain.url;
        const evolutionChainData = await fetchEvolutionChain(evolutionChainUrl);
        const evolutions = extractEvolutions(evolutionChainData);

        // Fetch the IDs of the evolutions
        let nextIsEvolution = false;
        for (let evolution of evolutions) {
            if (nextIsEvolution) {
                const pokemonData = await fetch(`https://pokeapi.co/api/v2/pokemon/${evolution.name}/`);
                const pokemonInfo = await pokemonData.json();
                return pokemonInfo;
            }
            else if (evolution.name === pokemonName) {
                nextIsEvolution = true;
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching evolution data:', error);
        return null;
    }
}

class PokemonGame extends React.Component {
    constructor(props) {
        super(props);

        this.handleKeyDown = this.handleKeyDown.bind(this);

        let caughtMap = new Map();
        let pokeMap = new Map();
        for (const pokemon of this.props.pokemon) {
            caughtMap.set(pokemon.id, 0);
            pokeMap.set(pokemon.id, pokemon);
        }

        let playerExp = 50;
        if (this.props.genNum === 5) {
            playerExp = 56;
        }
        else if (this.props.genNum === 0) {
            playerExp = 40;
        }

        this.state = {
            playerExp: playerExp,
            starter: null,
            sceneNumber: 0,
            gymNum: 0,
            playerTopPos: 200,
            playerLeftPos: 512,
            randPokeIndex: -1,
            randTopPos: 0,
            randLeftPos: 0,
            caughtPokemon: caughtMap,  // pokemon id to # caught
            pokemonMap: pokeMap,  // pokemon id to pokemon data
            lastCaughtPokemon: null,
            lastEvolvedPokemon: null,
            currClickedCaughtPokemonId: null
        }
    }

    handleKeyDown(event) {
        // Update player position
        this.updatePlayerPosition(event);

        // Check if player caught pokemon
        const pokemon = this.filterPokemon();
        if (this.state.randPokeIndex !== -1) {
            const playerPos = document.getElementById("wildPokemon").getBoundingClientRect();
            const pokemonPos = document.getElementById("player").getBoundingClientRect();
            if (playerPos.right > pokemonPos.left && playerPos.left < pokemonPos.right && playerPos.top < pokemonPos.bottom && playerPos.bottom > pokemonPos.top) {
                this.updateCaughtPokemon(pokemon);
            }
        }

        // Check if pokemon appears or vanishes
        const randNum = Math.floor(Math.random() * 100);
        if (this.state.randPokeIndex === -1 && randNum < 10) {  // 10% Chance of Pokemon Appearing
            this.changeRandPokemon(pokemon);
        }
        else if (randNum < 1) {  // 1% Chance of Pokemon Fleeing
            this.setState({
                randPokeIndex: -1
            });
        }
    }

    updatePlayerPosition(event) {
        const currTopPos = this.state.playerTopPos;
        const currLeftPos = this.state.playerLeftPos;

        if (event.keyCode === 37) { // Left
            if (currLeftPos >= 20) {
                this.setState({
                    playerLeftPos: currLeftPos-20
                });
            }
        }
        else if (event.keyCode === 38) {  // Up
            if (currTopPos >= 20) {
                this.setState({
                    playerTopPos: currTopPos-20
                });
            }
        }
        else if (event.keyCode === 39) {  // Right
            if (currLeftPos <= 1005) {
                this.setState({
                    playerLeftPos: currLeftPos+20
                });
            }
        }
        else if (event.keyCode === 40) {  // Down
            if (currTopPos <= 380) {
                this.setState({
                    playerTopPos: currTopPos+20
                });
            }
        }
    }

    setStarter(starter) {
        // Set up caughtPokemon map
        let caughtMap = new Map(this.state.caughtPokemon);
        caughtMap.set(starter.id, caughtMap.get(starter.id)+1);

        this.setState({
            starter: starter,
            caughtPokemon: caughtMap
        });
        this.incrementScene(1);
    }

    async updateCaughtPokemon(pokemon) {
        const currPokemon = pokemon[this.state.randPokeIndex];
        const currPlayerExp = this.state.playerExp;
        const currCaughtPokemonMap = this.state.caughtPokemon;
        const currPokemonMap = this.state.pokemonMap;

        let newCaughtPokemonMap = new Map(currCaughtPokemonMap);
        newCaughtPokemonMap.set(currPokemon.id, currCaughtPokemonMap.get(currPokemon.id)+1);
        let newPokemonMap = new Map(currPokemonMap);

        // Check if pokemon evolves
        let playerExpToAdd = 0.5
        if (newCaughtPokemonMap.get(currPokemon.id) >= 6) {
            const nextEvolution = await getPokemonEvolution(currPokemon.name);

            if (nextEvolution !== null) {
                playerExpToAdd = 3;
                if (!newCaughtPokemonMap.has(nextEvolution.id)) {
                    newCaughtPokemonMap.set(nextEvolution.id, 0);
                    newPokemonMap.set(nextEvolution.id, nextEvolution);
                }
                newCaughtPokemonMap.set(nextEvolution.id, newCaughtPokemonMap.get(nextEvolution.id)+1);
                newCaughtPokemonMap.set(currPokemon.id, 0);

                this.setState({
                    lastEvolvedPokemon: nextEvolution
                });
            }
        }

        this.setState({
            playerExp: currPlayerExp + playerExpToAdd,
            randPokeIndex: -1,
            caughtPokemon: newCaughtPokemonMap,
            pokemonMap: newPokemonMap,
            lastCaughtPokemon: currPokemon
        });
    }

    changeRandPokemon(pokemon) {
        this.setState({
            randPokeIndex: Math.floor(Math.random() * pokemon.length),
            randTopPos: Math.floor(Math.random() * 400) - 100,
            randLeftPos: Math.floor(Math.random() * 1025)
        });
    }

    incrementScene(num) {
        const currNum = this.state.sceneNumber;
        this.setState({
            sceneNumber: currNum+num
        });
    }

    decrementScene(num) {
        const currNum = this.state.sceneNumber;
        this.setState({
            sceneNumber: currNum-num
        });
    }

    filterPokemon() {
        let filteredPokemon = [];
        for (const pokemon of this.props.pokemon) {
            if (pokemon.base_experience < this.state.playerExp) {
                filteredPokemon.push(pokemon);
            }
        }
        return filteredPokemon;
    }

    updatePokeImgStyle(pokeId) {
        if (this.state.currClickedCaughtPokemonId === pokeId) {
            pokeId = null;
        }

        this.setState({
            currClickedCaughtPokemonId: pokeId
        });
    }

    render() {
        const pokemon = this.filterPokemon();
        // console.log(this.props.pokemon);
        const { 
            playerExp,
            starter, 
            sceneNumber, 
            gymNum, 
            playerTopPos, 
            playerLeftPos, 
            randPokeIndex, 
            randTopPos, 
            randLeftPos,
            caughtPokemon,
            pokemonMap,
            lastCaughtPokemon,
            lastEvolvedPokemon,
            currClickedCaughtPokemonId
        } = this.state;

        const index = this.props.genNum === 5 ? 1 : 0;
        const grassStarterData = this.props.pokemon[index];
        const fireStarterData = this.props.pokemon[index+3];
        const waterStarterData = this.props.pokemon[index+6];

        const pokedex = [];
        Array.from(caughtPokemon.entries()).forEach(([pokemonId, count]) => {
            for (let i = 0; i < count; i++) {
                const pokeId = `${pokemonId}-${i}`
                let transform = "scale(0.4)";
                let sideLen = "200px";
                if (currClickedCaughtPokemonId === pokeId) {
                    transform = "scale(0.8)";
                    sideLen = "400px";
                }

                pokedex.push(
                    <div key={pokeId} onClick={ () => this.updatePokeImgStyle(pokeId) } style={{"width": sideLen, "height": sideLen, "transform": transform, "transformOrigin": "top left", "margin": "5px"}}>
                        <Pokemon pokeData={pokemonMap.get(pokemonId)} trivia={false} />
                    </div>
                );
            }
        });

        return (
            <div>
                <div>
                    {  // Pick Starter Pokemon Scene
                        sceneNumber === 0 ?
                        (
                            <div>
                                <h3>Pick a starter pokemon!</h3>
                                <div style={{"display": "flex", "width": "fit-content", "margin": "auto"}}>
                                    <div>
                                        <img className='pokeImage' src={grassStarterData.sprites.front_default} alt='pokemon' />
                                        <button onClick={() => this.setStarter(grassStarterData)}>Choose {grassStarterData.name}</button>
                                    </div>
                                    <div>
                                        <img className='pokeImage' src={fireStarterData.sprites.front_default} alt='pokemon' />
                                        <button onClick={() => this.setStarter(fireStarterData)}>Choose {fireStarterData.name}</button>
                                    </div>
                                    <div>
                                        <img className='pokeImage' src={waterStarterData.sprites.front_default} alt='pokemon' />
                                        <button onClick={() => this.setStarter(waterStarterData)}>Choose {waterStarterData.name}</button>
                                    </div>
                                </div>
                            </div>
                        ) :
                        null
                    }
                    {  // Game Rules Scene
                        sceneNumber === 1 ?
                        (
                            <div>
                                <p>
                                    This game works by collecting as many pokemon as you can as they pop 
                                    up on the screen. The stronger and more rare the pokemon, the less 
                                    time they will appear on the screen. However, the stronger you
                                    are, the faster you will move as well. Rarer pokemon will not show 
                                    up as much and might not even show up at all until after a certain 
                                    point in the game. Use the arrow keys to move in the direction you 
                                    want, and if you run into a pokemon, you will collect it. When you 
                                    think you have strong enough pokemon, you can choose to battle the 
                                    next gym leader. If you collect enough of the same pokemon, the 
                                    pokemon will level up. You can access a database with all of your 
                                    caught pokemon and choose which ones you want in your team of 6 for 
                                    battling gym leaders.
                                </p>
                                <button onClick={() => this.incrementScene(1)}>Next</button>
                            </div>
                        ) :
                        null
                    }
                    {  // Catching Pokemon Scene
                        sceneNumber === 2 ?
                        (
                            <div style={{"margin": "auto"}}>
                                <h4 style={{"width": "fit-content", "margin": "auto"}}>Click within the box when ready to move</h4>

                                <div style={{"display": "flex"}}>
                                    <div style={{"width": "15%"}}>
                                        <h4>Player Exp: {playerExp}</h4>
                                        {
                                            lastCaughtPokemon !== null ?
                                            <div>
                                                <img src={lastCaughtPokemon.sprites.front_default} alt='pokemon' />
                                                <p>You caught {lastCaughtPokemon.name}!</p>
                                            </div> : 
                                            null
                                        }
                                        {
                                            lastEvolvedPokemon !== null ?
                                            <div>
                                                <img src={lastEvolvedPokemon.sprites.front_default} alt='pokemon' />
                                                <p>{lastEvolvedPokemon.name} evolved!</p>
                                            </div> :
                                            null
                                        }
                                    </div>

                                    <div onKeyDown={ this.handleKeyDown } tabIndex="0" style={{"width": "70%", "height": "500px"}}>
                                        <img src={PokemonBackgroundImage} alt='pokemon' style={{"position": "absolute", "width": "66.7%", "height": "500px", "border": "solid 2px black"}} />

                                        <div id="player" style={{"width": "60px", "position": "relative", "top": playerTopPos, "left": playerLeftPos}}>
                                            <img src={starter.sprites.front_default} alt='pokemon' />
                                        </div>
                                        
                                        {
                                            randPokeIndex !== -1 ?
                                            <div id="wildPokemon" style={{"width": "60px", "position": "relative", "top": randTopPos, "left": randLeftPos}}>
                                                <img src={pokemon[randPokeIndex].sprites.front_default} alt='pokemon' />
                                            </div> :
                                            null
                                        }
                                    </div>
                                </div>

                                <div style={{"display": "flex", "width": "fit-content", "margin": "auto", "marginTop": "5px"}}>
                                    <button style={{"margin": "5px"}} onClick={() => this.decrementScene(1)}>See Rules</button>
                                    <button style={{"margin": "5px"}} onClick={() => this.incrementScene(1)}>Fight Next Gym Leader</button>
                                    <button style={{"margin": "5px"}} onClick={() => this.incrementScene(2)}>View Pokemon</button>
                                </div>
                            </div>
                        ) :
                        null
                    }
                    {  // Battling Gym Leader Scene
                        sceneNumber === 3 ?
                        (
                            <div>
                                <button onClick={() => this.decrementScene(1)}>Back</button>

                                <h2>Gym {gymNum}</h2>
                            </div>
                        ) :
                        null
                    }
                    {  // Viewing Pokemon Scene
                        sceneNumber === 4 ?
                        (
                            <div>
                                <button onClick={() => this.decrementScene(2)}>Back</button>

                                <div style={{"margin": "auto", "width": "80%"}}>
                                    <h2>Pokedex</h2>
                                    <div style={{"display": "flex", "flexWrap": "wrap"}}>
                                        {pokedex}
                                    </div>
                                </div>
                            </div>
                        ) :
                        null
                    }
                </div>
            </div>
        );
    }
}

export default PokemonGame;