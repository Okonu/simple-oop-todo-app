'use strict';
class Model {
	constructor() {
		this.tasks = JSON.parse(localStorage.getItem('tasks')) || [
			{ id: 1, text: 'Buy groceries', complete: false },
			{ id: 2, text: 'Code four hours today', complete: false },
		];
	}

	// Adding a new task to array
	addTask(text) {
		const tasks = {
			id: this.tasks.length > 0 ? this.tasks[this.tasks.length - 1].id + 1 : 1,
			text: text,
			complete: false,
		};
		this.tasks.push(tasks);
		this._commit(this.tasks);
	}

	// Replacing text at specified ID
	editTask(id, newText) {
		this.tasks = this.tasks.map((task) =>
			task.id === id
				? {
						id: task.id,
						text: newText,
						complete: task.complete,
				  }
				: task
		);
		// Committ changes to localStorage
		this._commit(this.tasks);
	}

	deleteTask(id) {
		this.tasks = this.tasks.filter((task) => task.id !== id);
		this._commit(this.tasks);
	}

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

		this._commit(this.tasks);
	}

	bindingTaskListChanged(callbackfn) {
		this.onTaskListChanged = callbackfn;
	}

	_commit(tasks) {
		this.onTaskListChanged(tasks);
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}
}

class View {
	constructor() {

		this.app = this.getElement('#main');

		// h1
		this.title = this.createElement('h1');
	
		this.form = this.createElement('form');
		this.input = this.createElement('input');
		this.input['type'] = 'text';
		this.input['placeholder'] = 'Add a task';
		this.input['name'] = 'task';

		this.submitButton = this.createElement('button');
		this.submitButton.textContent = 'Submit';


		this.taskList = this.createElement('ul', 'task-list');

		this.form.append(this.input, this.submitButton);
		this.app.append(this.title, this.form, this.taskList);
		this._temporaryText = '';
		this._initiateLocalListener();
	}

	displayTasks(tasks) {
		while (this.taskList.firstChild) {
			this.taskList.removeChild(this.taskList.firstChild);
		}

		if (tasks.length < 1) {
			const p = this.createElement('p');
			p.textContent = 'No tasks yet! Add one?';
			this.taskList.append(p);
		} else {
			
			tasks.forEach((task) => {
				const li = this.createElement('li');
				li['id'] = task['id'];

				const check = this.createElement('input');
				check['type'] = 'checkbox';
				check['checked'] = task['complete'];

				const span = this.createElement('span');
				span.contentEditable = true;
				span.classList.add('editable');

				if (task['complete']) {
					const strikethrough = this.createElement('s');
					strikethrough['textContent'] = task['text'];
					span.append(strikethrough);
				} else {
					span['textContent'] = task['text'];
				}

				const deleteButton = this.createElement('button', 'delete');
				deleteButton['textContent'] = 'X';

				li.append(check, span, deleteButton);

				// Appending nodes
				this.taskList.append(li);
			});
		}

		console.log(tasks);
	}

	// Private getter, resetter for input value
	get _taskText() {
		return this.input.value;
	}

	_resetInput() {
		this.input.value = '';
	}

	// Creating element in DOM with an CSS class (optional)
	createElement(htmlTag, cssClassName) {
		const element = document.createElement(htmlTag);
		if (cssClassName) {
			element.classList.add(cssClassName);
		}

		return element;
	}

	// Retrieving element from DOM
	getElement(selectorName) {
		const element = document.querySelector(selectorName);

		return element;
	}

	// Updating temporary state of the text / contenteditable span / input Method
	_initiateLocalListener() {
		this.taskList.addEventListener('input', (event) => {
			if (event.target.className === 'editable') {
				this._temporaryText = event.target.innerText;
			}
		});
	}

	// Binding Model and View
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
 * Connect user input and view output
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

	// Setting event handlers
	handleAddTask = (taskText) => this.model.addTask(taskText);
	handleEditTask = (id, taskText) => this.model.editTask(id, taskText);
	handleDeleteTask = (id) => this.model.deleteTask(id);
	handleToggleTask = (id) => this.model.toggleTask(id);
}

// Creating app with Model/View/Controller structure
const app = new Controller(new Model(), new View());
