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
import Pokedex from "./pages/games/pokedex";
import TodoList from "./pages/todolist";
 
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/todolist" element={<TodoList />} />
        <Route path="/games" element={<Games />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/pokedex" element={<Pokedex />} />
      </Routes>
    </Router>
  );
}

export default App;
