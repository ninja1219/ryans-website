import React from 'react';
import PokemonBackgroundImage from "./images/pokemon-background.jpg";
import Pokemon from "./pokemon";

// Position Possibilities:
// player: h: 0 to 1025, v: 0 to 400
// pokemon h: 0 to 1025, v: -100 to 315

class PokemonGame extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.state = {
            playerExp: 60,
            starter: null,
            sceneNumber: 0,
            gymNum: 0,
            playerTopPos: 200,
            playerLeftPos: 512,
            randPokeIndex: -1,
            randTopPos: 0,
            randLeftPos: 0,
            caughtPokemon: []  // TODO: Store in a map instead of id to # caught
        }
    }

    handleKeyDown(e) {
        const currTopPos = this.state.playerTopPos;
        const currLeftPos = this.state.playerLeftPos;

        // Update player position
        if (e.keyCode === 37) { // Left
            if (currLeftPos >= 20) {
                this.setState({
                    playerLeftPos: currLeftPos-20
                });
            }
        }
        else if (e.keyCode === 38) {  // Up
            if (currTopPos >= 20) {
                this.setState({
                    playerTopPos: currTopPos-20
                });
            }
        }
        else if (e.keyCode === 39) {  // Right
            if (currLeftPos <= 1005) {
                this.setState({
                    playerLeftPos: currLeftPos+20
                });
            }
        }
        else if (e.keyCode === 40) {  // Down
            if (currTopPos <= 380) {
                this.setState({
                    playerTopPos: currTopPos+20
                });
            }
        }

        // Check if player caught pokemon
        const pokemon = this.filterPokemon();
        if (this.state.randPokeIndex !== -1) {
            const playerPos = document.getElementById("wildPokemon").getBoundingClientRect();
            const pokemonPos = document.getElementById("player").getBoundingClientRect();
            if (playerPos.right > pokemonPos.left && playerPos.left < pokemonPos.right && playerPos.top < pokemonPos.bottom && playerPos.bottom > pokemonPos.top) {
                const currCaughtPokemon = this.state.caughtPokemon;
                const currPokemon = pokemon[this.state.randPokeIndex];
                const currPlayerExp = this.state.playerExp;
                this.setState({
                    playerExp: currPlayerExp + (currCaughtPokemon.length % 2 === 0 ? 1 : 0),
                    randPokeIndex: -1,
                    caughtPokemon: currCaughtPokemon.concat(currPokemon)
                });
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

    setStarter(starter) {
        this.setState({
            starter: starter,
            caughtPokemon: [starter]
        });
        this.incrementScene(1);
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
            caughtPokemon
        } = this.state;

        const index = this.props.genNum === 5 ? 1 : 0;
        const grassStarterData = this.props.pokemon[index];
        const fireStarterData = this.props.pokemon[index+3];
        const waterStarterData = this.props.pokemon[index+6];

        const pokedex = caughtPokemon.map((currPokemon, i) => {
            return (
                <div key={i} style={{"width": "200px", "height": "200px", "transform": "scale(0.4)", "transform-origin": "top left", "margin": "5px"}}>
                    <Pokemon pokeData={currPokemon} trivia={false} />
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
                                        {
                                            caughtPokemon.length > 0 ? 
                                            <div>
                                                <img src={caughtPokemon[caughtPokemon.length-1].sprites.front_default} alt='pokemon' />
                                                <p>You caught {caughtPokemon[caughtPokemon.length-1].name}!</p>
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

                                <div style={{"display": "flex", "width": "fit-content", "margin": "auto", "margin-top": "5px"}}>
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
                                    <div style={{"display": "flex", "flex-wrap": "wrap"}}>
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