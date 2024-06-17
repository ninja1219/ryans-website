import React from 'react';

function Square(props) {
    return (
        <button className="square" onClick={props.onClick}>
            {props.value}
        </button>
      )
}

class Board extends React.Component {
    renderSquare(i) {
        return (
            <Square 
                value={this.props.squares[i]}
                onClick={() => this.props.onClick(i)}
            />
        );
    }
  
    render() {
        const boardSize = 10;

        const createBoard = () => {
            let board = [];
            for (let row = 0; row < boardSize; row++) {
                let squares = [];
                for (let col = 0; col < boardSize; col++) {
                    squares.push(this.renderSquare(row * boardSize + col));
                }
                board.push(
                    <div key={row} className="board-row">
                        {squares}
                    </div>
                );
            }
            return board;
        };

        return (
            <div>
                { createBoard() }
            </div>
        );
    }
}

class MineSweeper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            squares: Array(100).fill(null),
            hiddenGrid: Array(100).fill("0")
        }
    }

    componentDidMount() {
        this.setGrid();
    }
    
    handleClick(i) {
        const squares = this.state.squares.slice();
        squares[i] = this.state.hiddenGrid[i];
        this.setState({
            squares: squares
        });
    }

    setGrid() {
        let grid = Array(100).fill('0');

        for (let i = 0; i < 15; i++) {
            let randNum = Math.floor(Math.random()*100);
            while (grid[randNum] !== '0') {
                randNum = Math.floor(Math.random()*100);
            }

            grid[randNum] = 'X';
        }

        for (let i = 0; i < 100; i++) {
            if (grid[i] === 'X') {
                continue;
            }

            const numBombs = findNumBombs(grid, i);
            grid[i] = numBombs.toString();
        }

        this.setState({
            hiddenGrid: grid
        });
    }
    
    render() {
        const squares = this.state.squares;
    
        return (
            <div className="game">
                <div className="game-board">
                <Board 
                    squares={squares}
                    onClick={i => this.handleClick(i)}
                />
                </div>
            </div>
        );
    }
}

function findNumBombs(grid, i) {
    let numBombs = 0;
    const rows = 10;
    const cols = 10;
    const row = Math.floor(i / cols);
    const col = i % cols;

    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    for (let [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
            const newIndex = newRow * cols + newCol;
            if (grid[newIndex] === 'X') {
                numBombs++;
            }
        }
    }
    
    return numBombs;
}

export default MineSweeper;
