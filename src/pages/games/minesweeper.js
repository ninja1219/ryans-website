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
            squares: null,
            hiddenGrid: null,
            numRows: 0,
            numCols: 0,
            numBombs: 0,
            gameEnd: 0  // 0 = keep playing, 1 = win, 2 = lose
        }
    }
    
    handleClick(i) {
        if (this.state.gameEnd !== 0) {
            return;
        }

        let squares = this.state.squares.slice();
        let gameEnd = 0;
        squares[i] = this.state.hiddenGrid[i];
        if (squares[i] === '0') {
            squares = this.populateSquares(squares, i);
        }
        
        if (squares[i] === 'X') {
            gameEnd = 2;
        }
        else if (this.findNumEmpty(squares) === this.state.numBombs) {
            gameEnd = 1;
        }

        this.setState({
            squares: squares,
            gameEnd: gameEnd
        });
    }

    findNumEmpty(squares) {
        let numEmpty = 0;
        for (let i = 0; i < this.state.numRows*this.state.numCols; i++) {
            if (squares[i] === null) {
                numEmpty++;
            }
        }
        return numEmpty;
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

    setGrid(level) {
        let numRows, numCols, numBombs;
        if (level === 0) {
            numRows = 10;
            numCols = 10;
            numBombs = 10;
        }
        else if (level === 1) {
            numRows = 15;
            numCols = 15;
            numBombs = 30;
        } else if (level === 2) {
            numRows = 20;
            numCols = 20;
            numBombs = 70;
        }
        else {
            numRows = 15;
            numCols = 15;
            numBombs = 30;
        }

        const numSquares = numRows*numCols;
        let grid = Array(numSquares).fill('0');

        for (let i = 0; i < numBombs; i++) {
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

            const currNumBombs = findNumBombs(grid, i, numRows, numCols);
            grid[i] = currNumBombs.toString();
        }

        this.setState({
            squares: Array(numSquares).fill(null),
            hiddenGrid: grid,
            numRows: numRows,
            numCols: numCols,
            numBombs: numBombs
        });
    }

    resetGame() {
        this.setState({
            squares: null,
            gameEnd: 0
        });
    }
    
    render() {
        const squares = this.state.squares;
        const numRows = this.state.numRows;
        const numCols = this.state.numCols;
        const gameEnd = this.state.gameEnd;
    
        return (
            <div className="minesweeper" style={{"margin-top": "10px"}}>
                <h1>MineSweeper</h1>
                {
                    gameEnd === 0 ? null : (gameEnd === 1 ? <h3>You Won!</h3> : <h3>You lost</h3>)
                }
                { 
                    squares === null
                    ? <div>
                        <button onClick={() => this.setGrid(0)}>Easy</button>
                        <button onClick={() => this.setGrid(1)}>Medium</button>
                        <button onClick={() => this.setGrid(2)}>Hard</button>
                    </div>
                    : <div className="game-board">
                        <Board 
                            squares={squares}
                            numRows={numRows}
                            numCols={numCols}
                            onClick={i => this.handleClick(i)}
                        />
                    </div>
                }

                {
                    squares === null ?
                    null :
                    <button style={{"margin-top": "10px"}} onClick={() => this.resetGame()}>Start New Game</button>
                }
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
