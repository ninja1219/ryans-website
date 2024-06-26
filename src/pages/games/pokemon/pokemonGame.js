import React from 'react';
import PokemonBackgroundImage from "./images/pokemon-background.jpg";
import PokemonBattleImage from "./images/pokemon-battle.jfif";
import Pokemon from "./pokemon";

// Position Possibilities:
// player: h: 0 to 1025, v: 0 to 400
// pokemon h: 0 to 1025, v: -100 to 315

// TODO:
//    - Fix evolution issues with pokemon that can evolve but aren't
//    - Sort all pokemon in pokedex when pokemon outside generation are added from evolutions
//    - Make multiple areas to visit (where certain types appear in each area - possibly with some overlap)
//    - Implement gym battles (moves, strength (based on number of the pokemon caught), gym pokemon, etc.)
//        - Must fight next gym if playerExp is so high (like maybe every 30-40)
//    - Update rules to match what is going on
//    - Separate into multiple components
// - Maybes:
//    - I could have wild pokemon move around randomly
//    - I could add items (pokeballs, berries, potions, evolution stones, etc.), but this isn't necessary
//    - I could have trainers pop up randomly as well
//    - I could have multiple pokemon pop up at once


// Gym Leader Types
let gymTypesMap = new Map();
gymTypesMap.set(1, "grass");
gymTypesMap.set(2, "water");
gymTypesMap.set(3, "fire");
gymTypesMap.set(4, "fighting");
gymTypesMap.set(5, "electric");
gymTypesMap.set(6, "rock");
gymTypesMap.set(7, "dark");
gymTypesMap.set(8, "dragon");

let gymExpMap = new Map();
gymExpMap.set(1, 80);
gymExpMap.set(2, 110);
gymExpMap.set(3, 140);
gymExpMap.set(4, 170);
gymExpMap.set(5, 200);
gymExpMap.set(6, 230);
gymExpMap.set(7, 260);
gymExpMap.set(8, 290);


