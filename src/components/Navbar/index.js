import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";
 
const Navbar = () => {
    return (
        <>
            <Nav>
                <NavMenu>
                    <NavLink to="/" activeStyle>
                        Home
                    </NavLink>
                    <NavLink to="/about" activeStyle>
                        About
                    </NavLink>
                    <NavLink to="/games" activeStyle>
                        Games
                    </NavLink>
                    <NavLink to="/tictactoe" activeStyle>
                        TicTacToe
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};
 
export default Navbar;