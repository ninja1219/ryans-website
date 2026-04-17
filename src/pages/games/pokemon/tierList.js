import React from 'react';
import Pokemon from "./pokemon";

const DEFAULT_TIERS = [
  { id: "s", name: "S Tier", color: "#ff6b6b" },
  { id: "a", name: "A Tier", color: "#f7b267" },
  { id: "b", name: "B Tier", color: "#ffd166" },
  { id: "c", name: "C Tier", color: "#7bd389" },
];

const TYPE_COLORS = {
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

class TierList extends React.Component {
    constructor(props) {
        super(props);

        let pokeMap = new Map();
        const tierAssignments = {};
        for (const pokemon of this.props.pokemon) {
            pokeMap.set(pokemon.id, pokemon);
            tierAssignments[pokemon.id] = null;
        }

        this.state = {
            pokemonMap: pokeMap,
            tiers: DEFAULT_TIERS,
            newTierName: "",
            tierAssignments,
            searchText: "",
            selectedType: "all",
            selectedGeneration: "all",
            selectedEvolutionStage: "all"
        };
    }

    handleAddTier = () => {
        const trimmedName = this.state.newTierName.trim();
        if (!trimmedName) return;

        this.setState((prevState) => ({
            tiers: [
                ...prevState.tiers,
                {
                    id: `tier-${Date.now()}`,
                    name: trimmedName,
                    color: "#d9e2f2",
                },
            ],
            newTierName: "",
        }));
    };

    handleAssignPokemonToTier = (pokemonId, tierId) => {
        this.setState((prevState) => ({
            tierAssignments: {
                ...prevState.tierAssignments,
                [pokemonId]: tierId,
            },
        }));
    };

    handleRemoveFromTier = (pokemonId) => {
        this.setState((prevState) => ({
            tierAssignments: {
                ...prevState.tierAssignments,
                [pokemonId]: null,
            },
        }));
    };

    getPokemonTypes = (pokemon) => {
        return (pokemon.types || []).map((typeObj) => {
            if (typeof typeObj === "string") return typeObj;
            return typeObj.type?.name || "";
        }).filter(Boolean);
    };

    getMainType = (pokemon) => {
        const types = this.getPokemonTypes(pokemon);
        return types[0] || "normal";
    };

    getCardBackgroundColor = (pokemon) => {
        const mainType = this.getMainType(pokemon);
        return TYPE_COLORS[mainType] || "#e9ecef";
    };

    getEvolutionStage = (pokemon) => {
        return pokemon.evolutionStage ? String(pokemon.evolutionStage) : "unknown";
    };

    getStatValue = (pokemon, statName) => {
        const stat = (pokemon.stats || []).find(
            (entry) => entry.stat?.name === statName
        );
        return stat ? stat.base_stat : "-";
    };

    getPokemonSprite = (pokemon) => {
        return (
            pokemon.sprites?.front_default ||
            pokemon.sprite ||
            ""
        );
    };

    getPokemonName = (pokemon) => {
        return pokemon.name
            ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
            : "Unknown";
    };

    getGeneration = (pokemon) => {
        if (pokemon.generation) return String(pokemon.generation);

        const id = pokemon.id;
        if (id <= 151) return "1";
        if (id <= 251) return "2";
        if (id <= 386) return "3";
        if (id <= 493) return "4";
        if (id <= 649) return "5";
        if (id <= 721) return "6";
        if (id <= 809) return "7";
        if (id <= 905) return "8";
        return "9";
    };

    passesFilters = (pokemon) => {
        const {
            searchText,
            selectedType,
            selectedGeneration,
            selectedEvolutionStage,
        } = this.state;

        const lowerSearch = searchText.toLowerCase();
        const mainType = this.getMainType(pokemon);
        const generation = this.getGeneration(pokemon);
        const evolutionStage = this.getEvolutionStage(pokemon);

        const matchesSearch =
            !searchText || pokemon.name.toLowerCase().includes(lowerSearch);
        const matchesType =
            selectedType === "all" || mainType === selectedType;
        const matchesGeneration =
            selectedGeneration === "all" || generation === selectedGeneration;
        const matchesEvolutionStage =
            selectedEvolutionStage === "all" ||
            evolutionStage === selectedEvolutionStage;

        return (
            matchesSearch &&
            matchesType &&
            matchesGeneration &&
            matchesEvolutionStage
        );
    };

    getUnassignedPokemon = () => {
        const { pokemonMap, tierAssignments } = this.state;

        return Array.from(pokemonMap.values()).filter((pokemon) => {
            const isUnassigned = !tierAssignments[pokemon.id];
            return isUnassigned && this.passesFilters(pokemon);
        });
    };

    getTierPokemon = (tierId) => {
        const { pokemonMap, tierAssignments } = this.state;

        return Array.from(pokemonMap.values()).filter((pokemon) => {
            return (
                tierAssignments[pokemon.id] === tierId && this.passesFilters(pokemon)
            );
        });
    };

    renderPokemonCard = (pokemon, showTierPicker = true) => {
            const types = this.getPokemonTypes(pokemon);
            const sprite = this.getPokemonSprite(pokemon);
            const backgroundColor = this.getCardBackgroundColor(pokemon);

            return (
            <div
                key={pokemon.id}
                style={{
                    width: "140px",
                    minHeight: "170px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "10px",
                    padding: "10px",
                    backgroundColor,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
                }}
            >
                <div style={{ display: "flex", justifyContent: "center" }}>
                    {sprite ? (
                        <img
                            src={sprite}
                            alt={pokemon.name}
                            style={{ width: "72px", height: "72px", objectFit: "contain" }}
                        />
                    ) : (
                        <div
                            style={{
                                width: "72px",
                                height: "72px",
                                backgroundColor: "#f3f3f3",
                                borderRadius: "8px",
                            }}
                        />
                    )}
                </div>

                <div style={{ fontWeight: "bold", textAlign: "center", fontSize: "14px" }}>
                    {this.getPokemonName(pokemon)}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center" }}>
                    {types.map((type) => (
                        <span
                            key={type}
                            style={{
                                fontSize: "11px",
                                padding: "2px 8px",
                                borderRadius: "999px",
                                backgroundColor: "#eef3ff",
                            }}
                        >
                            {type}
                        </span>
                    ))}
                </div>

                <div style={{ fontSize: "11px", lineHeight: "1.4" }}>
                    <div>HP: {this.getStatValue(pokemon, "hp")}</div>
                    <div>Atk: {this.getStatValue(pokemon, "attack")}</div>
                    <div>Spd: {this.getStatValue(pokemon, "speed")}</div>
                    <div>Stage: {this.getEvolutionStage(pokemon)}</div>
                </div>

                {showTierPicker ? (
                    <select
                        defaultValue=""
                        onChange={(event) =>
                            this.handleAssignPokemonToTier(pokemon.id, event.target.value)
                        }
                        style={{ marginTop: "auto" }}
                    >
                        <option value="" disabled>
                            Move to tier
                        </option>
                        {this.state.tiers.map((tier) => (
                            <option key={tier.id} value={tier.id}>
                                {tier.name}
                            </option>
                        ))}
                    </select>
                ) : (
                    <button
                        onClick={() => this.handleRemoveFromTier(pokemon.id)}
                        style={{ marginTop: "auto" }}
                    >
                        Remove
                    </button>
                )}
            </div>
        );
    };

    renderTierRow = (tier) => {
        const pokemonInTier = this.getTierPokemon(tier.id);

        return (
            <div
                key={tier.id}
                style={{
                    display: "flex",
                    alignItems: "stretch",
                    marginBottom: "20px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "12px",
                    overflow: "hidden",
                    backgroundColor: "#fafafa",
                }}
            >
                <div
                    style={{
                        width: "120px",
                        backgroundColor: tier.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "22px",
                        padding: "12px",
                }}
                >
                    {tier.name}
                </div>

                <div
                    style={{
                        flex: 1,
                        minHeight: "120px",
                        padding: "16px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                    >
                    {pokemonInTier.length > 0 ? (
                        pokemonInTier.map((pokemon) => this.renderPokemonCard(pokemon, false))
                    ) : (
                        <div style={{ color: "#777" }}>No Pokemon in this tier yet.</div>
                    )}
                </div>
        </div>
        );
    };

    render() {
        const unassignedPokemon = this.getUnassignedPokemon();

        return (
            <div style={{ padding: "24px" }}>
                <h1>Pokemon Tier List</h1>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "24px",
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Add a new tier"
                        value={this.state.newTierName}
                        onChange={(event) => this.setState({ newTierName: event.target.value })}
                    />
                    <button onClick={this.handleAddTier}>Add Tier</button>
                </div>

                <div style={{ marginBottom: "32px" }}>
                    {this.state.tiers.map((tier) => this.renderTierRow(tier))}
                </div>

                <h2>Filters</h2>
                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        marginBottom: "24px",
                        alignItems: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <input
                        type="text"
                        placeholder="Search Pokemon"
                        value={this.state.searchText}
                        onChange={(event) => this.setState({ searchText: event.target.value })}
                    />
                    
                    <select
                        value={this.state.selectedType}
                        onChange={(event) =>
                            this.setState({ selectedType: event.target.value })
                        }
                    >
                        <option value="all">All Types</option>
                        {Object.keys(TYPE_COLORS).map((type) => (
                            <option key={type} value={type}>
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={this.state.selectedGeneration}
                        onChange={(event) =>
                            this.setState({ selectedGeneration: event.target.value })
                        }
                    >
                        <option value="all">All Generations</option>
                        <option value="1">Gen 1</option>
                        <option value="2">Gen 2</option>
                        <option value="3">Gen 3</option>
                        <option value="4">Gen 4</option>
                        <option value="5">Gen 5</option>
                        <option value="6">Gen 6</option>
                        <option value="7">Gen 7</option>
                        <option value="8">Gen 8</option>
                        <option value="9">Gen 9</option>
                    </select>

                    <select
                        value={this.state.selectedEvolutionStage}
                        onChange={(event) =>
                            this.setState({ selectedEvolutionStage: event.target.value })
                        }
                        
                    >
                        <option value="all">All Evolution Stages</option>
                        <option value="1">Stage 1</option>
                        <option value="2">Stage 2</option>
                        <option value="3">Stage 3</option>
                        <option value="unknown">Unknown</option>
                    </select>
                </div>

                <h2>Available Pokemon ({unassignedPokemon.length})</h2>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "12px",
                    }}
                >
                    {unassignedPokemon.map((pokemon) => this.renderPokemonCard(pokemon, true))}
                </div>
            </div>
        );
    }
}

export default TierList;
