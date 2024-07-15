import React from 'react';
import PokemonBackgroundImage from "./images/pokemon-background.jpg";
import PokemonBattleImage from "./images/pokemon-battle.jfif";
import Pokemon from "./pokemon";

// Position Possibilities:
// player: h: 0 to 1025, v: 0 to 400
// pokemon h: 0 to 1025, v: -100 to 315

// TODO:
//    - Find better gym types for each generation
//    - Fix evolution issues with pokemon that can evolve but aren't
//    - Sort all pokemon in pokedex when pokemon outside generation are added from evolutions
//    - Make multiple areas to visit (where certain types appear in each area - possibly with some overlap)
//    - Update rules to match what is going on
//    - Separate into multiple components
// - Maybes:
//    - I could have wild pokemon move around randomly
//    - I could add items (pokeballs, berries, potions, evolution stones, etc.), but this isn't necessary
//    - I could have trainers pop up randomly as well
//    - I could have multiple pokemon pop up at once


// Gym Leader Types and Exp Levels
let gymTypesMap = new Map();
gymTypesMap.set(1, "grass");
gymTypesMap.set(2, "water");
gymTypesMap.set(3, "fire");
gymTypesMap.set(4, "fighting");
gymTypesMap.set(5, "electric");
gymTypesMap.set(6, "rock");
gymTypesMap.set(7, "ghost");
gymTypesMap.set(8, "dragon");

