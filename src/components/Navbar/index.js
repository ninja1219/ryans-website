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
                    <NavLink to="/projects" activestyle="true">
                        Projects
                    </NavLink>
                    <NavLink to="/games" activestyle="true">
                        Games
                    </NavLink>
                </NavMenu>
            </Nav>
        </>
    );
};
 
export default Navbar;