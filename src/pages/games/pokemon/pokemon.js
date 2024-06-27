import React from 'react';
import './pokedex.css';

const pokeColor = {
    normal: '#facd4b',
    fire: '#f0776a',
    water: '#58abf6',
    electric: '#facd4b',
    grass: '#64dbb2',
    ice: '#58abf6',
    fighting: '#ca8179',
    poison: '#9f5bba',
    ground: '#ca8179',
    flying: '#58abf6',
    psychic: '#9f5bba',
    bug: '#64dbb2',
    rock: '#ca8179',
    ghost: '#9f5bba',
    dragon: '#f0776a',
    dark: '#9f5bba',
    steel: '#facd4b',
    fairy: '#64dbb2'
}

class Pokemon extends React.Component {
    render() {
        const types = this.props.pokeData.types.map((type, i) => {
            return (
                <div className='pokeSkill' key={i}>
                    {type.type.name}
                </div>
            );
        });
        const stats = this.props.pokeData.stats.map((stat, i) => {
            return (
                <div key={i}>{stat.stat.name}: {stat.base_stat}</div>
            );
        });
        const backgroundColor = pokeColor[this.props.pokeData.types[0].type.name];
        //console.log(this.props.pokeData);

        return (
            <div id="pokemon">
                <div className='pokeType' style={{ backgroundColor: backgroundColor }}>
                    <img className='pokeImage' src={this.props.pokeData.sprites.front_default} alt='pokemon' />

                    <div className="grouping">
                        { this.props.trivia ? null :
                            <div className='pokeName'>
                                {this.props.pokeData.name}
                            </div>
                        }
                        <div className='pokeId'>
                            <div># <span>{this.props.pokeData.id}</span></div>
                        </div>
                    </div>

                    <div className='pokeTypes'>
                        {types}
                    </div>

                    <div>
                        <div>
                            Base Exp: {this.props.pokeData.base_experience}
                        </div>
                        {stats}
                    </div>
                </div>
            </div>
        )
    }
}

export default Pokemon;