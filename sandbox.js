/*
JavaScript File
JS MVC Todo App
https://github.com/domison/
*/

'use strict';

/**
 * @class Model
 *
 * Manages data and logic of the app
 */
class Model {
	constructor() {
		// Showing the state of model, task-Objects in an Array, preserved on localStorage OR some data pre-inputted
		this.tasks = JSON.parse(localStorage.getItem('tasks')) || [
			{ id: 1, text: 'Buy groceries', complete: false },
			{ id: 2, text: 'Code four hours today', complete: false },
			{ id: 3, text: 'Play tennis with Marian', complete: false },
		];
	}

	// Adding a new task to array
	addTask(text) {
		const tasks = {
			id: this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id + 1 : 1,
			text: text,
			complete: false,
		};
		// pushing new task onto tasks-Array
		this.tasks.push(tasks);

		// Committing changes to localStorage
		this._commit(this.tasks);
	}

	// Replacing text at specified ID
	editTask(id, newText) {
		// map iterates through all tasks in tasks[]
		this.tasks = this.tasks.map((task) =>
			task.id === id
				? {
						id: task.id,
						text: newText,
						complete: task.complete,
				  }
				: task
		);

		// Committing changes to localStorage
		this._commit(this.tasks);
	}

	// Deleting task by filtering through tasks[], excluding specific ID
	deleteTask(id) {
		// returns everything, but the task that was specified (ergo deletes)
		this.tasks = this.tasks.filter((task) => task.id !== id);

		// Committing changes to localStorage
		this._commit(this.tasks);
	}

	// Changing task to done/not done
	toggleTask(id) {
		this.tasks = this.tasks.map((task) =>
			task.id === id
				? {
						id: task.id,
						text: task.text,
						complete: !task.complete,
				  }
				: task
		);

		// Committing changes to localStorage
		this._commit(this.tasks);
	}

	// Binding the onTaskListChanged of Controller
	bindingTaskListChanged(callbackfn) {
		this.onTaskListChanged = callbackfn;
	}

	// Committing tasks as saved tasks to localStorage
	_commit(tasks) {
		// onTaskListChanged callbackfn
		this.onTaskListChanged(tasks);
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}
}

/**
 * @class View
 *
 * Provides a visual representation of the Model
 */
class View {
	constructor() {
		// DOM tree
		// #main div / root container
		this.app = this.getElement('#main');

		// h1
		this.title = this.createElement('h1');
		this.title.textContent = 'My tasks';

		// Form
		this.form = this.createElement('form');
		this.input = this.createElement('input');
		this.input['type'] = 'text';
		this.input['placeholder'] = 'Add a task';
		this.input['name'] = 'task';

		this.submitButton = this.createElement('button');
		this.submitButton.textContent = 'Submit';

		// List representation of tasks
		this.taskList = this.createElement('ul', 'task-list');

		// Appending and submitting input from form
		this.form.append(this.input, this.submitButton);

		// Appending title, form and list to app
		this.app.append(this.title, this.form, this.taskList);

		// Adding editable quick-fix with temporaryText
		this._temporaryText = '';
		this._initiateLocalListener();
	}

	// Displaying all tasks, and updating when a change was made
	displayTasks(tasks) {
		// First: remove all previous nodes
		while (this.taskList.firstChild) {
			this.taskList.removeChild(this.taskList.firstChild);
		}

		// If there are no current tasks: Create p-element and adjust message based on scenario
		if (tasks.length < 1) {
			const p = this.createElement('p');
			p.textContent = 'No tasks yet! Add one?';
			this.taskList.append(p);
		} else {
			// Second: going through array, assigning them list-elements
			tasks.forEach((task) => {
				const li = this.createElement('li');
				li['id'] = task['id'];

				// Adding checkboxes to tasks that can be toggled
				const check = this.createElement('input');
				check['type'] = 'checkbox';
				check['checked'] = task['complete'];

				// Inserting text of task into an editable span-element
				const span = this.createElement('span');
				span.contentEditable = true;
				span.classList.add('editable');

				// Adding strike-through for done tasks
				if (task['complete']) {
					const strikethrough = this.createElement('s');
					strikethrough['textContent'] = task['text'];
					span.append(strikethrough);
				} else {
					// Else, displaying just text as is
					span['textContent'] = task['text'];
				}

				// Giving a delete button to each task in list-element
				const deleteButton = this.createElement('button', 'delete');
				deleteButton['textContent'] = 'X';

				// Appending everything to the generated list-element
				li.append(check, span, deleteButton);

				// Appending nodes
				this.taskList.append(li);
			});
		}

		// Fishing for bugs:
		console.log(tasks);
	}

	// Private getter and resetter for input value
	get _taskText() {
		return this.input.value;
	}

	_resetInput() {
		this.input.value = '';
	}

	// Creating an element in DOM with an CSS class (optional)
	createElement(htmlTag, cssClassName) {
		const element = document.createElement(htmlTag);
		if (cssClassName) {
			element.classList.add(cssClassName);
		}

		return element;
	}

	// Retrieving an element from DOM
	getElement(selectorName) {
		const element = document.querySelector(selectorName);

		return element;
	}

	// Updating the temporary state of the text / contenteditable span / input Method
	_initiateLocalListener() {
		this.taskList.addEventListener('input', (event) => {
			if (event.target.className === 'editable') {
				this._temporaryText = event.target.innerText;
			}
		});
	}

	// Binding of Model and View
	bindingAddTask(handler) {
		this.form.addEventListener('submit', (event) => {
			event.preventDefault();

			if (this._taskText) {
				handler(this._taskText);
				this._resetInput();
			}
		});
	}

	bindingEditTask(handler) {
		this.taskList.addEventListener('focusout', (event) => {
			if (this._temporaryText) {
				const id = parseInt(event.target.parentElement.id);
				handler(id, this._temporaryText);
				this._temporaryText = '';
			}
		});
	}

	bindingDeleteTask(handler) {
		this.taskList.addEventListener('click', (event) => {
			if (event.target.className === 'delete') {
				const id = parseInt(event.target.parentElement.id);
				handler(id);
			}
		});
	}

	bindingToggleTask(handler) {
		this.taskList.addEventListener('change', (event) => {
			if (event.target.type === 'checkbox') {
				const id = parseInt(event.target.parentElement.id);
				handler(id);
			}
		});
	}
}

/**
 * @class Controller
 *
 * Connects user input and view output
 *
 * @param model
 * @param view
 */
class Controller {
	constructor(model, view) {
		this.model = model;
		this.view = view;

		// Explicitly binding this
		this.model.bindingTaskListChanged(this.onTaskListChanged);
		this.view.bindingAddTask(this.handleAddTask);
		this.view.bindingEditTask(this.handleEditTask);
		this.view.bindingDeleteTask(this.handleDeleteTask);
		this.view.bindingToggleTask(this.handleToggleTask);

		// Displaying initial tasks (if set up)
		this.onTaskListChanged(this.model.tasks);
	}
	// Method to observe changes in Model and updating them in View
	onTaskListChanged = (tasks) => this.view.displayTasks(tasks);

	// Setting up event handlers
	handleAddTask = (taskText) => this.model.addTask(taskText);
	handleEditTask = (id, taskText) => this.model.editTask(id, taskText);
	handleDeleteTask = (id) => this.model.deleteTask(id);
	handleToggleTask = (id) => this.model.toggleTask(id);
}

// Creating app with Model/View/Controller structure
const app = new Controller(new Model(), new View());
