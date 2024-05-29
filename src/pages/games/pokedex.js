import React from 'react';

class Generation extends React.Component {
    render() {
        return (
            <h1>Generation {this.props.genNum}</h1>
        );
    }
}

class Pokedex extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            genNum: -1,
            showGen: false
        }
    }

    loadGen(genNum) {
        this.setState({
            genNum: genNum,
            showGen: true
        })
    }

    render() {
        const genNums = [1, 2, 3, 4, 5, 6, 7, 8];
        const generations = genNums.map((genNum)=>{
            return (
                <div key={"gen" + genNum} style={{display: "inline-block", margin: "5px"}}>
                    <button 
                        onClick={() => this.loadGen(genNum)}
                    >
                            Generation {genNum}
                    </button>
                </div>
            );
        });

        return (
            <div id='pokedex' style={{margin: "20px"}}>
                <div id="generations-list">
                    {generations}
                </div>
                <div id="curr-generation">
                    { this.state.showGen ? <Generation genNum={this.state.genNum} /> : null }
                </div>
            </div>
        );
    }
}

export default Pokedex;