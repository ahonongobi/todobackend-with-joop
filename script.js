const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const TAGS = [
    {
      id: '0',
      title: 'work',
      url: 'http://localhost:8080/tags/0',
      todos: [
        {
          id: '0',
          title: 'build an API',
          completed: false,
          url: 'string',
          order: 10,
        },
        {
          id: '2',
          title: 'profit!',
          completed: false,
          url: 'string',
          order: 3,
        },
      ],
    },
    {
      id: '1',
      title: 'miscellaneous',
      url: 'http://localhost:8080/tags/1',
      todos: [
        {
          id: '1',
          title: '?????',
          completed: false,
          url: 'string',
          order: 2,
        },
      ],
    },
    {
      id: '2',
      title: 'coding',
      url: 'http://localhost:8080/tags/2',
      todos: [
        {
          id: '0',
          title: 'build an API',
          completed: false,
          url: 'string',
          order: 10,
        },
      ],
    },
    {
      id: '3',
      title: 'business',
      url: 'http://localhost:8080/tags/3',
      todos: [
        {
          id: '2',
          title: 'profit!',
          completed: false,
          url: 'string',
          order: 3,
        },
      ],
    },
  ];
  
  
//////////////////////////////////////////////////////////////////////////////////
const TODOS = {
    0: {
      id: '0',
      title: 'build an API',
      order: 1,
      completed: false,
      tags: [
        { id: '0', title: 'work' },
        { id: '1', title: 'coding' },
      ],
    },
    1: {
      id: '1',
      title: '?????',
      order: 2,
      completed: false,
      tags: [
        { id: '2', title: 'miscellaneous' },
      ],
    },
    2: {
      id: '2',
      title: 'profit!',
      order: 3,
      completed: false,
      tags: [
        { id: '0', title: 'work' },
        { id: '3', title: 'business' },
      ],
    },
  };
  
   
  app.get('/todos', (req, res) => {
    const todosWithTags = Object.keys(TODOS).map((key) => ({
      id: key,
      ...TODOS[key],
    }));
  
    res.json(todosWithTags);
  });
  
  
  app.delete('/todos', (req, res) => {
    Object.keys(TODOS).forEach((key) => delete TODOS[key]);
    res.sendStatus(204);
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
        url: `${req.protocol}://${req.get('host')}/todos/${newId}`,
        tags: [],
      };
      TODOS[newId] = newTodo;
      res.status(303).set('Location', newTodo.url).send();
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
  
  app.delete('/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
  
    if (isNaN(id) || !TODOS.hasOwnProperty(id)) {
      res.status(404).json({ error: 'Todo not found' });
    } else {
      delete TODOS[id];
      res.sendStatus(204);
    }
  });

//////////////////////////////////////////////////////////////////////////////////
app.get('/tags', (req, res) => {
  res.json(TAGS);
});

app.post('/tags', (req, res) => {
  const data = req.body;

  if (!data) {
    res.status(400).json({ error: '"name" is a required field' });
  } else {
    const newId = TAGS.length;
    const newTag = {
      id: newId,
      title: data.title,
      url: 'http://localhost:8080'+`/tags/${newId}`,
      todos: [],
    };
    TAGS.push(newTag);
    res.status(201).json(newTag);
  }
});

app.delete('/tags', (req, res) => {
  TAGS.length = 0;
  res.sendStatus(204);
});

app.get('/tags/:id', (req, res) => {
    const id = parseInt(req.params.id);
  
    if (isNaN(id) || id < 0 || id >= TAGS.length) {
      res.status(404).json({ error: 'Tag not found' });
    } else {
      res.json(TAGS[id]);
    }
});

