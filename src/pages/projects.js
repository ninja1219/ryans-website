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
        </div>
    );
}
 
export default Projects;
