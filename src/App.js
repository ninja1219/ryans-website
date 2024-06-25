import './App.css';
import React from "react";
import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages";
import About from "./pages/about";
import Games from "./pages/games";
import TicTacToe from "./pages/games/tictactoe";
import Pokedex from "./pages/games/pokemon/pokedex";
import Projects from "./pages/projects";
import TodoList from "./pages/projects/todolist";
import MineSweeper from "./pages/games/minesweeper"
 
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/todolist" element={<TodoList />} />
        <Route path="/games" element={<Games />} />
        <Route path="/games/tictactoe" element={<TicTacToe />} />
        <Route path="/games/pokedex" element={<Pokedex />} />
        <Route path="/games/minesweeper" element={<MineSweeper />} />
      </Routes>
    </Router>
  );
}

export default App;
