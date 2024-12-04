const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());


const filePath = path.join(__dirname, 'tasks.json');

let tasks = [];

const saveTasksToFile = async () => {
    try {
        await fs.promises.writeFile(filePath, JSON.stringify(tasks, null, 2));
    } catch (err) {
        console.error('Error saving tasks to file:', err);
    }
};
const loadTasksFromFile = async () => {
    try {
        const data = await fs.readFileSync('tasks.json', 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error loading tasks from file:', err);
        return [];
    }
};
tasks = loadTasksFromFile();

// Create the task
app.post('/tasks', (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        return res.status(400).json({ error: 'Title and description are required' });
    }

    const newTask = {
        id: uuidv4(),
        title,
        description,
        status: 'pending'
    };

    tasks.push(newTask);
    saveTasksToFile()
    res.status(201).json({
        message: `Task "${newTask.title}" created successfully.`,
        task: newTask
    });
});


// To retrive the task
app.get('/getTasks/:id', async (req, res) => {
    const taskId = req.params.id;
    const task = tasks.find(t => t.id == taskId);

    if (task) {
        res.status(200).json(task);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});



// To update the task
app.put('/updateTasks/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const task = tasks.find((task) => task.id === id);

    if (!task) {
        return res.status(404).json({ error: 'Task not found' });
    }

    if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    task.status = status;
    saveTasksToFile();

    res.status(200).json({
        message: 'Task updated successfully',
        task
    });
});


// To delete the task
app.delete('/deleteTasks/:id', (req, res) => {
    const { id } = req.params;

    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({ error: 'Task not found' });
    }

    tasks.splice(taskIndex, 1);

    res.status(200).json({ message: 'Task deleted successfully' });
});


// Get the status of the task 
app.get('/tasks/status/:status', (req, res) => {
    const { status } = req.params;

    if (!['pending', 'completed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const filteredTasks = tasks.filter((task) => task.status === status);

    res.status(200).json(filteredTasks);
});


app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
