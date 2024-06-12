import React from "react";
import { useNavigate } from "react-router-dom";

function Games() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Games</h1>
            <div>
                <button onClick={() => { navigate("./tictactoe") }}>TicTacToe</button>
                <button onClick={() => { navigate("./pokedex") }}>Pokedex Trivia</button>
            </div>
        </div>
    );
}
 
export default Games;