let gymExpMap = new Map();
gymExpMap.set(1, 90);
gymExpMap.set(2, 120);
gymExpMap.set(3, 150);
gymExpMap.set(4, 180);
gymExpMap.set(5, 210);
gymExpMap.set(6, 240);
gymExpMap.set(7, 270);
gymExpMap.set(8, 300);


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
            partyPokemon: [],
            gymPokemon: [],
            partyPokeIndex: 0,
            gymPokeIndex: 0,
            gymPokeIsChaser: false,
            gymStatus: null,
            gymTimer: 0
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
        this.updateGymPlayerPosition(event);

        const playerPos = document.getElementById("gymPlayer").getBoundingClientRect();
        const pokemonPos = document.getElementById("gymPokemon").getBoundingClientRect();
        if (this.state.gymPokeIsChaser) {
            if (this.state.gymTimer >= 50) {  // updates after 50 moves
                this.updateChaser(Date.now());
            }
            else {
                const currTimer = this.state.gymTimer;
                this.setState({
                    gymTimer: currTimer+1
                });
            }

            // Update gymPokePos - run toward player
            this.updateGymPokePosChaser(playerPos, pokemonPos);

            if (playerPos.right > pokemonPos.left && playerPos.left < pokemonPos.right && playerPos.top < pokemonPos.bottom && playerPos.bottom > pokemonPos.top) {
                const nextPartyPokeIndex = this.state.partyPokeIndex+1;
                if (this.state.partyPokemon.length > nextPartyPokeIndex) {
                    this.setState({
                        playerBattleTopPos: Math.floor(Math.random() * 400),
                        playerBattleLeftPos: Math.floor(Math.random() * 1025),
                        partyPokeIndex: nextPartyPokeIndex
                    });
                }
                else {
                    const currGymNum = this.state.gymNum;
                    this.setState({
                        sceneNumber: 2,
                        playerBattleTopPos: 200,
                        playerBattleLeftPos: 150,
                        gymBattleTopPos: 120,
                        gymBattleLeftPos: 875,
                        partyPokeIndex: 0,
                        gymPokeIndex: 0,
                        gymStatus: "You lost to the " + gymTypesMap.get(currGymNum) + " gym!"
                    });
                }
            }
        }
        else {
            if (Date.now() - this.state.gymTimer >= 10000) {  // Updates after 10 seconds
                this.updateChaser(0);
            }

            // Update gymPokePos - run away from player
            this.updateGymPokePosRunner(playerPos, pokemonPos);
            
            if (playerPos.right > pokemonPos.left && playerPos.left < pokemonPos.right && playerPos.top < pokemonPos.bottom && playerPos.bottom > pokemonPos.top) {
                const nextGymPokeIndex = this.state.gymPokeIndex+1;
                if (this.state.gymPokemon.length > nextGymPokeIndex) {
                    this.setState({
                        gymBattleTopPos: Math.floor(Math.random() * 400) - 100,
                        gymBattleLeftPos: Math.floor(Math.random() * 1025),
                        gymPokeIndex: nextGymPokeIndex
                    });
                }
                else {
                    const currPlayerExp = this.state.playerExp;
                    const currGymNum = this.state.gymNum;
                    this.setState({
                        playerExp: currPlayerExp+5,
                        sceneNumber: 2,
                        gymNum: currGymNum+1,
                        playerBattleTopPos: 200,
                        playerBattleLeftPos: 150,
                        gymBattleTopPos: 120,
                        gymBattleLeftPos: 875,
                        gymPokemon: this.filterPokemonForGym(currGymNum+1),
                        partyPokeIndex: 0,
                        gymPokeIndex: 0,
                        gymStatus: "You beat the " + gymTypesMap.get(currGymNum) + " gym!"
                    });
                }
            }
        }
    }

    updateChaser(timer) {
        const currChaser = this.state.gymPokeIsChaser;
        this.setState({
            gymPokeIsChaser: !currChaser,
            gymTimer: timer
        });
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

    updateGymPlayerPosition(event) {
        const currTopPos = this.state.playerBattleTopPos;
        const currLeftPos = this.state.playerBattleLeftPos;

        const stepsTaken = this.getStepsTaken();
        if (event.keyCode === 37) { // Left
            if (currLeftPos >= 0+stepsTaken) {
                this.setState({
                    playerBattleLeftPos: currLeftPos-stepsTaken
                });
            }
        }
        else if (event.keyCode === 38) {  // Up
            if (currTopPos >= 0+stepsTaken) {
                this.setState({
                    playerBattleTopPos: currTopPos-stepsTaken
                });
            }
        }
        else if (event.keyCode === 39) {  // Right
            if (currLeftPos <= 1025-stepsTaken) {
                this.setState({
                    playerBattleLeftPos: currLeftPos+stepsTaken
                });
            }
        }
        else if (event.keyCode === 40) {  // Down
            if (currTopPos <= 400-stepsTaken) {
                this.setState({
                    playerBattleTopPos: currTopPos+stepsTaken
                });
            }
        }
    }

    getStepsTaken() {
        const currPokemon = this.state.partyPokemon[this.state.partyPokeIndex];
        let baseExpStat = 50;
        for (const stat of currPokemon.stats) {
            if (stat.stat.name === "base-experience") {
                baseExpStat = stat.base_stat;
            }
        }

        const stepsTaken = 20 + Math.floor((baseExpStat + (this.state.caughtPokemon.get(currPokemon.id)*20)) / 50);

        return stepsTaken;
    }

    updateGymPokePosChaser(playerPos, pokemonPos) {
        const currTopPos = this.state.gymBattleTopPos;
        const currLeftPos = this.state.gymBattleLeftPos;

        let isLeft = false;
        let isTop = false;
        if (playerPos.left < pokemonPos.left) {
            isLeft = true;
        }
        if (playerPos.top < pokemonPos.top) {
            isTop = true;
        }

        const stepsTaken = 12 + this.state.gymNum;
        if (isLeft && Math.abs(playerPos.top-pokemonPos.top) <= Math.abs(pokemonPos.left-playerPos.left)) { // Left
            if (currLeftPos >= 0+stepsTaken) {
                this.setState({
                    gymBattleLeftPos: currLeftPos-stepsTaken
                });
            }
        }
        else if (isTop && Math.abs(pokemonPos.left-playerPos.left) <= Math.abs(playerPos.top-pokemonPos.top)) {  // Up
            if (currTopPos >= -100+stepsTaken) {
                this.setState({
                    gymBattleTopPos: currTopPos-stepsTaken
                });
            }
        }
        else if (!isLeft && Math.abs(playerPos.top-pokemonPos.top) <= Math.abs(pokemonPos.left-playerPos.left)) {  // Right
            if (currLeftPos <= 1025-stepsTaken) {
                this.setState({
                    gymBattleLeftPos: currLeftPos+stepsTaken
                });
            }
        }
        else if (!isTop && Math.abs(pokemonPos.left-playerPos.left) <= Math.abs(playerPos.top-pokemonPos.top)) {  // Down
            if (currTopPos <= 315-stepsTaken) {
                this.setState({
                    gymBattleTopPos: currTopPos+stepsTaken
                });
            }
        }
        else {
            console.error("Gym Pokemon isn't moving");
        }
    }

    updateGymPokePosRunner(playerPos, pokemonPos) {
        const currTopPos = this.state.gymBattleTopPos;
        const currLeftPos = this.state.gymBattleLeftPos;

        let isLeft = false;
        let isTop = false;
        if (playerPos.left < pokemonPos.left) {
            isLeft = true;
        }
        if (playerPos.top < pokemonPos.top) {
            isTop = true;
        }

        const stepsTaken = 12 + this.state.gymNum;
        if (isLeft && Math.abs(playerPos.top-pokemonPos.top) <= Math.abs(pokemonPos.left-playerPos.left) && currLeftPos <= 1025-stepsTaken) {  // Left
            this.setState({
                gymBattleLeftPos: currLeftPos+stepsTaken
            });
        }
        else if (isTop && Math.abs(pokemonPos.left-playerPos.left) <= Math.abs(playerPos.top-pokemonPos.top) && currTopPos <= 315-stepsTaken) {  // Up
            this.setState({
                gymBattleTopPos: currTopPos+stepsTaken
            });
        }
        else if (!isLeft && Math.abs(playerPos.top-pokemonPos.top) <= Math.abs(pokemonPos.left-playerPos.left) && currLeftPos >= 0+stepsTaken) {  // Right
            this.setState({
                gymBattleLeftPos: currLeftPos-stepsTaken
            });
        }
        else if (!isTop && Math.abs(pokemonPos.left-playerPos.left) <= Math.abs(playerPos.top-pokemonPos.top) && currTopPos >= -100+stepsTaken) {  // Down
            this.setState({
                gymBattleTopPos: currTopPos-stepsTaken
            });
        }
        else {
            this.setState({
                gymBattleTopPos: Math.floor(Math.random() * 415) - 100,
                gymBattleLeftPos: Math.floor(Math.random() * 1025)
            });
        }
    }

    setStarter(starter) {
        // Set up caughtPokemon map
        let caughtMap = new Map(this.state.caughtPokemon);
        caughtMap.set(starter.id, caughtMap.get(starter.id)+1);

        const gymNum = this.state.gymNum;
        this.setState({
            primary: starter,
            caughtPokemon: caughtMap,
            numCaughtPokemon: 1,
            partyPokemon: [starter],
            gymPokemon: this.filterPokemonForGym(gymNum)
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
                playerExpToAdd = 3;
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
                gymPokeIsChaser: false,
                gymTimer: Date.now()
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

    filterPokemonForGym(gymNum) {
        if (gymNum > 8) {
            return [];
        }

        let filteredPokemon = [];
        for (const pokemon of this.props.pokemon) {
            if (pokemon.base_experience < gymExpMap.get(gymNum)) {  //  && pokemon.base_experience > (gymExpMap.get(gymNum)-80)
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
            partyPokemon,
            partyPokeIndex,
            gymPokemon,
            gymPokeIndex,
            gymPokeIsChaser,
            gymStatus,
            gymTimer
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
                                        {
                                            gymStatus !== null ?
                                            <div>
                                                <p>{gymStatus}</p>
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
                                <div style={{"width": "fit-content", "margin": "auto", "color": "red"}}>
                                    {
                                        gymPokemon.length > 0 ?
                                        <div>
                                            {
                                                gymPokeIsChaser ?
                                                <h2 style={{"color": "red"}}>Gym {gymNum}: Runner - Steps Left: {51-gymTimer}</h2> :
                                                <h2 style={{"color": "green"}}>Gym {gymNum}: Chaser - Time Left: {10 - (Math.floor((Date.now()-gymTimer) / 1000))}</h2>
                                            }
                                        </div> :
                                        <h2>You beat all of the gyms!</h2>
                                    }
                                </div>

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

                                            {
                                                partyPokemon.length > 0 ?
                                                <div id="gymPlayer" style={{"width": "60px", "position": "relative", "top": playerBattleTopPos, "left": playerBattleLeftPos}}>
                                                    <img src={partyPokemon[partyPokeIndex].sprites.front_default} alt='pokemon' />
                                                </div> :
                                                null
                                            }
                                            
                                            {
                                                gymPokemon.length > 0 ?
                                                <div id="gymPokemon" style={{"width": "60px", "position": "relative", "top": gymBattleTopPos, "left": gymBattleLeftPos}}>
                                                    <img src={gymPokemon[gymPokeIndex].sprites.front_default} alt='pokemon' />
                                                </div> :
                                                null
                                            }
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