import React from 'react';

class TodoList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [
                "Have functionality to create tabs like General (can't be removed), Work, Personal Goals, etc. to have different todo lists",
                "Have functionality to Add, Checkoff, Remove, Move (even between tabs), etc. each list item",
                "Have a way to create sub tasks that are linked with another todo item, but maybe not visible until a todo item is clicked. A number on the main todo item can show how many sub tasks there are",
                "Have a way to select which todo items will be worked on that day (which these can be viewed by clicking a button or on a side panel or something)",
                "Include a reward system for completing all tasks for a certain day, or for meeting a certain goal",
                "Each task can be given a category like goal, todo item, chore, fun task, etc."
            ]
        }
    }

    addItem() {
        const items = this.state.items;
        this.setState({
            items: items.concat(document.getElementById("itemToAdd").value)
        });
    }

    removeItem(index) {
        let items = this.state.items;
        items.splice(index, 1);
        this.setState({
            items: items
        });
    }

    render() {
        const items = this.state.items.map((item, index) => {
            return (
                <div>
                    <li>
                        <button onClick={() => this.removeItem(index)}>-</button>
                        {item}
                    </li>
                </div>
            );
        });

        return (
            <div id="todolist">
                <h1>Todo List</h1>
                <div className="modifier">
                    <textarea id="itemToAdd" style={{"width": "1000px"}}></textarea>
                    <button onClick={() => this.addItem()}>+</button>
                </div>
                <ul>{items}</ul>
            </div>
        );
    }
}

export default TodoList;
