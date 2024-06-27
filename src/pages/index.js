import React from "react";
 
const Home = () => {
    return (
        <div>
            <h1>Home Page</h1>
            <p>
                This website is for introducing Ryan Meyer, showcasing his experience and 
                skills, and building fun games and software engineering projects.
            </p>
            
            <div style={{"display": "flex", "flexDirection": "column"}}>
                <a href="https://www.linkedin.com/in/ryan-meyer-74a165244/">LinkedIn Profile</a>
                <a href="https://github.com/ninja1219">GitHub Profile</a>
            </div>
        </div>
    );
};
 
export default Home;
