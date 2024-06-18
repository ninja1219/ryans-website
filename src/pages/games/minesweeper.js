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
        const createBoard = () => {
            let board = [];
            for (let row = 0; row < this.props.numRows; row++) {
                let squares = [];
                for (let col = 0; col < this.props.numCols; col++) {
                    squares.push(this.renderSquare(row * this.props.numRows + col));
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
            squares: Array(225).fill(null),
            hiddenGrid: Array(225).fill("0"),
            numRows: 15,
            numCols: 15,
            numBombs: 30
        }
    }

    componentDidMount() {
        this.setGrid();
    }
    
    handleClick(i) {
        let squares = this.state.squares.slice();
        squares[i] = this.state.hiddenGrid[i];
        if (squares[i] === '0') {
            squares = this.populateSquares(squares, i);
        }
        this.setState({
            squares: squares
        });
    }

    populateSquares(squares, i) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1], [1, 0], [1, 1]
        ];
        const rows = this.state.numRows;
        const cols = this.state.numCols;

        let queue = new Set([i]);
        while (queue.size > 0) {
            let newQueue = new Set();
            for (const index of queue) {
                const row = Math.floor(index / cols);
                const col = index % cols;
                for (let [dx, dy] of directions) {
                    const newRow = row + dx;
                    const newCol = col + dy;
                    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                        const newIndex = newRow * cols + newCol;
                        if (this.state.hiddenGrid[newIndex] === '0' && squares[newIndex] === null) {
                            newQueue.add(newIndex);
                        }
                        squares[newIndex] = this.state.hiddenGrid[newIndex];
                    }
                }
            }
            queue = newQueue;
        }

        return squares;
    }

    setGrid() {
        const numSquares = this.state.numRows*this.state.numCols;
        let grid = Array(numSquares).fill('0');

        for (let i = 0; i < this.state.numBombs; i++) {
            let randNum = Math.floor(Math.random()*numSquares);
            while (grid[randNum] !== '0') {
                randNum = Math.floor(Math.random()*numSquares);
            }

            grid[randNum] = 'X';
        }

        for (let i = 0; i < numSquares; i++) {
            if (grid[i] === 'X') {
                continue;
            }

            const currNumBombs = findNumBombs(grid, i, this.state.numRows, this.state.numCols);
            grid[i] = currNumBombs.toString();
        }

        this.setState({
            squares: Array(numSquares).fill(null),
            hiddenGrid: grid
        });
    }
    
    render() {
        const squares = this.state.squares;
        const numRows = this.state.numRows;
        const numCols = this.state.numCols;
    
        return (
            <div className="minesweeper" style={{"margin-top": "10px"}}>
                <div className="game-board">
                    <Board 
                        squares={squares}
                        numRows={numRows}
                        numCols={numCols}
                        onClick={i => this.handleClick(i)}
                    />
                </div>

                <button style={{"margin-top": "10px"}} onClick={() => this.setGrid()}>Start New Game</button>
            </div>
        );
    }
}

function findNumBombs(grid, i, rows, cols) {
    let numBombs = 0;
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
