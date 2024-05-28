import './App.css';
import React from "react";
import Navbar from "./components/Navbar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./pages";
import TicTacToe from "./pages/tictactoe";
 
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route exact path="/" element={<Home />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
      </Routes>
    </Router>
  );
}

export default App;
