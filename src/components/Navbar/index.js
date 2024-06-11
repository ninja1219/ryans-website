import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";
 
const Navbar = () => {
    return (
        <>
            <Nav>
                <NavMenu>
                    <NavLink to="/" activestyle="true">
                        Home
                    </NavLink>
                    <NavLink to="/about" activestyle="true">
                        About
                    </NavLink>
                    <NavLink to="/todolist" activestyle="true">
                        Todo List
                    </NavLink>
                    <NavLink to="/games" activestyle="true">
                        Games
                    </NavLink>
                    <NavLink to="/tictactoe" activestyle="true">
                        TicTacToe
                    </NavLink>
                    <NavLink to="/pokedex" activestyle="true">
                        Pokedex
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};
 
export default Navbar;