app.patch('/tags/:id', (req, res) => {
    const id = parseInt(req.params.id);
  
    if (isNaN(id) || id < 0 || id >= TAGS.length) {
      res.status(404).json({ error: 'Tag not found' });
    } else {
      const data = req.body;
  
      if (!data) {
        res.status(400).json({ error: '"name" is a required field' });
      } else {
        TAGS[id].title = data.title;
        res.json(TAGS[id]);
      }
    }
  });

  app.delete('/tags/:id', (req, res) => {
    const id = parseInt(req.params.id);
  
    if (isNaN(id) || id < 0 || id >= TAGS.length) {
      res.status(404).json({ error: 'Tag not found' });
    } else {
      TAGS.splice(id, 1);
      res.sendStatus(204);
    }
  });

  app.get('/todos/:id/tags', (req, res) => {
    const id = parseInt(req.params.id);
  
    if (isNaN(id) || !TODOS.hasOwnProperty(id)) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const todo = TODOS[id];
      const todoTags = todo.tags.map((tagId) => {
        const tag = TAGS.find((t) => t.id === tagId);
        if (tag) {
          return {
            id: tag.id,
            title: tag.title,
            url: tag.url,
          };
        } else {
          // Gérer le cas où le tag n'est pas trouvé
          return {
            id: -1, // ou toute autre valeur d'identifiant d'erreur
            title: 'joined tag',
            url: '',
          };
        }
      });
      res.json(todoTags);
  });

  // DELETE a tag association from a todo
app.delete('/todos/:todoId/tags/:tagId', (req, res) => {
    const todoId = parseInt(req.params.todoId); // Parse the todoId as an integer
    const tagId = parseInt(req.params.tagId); // Parse the tagId as an integer
    
    console.log(todoId, tagId);
    // Check if the todoId and tagId are valid
    if (!TODOS.hasOwnProperty(todoId)) {
      return res.status(404).json({ error: 'Todo not found' });
    }
  
    const todo = TODOS[todoId];
  
    // Find the index of the tag with the specified tagId in the todo's tags array
    const tagIndex = todo.tags.findIndex((tag) => tag.id === tagId);
  
    // Check if the tag with the specified tagId is found in the todo's tags
    if (tagIndex === -1) {
      return res.status(404).json({ error: 'Tag not associated with the todo' });
    }
  
    // Remove the tag association by splicing it from the todo's tags array
    todo.tags.splice(tagIndex, 1);
  
    return res.status(204).send(); // Respond with a 204 No Content status on successful removal
  });
  

  // DELETE all tag associations from a todo
app.delete('/todos/:todoId/tags/', (req, res) => {
    const todoId = parseInt(req.params.todoId); // Parse the todoId as an integer
  
    // Check if the todoId is valid
    if (!TODOS.hasOwnProperty(todoId)) {
      return res.status(404).json({ error: 'Todo not found' });
    }
  
    const todo = TODOS[todoId];
  
    // Clear the tags array of the specified todo
    todo.tags = [];
  
    return res.status(204).send(); // Respond with a 204 No Content status on successful removal
  });
  
  
  // Create a route to associate a tag with a todo
  // Create a route to associate a tag with a todo
app.post('/todos/:id/tags', (req, res) => {
    const todoId = parseInt(req.params.id); // Parse the ID as an integer
  
    // Check if the todoId is valid
    if (!TODOS.hasOwnProperty(todoId)) {
      return res.status(404).json({ error: 'Todo not found' });
    }
  
    // Associate a tag with the todo (You can choose a tag based on your logic)
    const tag = TAGS[Math.floor(Math.random() * TAGS.length)]; // Choose a random tag from TAGS array
  
    TODOS[todoId].tags.push({ id: tag.id });
  
    return res.status(200).json({ message: 'Tag associated with todo successfully' });
  });
  
  
  app.get('/tags/:id/todos', (req, res) => {
    const tagId = parseInt(req.params.id);
  
    if (isNaN(tagId) || tagId < 0 || tagId >= TAGS.length) {
      return res.status(404).json({ error: 'Tag not found' });
    }
  
    const tag = TAGS[tagId];
  
    // Retrieve todos associated with the tag
    const todos = Object.keys(TODOS)
      .filter((todoId) => {
        const todo = TODOS[todoId];
        return todo.tags.some((t) => t.id === tag.id);
      })
      .map((todoId) => ({ id: todoId, ...TODOS[todoId] }));
  
    res.json(todos);
  });
  
  
  
  
  

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
