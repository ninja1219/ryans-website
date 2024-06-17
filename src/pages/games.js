import React from "react";
import { useNavigate } from "react-router-dom";

function Games() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Games</h1>
            <div style={{"display": "flex", "flexDirection": "column", "width": "fit-content"}}>
                <button style={{"margin": "4px"}} onClick={() => { navigate("./tictactoe") }}>TicTacToe</button>
                <button style={{"margin": "4px"}} onClick={() => { navigate("./pokedex") }}>Pokedex Trivia</button>
                <button style={{"margin": "4px"}} onClick={() => { navigate("./minesweeper") }}>MineSweeper</button>
            </div>

            <h2>Game Ideas: </h2>
            <ul>
                <li>Geography game using jsmap like for global families website</li>
                <li>Mini pokemon game apart of the Pokedex</li>
                <li>Minesweeper</li>
                <li>Typing Game</li>
            </ul>
        </div>
    );
}
 
export default Games;