// PokeAPI evolution fetch methods

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

        let playerExp = 52;
        if (this.props.genNum >= 4 && this.props.genNum <= 7) {
            playerExp = 57;
        }
        else if (this.props.genNum === 0) {
            playerExp = 42;
        }

        this.state = {
            playerExp: playerExp,
            primary: null,
            sceneNumber: 0,
            gymNum: 1,
            playerTopPos: 200,
            playerLeftPos: 512,
            playerBattleTopPos: 200,
            playerBattleLeftPos: 150,
            randPokeIndex: -1,
            randTopPos: 0,
            randLeftPos: 0,
            gymBattleTopPos: 120,
            gymBattleLeftPos: 875,
            caughtPokemon: caughtMap,  // pokemon id to # caught
            numCaughtPokemon: 0,
            pokemonMap: pokeMap,  // pokemon id to pokemon data
            lastCaughtPokemon: null,
            lastEvolvedPokemon: null,
            currClickedCaughtPokemonId: null,
            partyPokemon: []
        }
    }

    handleKeyDown(event) {
        if (this.state.sceneNumber === 3) {
            this.handleKeyDownBattle(event);
            return;
        }

        // Update player position
        this.updatePlayerPosition(event);

        // Check if player caught pokemon
        const pokemon = this.filterPokemon();
        if (this.state.randPokeIndex !== -1) {
            const playerPos = document.getElementById("wildPokemon").getBoundingClientRect();
            const pokemonPos = document.getElementById("player").getBoundingClientRect();
            if (playerPos.right > pokemonPos.left && playerPos.left < pokemonPos.right && playerPos.top < pokemonPos.bottom && playerPos.bottom > pokemonPos.top) {
                this.updateCaughtPokemon(pokemon[this.state.randPokeIndex], true);
            }
        }

        // Check if pokemon appears or vanishes
        const randNum = Math.floor(Math.random() * 100);
        if (this.state.randPokeIndex === -1 && randNum < 10) {  // 10% Chance of Pokemon Appearing
            this.changeRandPokemon(pokemon.length);
        }
        else if (randNum < 1) {  // 1% Chance of Pokemon Fleeing
            this.setState({
                randPokeIndex: -1
            });
        }
    }

    handleKeyDownBattle(event) {
        // TODO!
        // Ideas:
        //    - Switch off being chaser and runner, and if caught, damage is dealt based on how strong the pokemon is
        //    - Have a timer so the catcher has to tag the runner in 15 seconds or so
        //    - I might want to create a different component for this to keep the code cleaner (maybe not though)
        //    - Upon winning, gain 5-10 experience and update gymNum in state (after decrementing scene num)
        //    - When switching between chaser and runner, send both pokemon to random locations on the field

        this.updatePlayerPosition(event);
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
            primary: starter,
            caughtPokemon: caughtMap,
            numCaughtPokemon: 1,
            partyPokemon: [starter]
        });
        this.incrementScene(1);
    }

    setPrimary(primary) {
        this.setState({
            primary: primary
        });
    }

    async updateCaughtPokemon(currPokemon, firstCall) {
        const currPlayerExp = this.state.playerExp;
        const currCaughtPokemonMap = this.state.caughtPokemon;
        const currPokemonMap = this.state.pokemonMap;

        let newCaughtPokemonMap = new Map(currCaughtPokemonMap);
        let numCaughtPokemon = this.state.numCaughtPokemon;
        if (firstCall) {
            newCaughtPokemonMap.set(currPokemon.id, currCaughtPokemonMap.get(currPokemon.id)+1);
            numCaughtPokemon++;
        }
        let newPokemonMap = new Map(currPokemonMap);

        // Check if pokemon evolves
        let playerExpToAdd = (numCaughtPokemon % 4 === 0 ? 1 : 0);
        if (newCaughtPokemonMap.get(currPokemon.id) >= (this.props.genNum === 0 ? 3 : 6)) {
            const nextEvolution = await getPokemonEvolution(currPokemon.name);

            if (nextEvolution !== null) {
                playerExpToAdd = 5;
                if (!newCaughtPokemonMap.has(nextEvolution.id)) {
                    newCaughtPokemonMap.set(nextEvolution.id, 0);
                    newPokemonMap.set(nextEvolution.id, nextEvolution);
                }
                newCaughtPokemonMap.set(nextEvolution.id, newCaughtPokemonMap.get(nextEvolution.id)+1);
                newCaughtPokemonMap.set(currPokemon.id, 0);

                // Update primary pokemon
                const primary = this.state.primary;
                let newPrimary = primary;
                if (primary.id === currPokemon.id) {
                    newPrimary = nextEvolution;
                }

                // Update party pokemon
                const partyPokemon = this.state.partyPokemon;
                let newPartyPokemon = [];
                let nextEvoInParty = false;
                let pokemonInParty = false;
                for (const currPartyPokemon of partyPokemon) {
                    if (currPartyPokemon.id === currPokemon.id) {
                        pokemonInParty = true;
                    }
                    else if (currPartyPokemon.id === nextEvolution.id) {
                        nextEvoInParty = true;
                    }
                    else {
                        newPartyPokemon.push(currPartyPokemon);
                    }
                }
                if (pokemonInParty || nextEvoInParty) {
                    newPartyPokemon.push(nextEvolution);
                }

                this.setState({
                    primary: newPrimary,
                    lastEvolvedPokemon: nextEvolution,
                    partyPokemon: newPartyPokemon
                });

                this.updateCaughtPokemon(nextEvolution, false);
            }
        }

        this.setState({
            playerExp: currPlayerExp + playerExpToAdd,
            randPokeIndex: -1,
            caughtPokemon: newCaughtPokemonMap,
            numCaughtPokemon: numCaughtPokemon,
            pokemonMap: newPokemonMap,
            lastCaughtPokemon: currPokemon
        });
    }

    changeRandPokemon(pokemonLen) {
        this.setState({
            randPokeIndex: Math.floor(Math.random() * pokemonLen),
            randTopPos: Math.floor(Math.random() * 400) - 100,
            randLeftPos: Math.floor(Math.random() * 1025)
        });
    }

    incrementScene(num) {
        const currNum = this.state.sceneNumber;
        this.setState({
            sceneNumber: currNum+num
        });

        // Place pokemon in correct starting positions for gym battles
        if (currNum+num === 3) {
            this.setState({
                playerBattleTopPos: 200,
                playerBattleLeftPos: 125,
                gymBattleTopPos: 105,
                gymBattleLeftPos: 905,
            });
        }
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

    filterPokemonForGym() {
        const gymNum = this.state.gymNum;
        let filteredPokemon = [];

        for (const pokemon of this.props.pokemon) {
            if (pokemon.base_experience < gymExpMap.get(gymNum) && pokemon.base_experience > (gymExpMap.get(gymNum)-60)) {
                for (const type of pokemon.types) {
                    if (type.type.name === gymTypesMap.get(gymNum)) {
                        filteredPokemon.push(pokemon);
                    }
                }
            }
        }

        if (filteredPokemon.length > 6) {
            let newFilteredPokemon = [];
            let randNums = new Set();
            while (randNums.size < 6) {
                randNums.add(Math.floor(Math.random() * filteredPokemon.length));
            }

            for (const num of randNums) {
                newFilteredPokemon.push(filteredPokemon[num]);
            }
            filteredPokemon = newFilteredPokemon;
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

    removePartyPokemon(partyPokeId) {
        const currPartyPokemon = this.state.partyPokemon;
        let newPartyPokemon = [];
        for (const pokemon of currPartyPokemon) {
            if (pokemon.id !== partyPokeId) {
                newPartyPokemon.push(pokemon);
            }
        }

        this.setState({
            partyPokemon: newPartyPokemon
        });
    }

    addPartyPokemon(pokemon) {
        const currPartyPokemon = this.state.partyPokemon;
        if (currPartyPokemon.length < 6) {
            let canAdd = true;
            for (const currPokemon of currPartyPokemon) {
                if (pokemon.id === currPokemon.id) {
                    canAdd = false;
                }
            }

            if (canAdd) {
                this.setState({
                    partyPokemon: currPartyPokemon.concat(pokemon)
                });
            }
            else {
                console.log("Pokemon already in party");
            }
        }
        else {
            console.log("You cannot add more than 6 pokemon to your party. Remove one or more first.");
        }
    }

    render() {
        const pokemon = this.filterPokemon();
        // console.log(this.props.pokemon);
        const {
            playerExp,
            primary,
            sceneNumber,
            gymNum,
            playerTopPos,
            playerLeftPos,
            playerBattleTopPos,
            playerBattleLeftPos,
            randPokeIndex,
            randTopPos,
            randLeftPos,
            gymBattleTopPos,
            gymBattleLeftPos,
            caughtPokemon,
            numCaughtPokemon,
            pokemonMap,
            lastCaughtPokemon,
            lastEvolvedPokemon,
            currClickedCaughtPokemonId,
            partyPokemon
        } = this.state;

        const index = this.props.genNum === 5 ? 1 : 0;
        const grassStarterData = this.props.pokemon[index];
        const fireStarterData = this.props.pokemon[index+3];
        const waterStarterData = this.props.pokemon[index+6];

        let primaryPokemon = null;
        if (primary !== null) {
            let transform = "scale(0.5)";
            let sideLen = "250px";
            if (currClickedCaughtPokemonId === `Primary-${primary.id}`) {
                transform = "scale(1)";
                sideLen = "500px";
            }

            primaryPokemon = (
                <div key={`Primary-${primary.id}`} onClick={ () => this.updatePokeImgStyle(`Primary-${primary.id}`) } style={{"width": sideLen, "height": sideLen, "transform": transform, "transformOrigin": "top left", "margin": "5px"}}>
                    <Pokemon pokeData={pokemonMap.get(primary.id)} trivia={false} />
                </div>
            );
        }

        const currPartyPokemon = [];
        partyPokemon.forEach((partyPoke) => {
            const partyPokeId = `partyPoke-${partyPoke.id}`

            let transform = "scale(0.5)";
            let sideLen = "250px";
            if (currClickedCaughtPokemonId === partyPokeId) {
                transform = "scale(1)";
                sideLen = "500px";
            }

            currPartyPokemon.push(
                <div key={partyPokeId}>
                    <div onClick={ () => this.updatePokeImgStyle(partyPokeId) } style={{"width": sideLen, "height": sideLen, "transform": transform, "transformOrigin": "top left", "margin": "5px"}}>
                        <Pokemon pokeData={pokemonMap.get(partyPoke.id)} trivia={false} />
                    </div>
                    <div style={{"display": "flex", "justifyContent": "center"}}>
                        <button onClick={() => this.removePartyPokemon(partyPoke.id)}>Remove from Party</button>
                    </div>
                </div>
            );
        });

        const pokedex = [];
        Array.from(caughtPokemon.entries()).forEach(([pokemonId, count]) => {
            if (count > 0) {
                const pokeId = `${pokemonId}`

                let transform = "scale(0.5)";
                let sideLen = "250px";
                if (currClickedCaughtPokemonId === pokeId) {
                    transform = "scale(1)";
                    sideLen = "500px";
                }

                pokedex.push(
                    <div key={pokeId}>
                        <div style={{"display": "flex", "flexDirection": "column", "alignItems": "center"}}>
                            <p style={{"margin": "5px", "marginBottom": "0px"}}>Caught: {count}</p>

                            <div onClick={ () => this.updatePokeImgStyle(pokeId) } style={{"width": sideLen, "height": sideLen, "transform": transform, "transformOrigin": "top left", "margin": "5px"}}>
                                <Pokemon pokeData={pokemonMap.get(pokemonId)} trivia={false} />
                            </div>
                        
                            <div>
                                <button onClick={() => this.setPrimary(pokemonMap.get(pokemonId))}>Set as Primary</button>
                                <button onClick={() => this.addPartyPokemon(pokemonMap.get(pokemonId))} style={{"marginLeft": "50px"}}>Add to Party</button>
                            </div>
                        </div>
                    </div>
                );
            }
        });

        const gymPartyPokemon = [];
        partyPokemon.forEach((partyPoke) => {
            gymPartyPokemon.push(
                <div key={`gymPartyPoke-${partyPoke.id}`} style={{"display": "flex", "flexDirection": "column", "justifyContent": "center"}}>
                    <img src={partyPoke.sprites.front_default} alt='pokemon' />
                    <p>{partyPoke.name}!</p>
                </div>
            );
        });

        const gymPokemon = this.filterPokemonForGym();
        const gymPokemonList = [];
        gymPokemon.forEach((partyPoke) => {
            gymPokemonList.push(
                <div key={`gymPartyPoke-${partyPoke.id}`} style={{"display": "flex", "flexDirection": "column", "justifyContent": "center"}}>
                    <img src={partyPoke.sprites.front_default} alt='pokemon' />
                    <p>{partyPoke.name}!</p>
                </div>
            );
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
                                        <h4># Caught Pokemon: {numCaughtPokemon}</h4>
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
                                            <img src={primary.sprites.front_default} alt='pokemon' />
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
                                <h2>Gym {gymNum}</h2>

                                <button onClick={() => this.decrementScene(1)}>Back</button>

                                <div style={{"margin": "auto", "marginBottom": "50px"}}>
                                    <h4 style={{"width": "fit-content", "margin": "auto"}}>Click within the box when ready to move</h4>

                                    <div style={{"display": "flex"}}>
                                        <div style={{"width": "15%", "height": "500px", "display": "flex", "flexDirection": "column", "alignItems": "center", "overflowY": "auto"}}>
                                            <h2>Party Pokemon</h2>
                                            {gymPartyPokemon}
                                        </div>

                                        <div onKeyDown={ this.handleKeyDown } tabIndex="0" style={{"width": "70%", "height": "500px"}}>
                                            <img src={PokemonBattleImage} alt='pokemon' style={{"position": "absolute", "width": "66.7%", "height": "500px", "border": "solid 2px black"}} />

                                            <div id="player" style={{"width": "60px", "position": "relative", "top": playerBattleTopPos, "left": playerBattleLeftPos}}>
                                                <img src={primary.sprites.front_default} alt='pokemon' />
                                            </div>
                                            
                                            <div id="gymPokemon" style={{"width": "60px", "position": "relative", "top": gymBattleTopPos, "left": gymBattleLeftPos}}>
                                                <img src={gymPokemon[0].sprites.front_default} alt='pokemon' />
                                            </div>
                                        </div>

                                        <div style={{"width": "15%", "height": "500px", "display": "flex", "flexDirection": "column", "alignItems": "center", "overflowY": "auto"}}>
                                            <h2>Gym Pokemon</h2>
                                            {gymPokemonList}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) :
                        null
                    }
                    {  // Viewing Pokemon Scene
                        sceneNumber === 4 ?
                        (
                            <div>
                                <button onClick={() => this.decrementScene(2)}>Back</button>

                                <div style={{"margin": "auto", "width": "98%"}}>
                                    <hr style={{"marginTop": "30px"}} />

                                    <h2>Primary Pokemon</h2>
                                    <div>
                                        {primaryPokemon}
                                    </div>

                                    <hr style={{"marginTop": "30px"}} />

                                    <h2>Party Pokemon</h2>
                                    <div style={{"display": "flex", "flexWrap": "wrap"}}>
                                        {currPartyPokemon}
                                    </div>

                                    <hr style={{"marginTop": "30px"}} />

                                    <h2>Pokedex</h2>
                                    <div style={{"display": "flex", "flexWrap": "wrap"}}>
                                        {pokedex}
                                    </div>

                                    <hr style={{"marginTop": "30px"}} />
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