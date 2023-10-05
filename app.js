const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const allTags = ["work","coding","miscellaneous","business"];
const createdTags = [];
const TODOS = {
  0: { title: 'build an API', order: 1, completed: false, tags: ['work', 'coding']},
  1: { title: '?????', order: 2, completed: false, tags: ['miscellaneous']  },
  2: { title: 'profit!', order: 3, completed: false,tags: ['work', 'business'] },
};

app.get('/todos', (req, res) => {
    const tag = req.query.tag;
    if (tag) {
      const filteredTodos = Object.values(TODOS).filter((todo) => todo.tags.includes(tag));
      res.json(filteredTodos);
    } else {
      // Return all todos if no tag is provided
      res.json(Object.values(TODOS));
    }
  });
  

app.delete('/todos', (req, res) => {
  Object.keys(TODOS).forEach((key) => delete TODOS[key]);
  res.sendStatus(204);
});

app.delete('/todos/:id', (req, res) => {
    const { id } = req.params;
  
    if (!id) {
      return res.status(400).json({ error: '"id" is required in the URL' });
    }
  
    const todoId = parseInt(id); // Convert id to an integer
  
    if (isNaN(todoId) || !TODOS.hasOwnProperty(todoId)) {
      return res.status(404).json({ error: 'Todo not found' });
    }
  
    // Delete the todo
    delete TODOS[todoId];
    return res.sendStatus(204); // Respond with a 204 No Content status on successful deletion
  });
  
  

app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || !TODOS.hasOwnProperty(id)) {
    res.status(404).json({ error: 'Todo not found' });
  } else {
    res.json({ id, ...TODOS[id] });
  }
});

app.post('/todos', (req, res) => {
    const data = req.body;
  
    if (!data.title) {
      return res.status(400).json({ error: '"title" is a required field' });
    }
  
    const newId = Object.keys(TODOS).length;
    const newTodo = {
      title: data.title,
      order: data.order || 0,
      completed: data.completed || false,
      tags: data.tags || [], // Accept an array of tags in the request body
      url: `${req.protocol}://${req.get('host')}/todos/${newId}`,
    };
  
    TODOS[newId] = newTodo;
    res.status(303).set('Location', newTodo.url).json(newTodo);
  });
  

app.patch('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id) || !TODOS.hasOwnProperty(id)) {
    res.status(404).json({ error: 'Todo not found' });
  } else {
    const data = req.body;
    Object.assign(TODOS[id], data);
    res.json(TODOS[id]);
  }
});



app.get('/tags', (req, res) => {
    const allTags = Object.values(TODOS).reduce((tags, todo) => {
      return tags.concat(todo.tags.filter((tag) => !tags.includes(tag)));
    }, []);
  
    res.json([...new Set(allTags)]); // Use Set to remove duplicate tags
  });

  app.get('/todos/:tag', (req, res) => {
    const tag = req.params.tag;
    const filteredTodos = Object.values(TODOS).filter((todo) => todo.tags.includes(tag));
    res.json(filteredTodos);
  });

// POST endpoint to add a new tag or delete all tags


app.post('/tags', (req, res) => {
    const body = req.body;
    console.log(body);
    if (!body.title) {
        // If 'tag' is not present in the request body, clear the 'createdTags' array
        createdTags.length = 0;
        return res.sendStatus(204); // Respond with a 204 No Content status on successful deletion
    }

    // Add the new tag to the 'createdTags' array
    createdTags.push(body.title);

    // Respond with just the 'tag' property
    res.status(201).json(body); // Return the new tag as a JSON object
});


  // DELETE endpoint to clear all tags
app.delete('/tags', (req, res) => {
    // Clear the 'createdTags' array
    createdTags.length = 0;
    res.sendStatus(204); // Respond with a 204 No Content status on successful deletion
});

// can get a list of todos for each tag by using the /tags/:tag endpoint
app.get('/tags/:tag', (req, res) => {
    const tag = req.params.tag;
    const filteredTodos = Object.values(TODOS).filter((todo) => todo.tags.includes(tag));
    res.json(filteredTodos);
    });

  
   // tags endpoint to delete a tag
   app.delete('/tags/:tag', (req, res) => {
    const { tag } = req.params;
  
    if (!tag) {
      return res.status(400).json({ error: '"tag" is required in the URL' });
    }
  
    // Loop through todos and remove the tag from todos that have it
    Object.values(TODOS).forEach((todo) => {
      const tagIndex = todo.tags.indexOf(tag);
      if (tagIndex !== -1) {
        todo.tags.splice(tagIndex, 1);
      }
    });
  
    // Find and remove the specified tag from the list of available tags (allTags)
    const index = allTags.indexOf(tag);
    if (index !== -1) {
      allTags.splice(index, 1);
      return res.sendStatus(204); // Respond with a 204 No Content status on successful deletion
    } else {
      return res.status(404).json({ error: 'Tag not found' });
    }
  });

  
    app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    });
