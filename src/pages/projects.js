import React from "react";
import { useNavigate } from "react-router-dom";

function Projects() {
    const navigate = useNavigate();

    return (
        <div>
            <h1>Projects</h1>
            <div>
                <button onClick={() => { navigate("./todolist") }}>Todo List</button>
            </div>

            <h2>Project Ideas: </h2>
            <ul>
                <li>Rubik's Cube Solver (optimized version)</li>
                <li>Some project using chatGPT API or other APIs</li>
                <li>Cryptography project (maybe Enigma)</li>
            </ul>
        </div>
    );
}
 
export default Projects;
