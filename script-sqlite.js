const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('todobackend.db');




app.get('/todos', (req, res) => {
  db.all('SELECT * FROM todos WHERE id != 1', (err, results) => {
    if (err) {
      console.error('Error fetching todos:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }
    
    // Formatez les résultats de la requête pour correspondre à votre format souhaité
    const formattedResults = results.map((row) => ({
      id: row.id.toString(),
      title: row.title,
      completed: row.completed === 0 ? false : true,
      url: row.url,
      order: row.order,
      tags: JSON.parse(row.tags),
    }));

    res.json(formattedResults);
  });
});

app.post('/todos', (req, res) => {
  const data = req.body;

  const newTodo = {
    id: 1,
    title: data.title || 'Untitled Todo',
    order: data.order || 0,
    completed: data.completed === 1 ? true : false,
    url: 'http://localhost:8080/todos/1',
    tags: []
  };

  const query = 'INSERT INTO todos (title, url, `order`, completed, tags) VALUES (?, ?, ?, ?, ?)';

  db.run(query, [newTodo.title, newTodo.url, newTodo.order, newTodo.completed, JSON.stringify(newTodo.tags)], function(err) {
    if (err) {
      console.error('Error inserting todo:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const newTodoId = this.lastID;
    newTodo.url = `${req.protocol}://${req.get('host')}/todos/${newTodoId}`;

    res.status(201).set('Location', newTodo.url).json(newTodo);
  });
});

app.get('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);

  if (isNaN(todoId)) {
    res.status(400).json({ error: 'Invalid todo ID' });
    return;
  }

  const query = 'SELECT * FROM todos WHERE id = ?';

  db.get(query, [todoId], (err, row) => {
    if (err) {
      console.error('Error fetching todo:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (!row) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    // Décoder la colonne tags en utilisant JSON.parse
    if (row.tags) {
      row.tags = JSON.parse(row.tags);
    }

    res.json(row);
  });
});

// Delete all todos endpoint
app.delete('/todos', (req, res) => {
  const deleteQuery = 'DELETE FROM todos';

  db.run(deleteQuery, function (err) { // Use db.run for DELETE queries
    if (err) {
      console.error('Error deleting todos:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // After the delete operation, insert a new todo
    const newTodo = {
      title: 'Untitled Todo',
      order: 95,
      completed: false,
      tags: [{"id":"0","title":"build an API","completed":false,"url":"string","order":10},{"id":"2","title":"profit!","completed":false,"url":"string","order":3}],
    };

    insertNewTodo(newTodo, req, res);
  });
});


// Define a function to handle the insertion of a new todo
const insertNewTodo = (newTodo, req, res) => {
  const insertQuery = 'INSERT INTO todos (title, "order","completed", tags) VALUES (?, ?, ?, ?)';
  const values = [newTodo.title, newTodo.order, newTodo.completed, JSON.stringify(newTodo.tags)];

  db.run(insertQuery, values, function (err) { // Use db.run for INSERT queries
    if (err) {
      console.error('Error inserting todo:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    const newTodoId = this.lastID; // Get the ID of the newly inserted row
    newTodo.url = `${req.protocol}://${req.get('host')}/${newTodoId}`;

    res.status(201).set('Location', newTodo.url).json(newTodo);
  });
};


app.patch('/todos/:id', (req, res) => {
  const todoId = parseInt(req.params.id);

  if (isNaN(todoId)) {
    res.status(400).json({ error: 'Invalid todo ID' });
    return;
  }

  const data = req.body;

  // Recherchez la tâche existante dans la base de données
  const selectQuery = 'SELECT * FROM todos WHERE id = ?';
  db.get(selectQuery, [todoId], (selectErr, existingTodo) => {
    if (selectErr) {
      console.error('Error fetching todo:', selectErr);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (!existingTodo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    // Appliquez les modifications à la tâche existante
    if (data.title !== undefined) {
      existingTodo.title = data.title;
    }

    if (data.completed !== undefined) {
      existingTodo.completed = Boolean(data.completed);
    }

    if (data.order !== undefined) {
        existingTodo.order = data.order;
      }
  
      if (data.tags !== undefined) {
        // Assurez-vous que les tags sont stockés en tant que chaîne JSON dans la base de données
        existingTodo.tags = JSON.stringify(data.tags);
      }
  
      // Mettez à jour la tâche dans la base de données
      const updateQuery = 'UPDATE todos SET title = ?, `order` = ?, completed = ?, tags = ? WHERE id = ?';
      db.run(updateQuery, [existingTodo.title, existingTodo.order, existingTodo.completed, existingTodo.tags, todoId], (updateErr) => {
        if (updateErr) {
          console.error('Error updating todo:', updateErr);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        console.log(existingTodo);
        res.json(existingTodo);
      });
    });
  });
  
  app.delete('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
  
    if (isNaN(todoId)) {
      res.status(400).json({ error: 'Invalid todo ID' });
      return;
    }
  
    // Supprimez la tâche de la base de données
    const deleteQuery = 'DELETE FROM todos WHERE id = ?';
    db.run(deleteQuery, [todoId], (deleteErr) => {
      if (deleteErr) {
        console.error('Error deleting todo:', deleteErr);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      res.sendStatus(204);
    });
  });
  //////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////

  // Endpoint pour récupérer les tags
app.get('/tags', (req, res) => {
  // Requête SQL pour récupérer tous les tags
  const query = 'SELECT * FROM tags';

  // Exécutez la requête SQL
  db.all(query, (err, results) => {
    if (err) {
      console.error('Error fetching tags:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Parcourez les résultats et analysez la colonne todos en tant que JSON
    const parsedResults = results.map((result) => {
      if (result.todos) {
        result.todos = JSON.parse(result.todos);
      }
      return result;
    });

    // Envoi des résultats avec les colonnes "todos" analysées en tant que réponse JSON
    res.json(parsedResults);
  });
});

// Endpoint pour créer un nouveau tag
app.post('/tags', (req, res) => {
  const data = req.body;

  if (!data || !data.title) {
    res.status(400).json({ error: '"title" is a required field' });
  } else {
    // Requête SQL pour insérer un nouveau tag
    const insertQuery = 'INSERT INTO tags (title,url,todos) VALUES (?, ?, ?)';

    // Exécutez la requête SQL avec la valeur du titre du tag
    db.run(insertQuery, [data.title,'string',[{"id":"0","title":"build an API","completed":false,"url":"string","order":10},{"id":"2","title":"profit!","completed":false,"url":"string","order":3}]], function (err) {
      if (err) {
        console.error('Error inserting tag:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }

      // Récupérez l'ID du nouveau tag inséré
      const newTagId = this.lastID;

      // Créez un objet représentant le nouveau tag
      const newTag = {
        id: newTagId,
        title: data.title,
        url: `http://localhost:8080/tags/${newTagId}`,
        todos: [],
      };

      // Réponse avec le nouveau tag créé
      res.status(201).json(newTag);
    });
  }
});

  
  // Gestion de la fermeture de la base de données lors de l'arrêt de l'application
  process.on('SIGINT', () => {
    db.close(() => {
      console.log('Database connection closed.');
      process.exit(0);
    });
  });
  
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
