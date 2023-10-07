const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(express.json());
app.use(cors());

const mysql = require('mysql');

const db = mysql.createConnection({
  host: 'localhost', 
  user: 'root',
  password: '', 
  database: 'todobackend', 
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


app.get('/todos', (req, res) => {
    db.query('SELECT id, title, CASE WHEN completed = 0 THEN false ELSE true END AS completed, url, `order`, tags FROM todos Where id != 1', (err, results) => {
      if (err) {
        console.error('Error fetching todos:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
      
      // Formatez les résultats de la requête pour correspondre à votre format souhaité
      const formattedResults = results.map((row) => ({
        id: row.id.toString(),
        title: row.title,
        completed: row.completed == 1 ? true : false, 
        url: row.url,
        order: row.order,
        tags: JSON.parse(row.tags),
      }));
  
      res.json(formattedResults);
    });
  });
  
  // post a todo endpoint
  app.post('/todos', (req, res) => {
    const data = req.body;
  
    const newTodo = {
      id: 1,
      title: data.title || 'Untitled Todo',
      order: data.order || 0,
      completed: data.completed == 1 ? true : false, 
      url: 'http://localhost:8080/todos/1', // Vous pouvez le remplir comme vous le souhaitez
      tags: []
      , // Vous pouvez définir les tags ici si nécessaire
    };
  
    const query = 'INSERT INTO todos (title, completed, url, `order`, tags) VALUES (?, ?, ?, ?, ?)';
  
    db.query(query, [newTodo.title, newTodo.completed, newTodo.url, newTodo.order, JSON.stringify(newTodo.tags)], (err, result) => {
      if (err) {
        console.error('Error inserting todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      const newTodoId = result.insertId;
      newTodo.url = `${req.protocol}://${req.get('host')}/todos/${newTodoId}`;
  
      res.status(201).set('Location', newTodo.url).json(newTodo);
    });
  });
  
  // get todo by id
  app.get('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
  
    if (isNaN(todoId)) {
      res.status(400).json({ error: 'Invalid todo ID' });
      return;
    }
  
    const query = 'SELECT * FROM todos WHERE id = ?';
  
    db.query(query, [todoId], (err, results) => {
      if (err) {
        console.error('Error fetching todo:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
  
      const todo = results[0];
      
      // Décoder la colonne tags en utilisant JSON.parse
      if (todo.tags) {
        todo.tags = JSON.parse(todo.tags);
      }
  
      res.json(todo);
    });
});

app.delete('/todos', (req, res) => {
    // Supprimer tous les todos
    const deleteQuery = 'DELETE FROM todos';
  
    db.query(deleteQuery, (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error('Error deleting todos:', deleteErr);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      // Après la suppression, insérer un nouveau todo
      const insertQuery = `
        INSERT INTO todos (id, title, \`order\`, completed, url,tags)
        VALUES
          (1,'Untitled Todo', 95, true, 'string','[{"id":"0","title":"build an API","completed":false,"url":"string","order":10},{"id":"2","title":"profit!","completed":false,"url":"string","order":3}]'
          )
      `;
  
      db.query(insertQuery, (insertErr, insertResult) => {
        if (insertErr) {
          console.error('Error inserting todos:', insertErr);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        res.sendStatus(204); // No Content (Success)
      });
    });
  });
  
  
  
  
  app.patch('/todos/:id', (req, res) => {
    const todoId = parseInt(req.params.id);
  
    if (isNaN(todoId)) {
      res.status(400).json({ error: 'Invalid todo ID' });
      return;
    }
  
    const data = req.body;
    let insertedVelue = 1;
    // Recherchez la tâche existante dans la base de données
    const selectQuery = 'SELECT * FROM todos WHERE id = ?';
    db.query(selectQuery, [todoId], (selectErr, selectResults) => {
      if (selectErr) {
        console.error('Error fetching todo:', selectErr);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (selectResults.length === 0) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
  
      const existingTodo = selectResults[0];
  
      // Appliquez les modifications à la tâche existante
      if (data.title !== undefined) {
        existingTodo.title = data.title;
      }
  
      if (data.completed !== undefined) {
        existingTodo.completed = true;
        

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
      db.query(updateQuery, [existingTodo.title, existingTodo.order, existingTodo.completed, existingTodo.tags, todoId], (updateErr) => {
        if (updateErr) {
          console.error('Error updating todo:', updateErr);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
        console.log(existingTodo)
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
  
    // Recherchez la tâche existante dans la base de données
    const selectQuery = 'SELECT * FROM todos WHERE id = ?';
    db.query(selectQuery, [todoId], (selectErr, selectResults) => {
      if (selectErr) {
        console.error('Error fetching todo:', selectErr);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (selectResults.length === 0) {
        res.status(404).json({ error: 'Todo not found' });
        return;
      }
  
      // Supprimez la tâche de la base de données
      const deleteQuery = 'DELETE FROM todos WHERE id = ?';
      db.query(deleteQuery, [todoId], (deleteErr) => {
        if (deleteErr) {
          console.error('Error deleting todo:', deleteErr);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        res.sendStatus(204);
      });
    });
  });
  
  
  //////////////////////////////////////////////////////////////////////////////////

  //////////////////////////////////////////////////////////////////////////////////

  app.get('/tags', (req, res) => {
    const query = 'SELECT * FROM tags';
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching tags:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      // Parcourir les résultats et analyser la colonne todos en JSON
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
  // post a tag endpoint
  app.post('/tags', (req, res) => {
    const data = req.body;
  
    if (!data || !data.title) {
      res.status(400).json({ error: '"title" is a required field' });
    } else {
      // Créez une requête d'insertion SQL pour ajouter le nouveau tag
      const insertQuery = 'INSERT INTO tags (title) VALUES (?)';
  
      db.query(insertQuery, [data.title], (err, result) => {
        if (err) {
          console.error('Error inserting tag:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }
  
        const newTagId = result.insertId;
        const newTag = {
          id: newTagId,
          title: data.title,
          url: `http://localhost:8080/tags/${newTagId}`,
          todos: [],
        };
  
        res.status(201).json(newTag);
      });
    }
  });
  
  // delete all tags endpoint
  
 app.delete('/tags', (req, res) => {
  // Requête SQL pour supprimer tous les enregistrements de la table "tags"
  const deleteQuery = 'DELETE FROM tags';

  // Exécutez la requête SQL pour supprimer tous les tags
  db.query(deleteQuery, (err, result) => {
    if (err) {
      console.error('Error deleting tags:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Réponse avec un statut 204 (No Content) pour indiquer que la suppression a réussi
    res.sendStatus(204);
  });
});





// delet tag by id
// Endpoint pour récupérer un tag par son ID
app.get('/tags/:id', (req, res) => {
  const tagId = parseInt(req.params.id);
  
  if (isNaN(tagId)) {
    res.status(400).json({ error: 'Invalid tag ID' });
    return;
  }

  // Requête SQL pour récupérer un tag par son ID depuis la base de données
  const selectQuery = 'SELECT * FROM tags WHERE id = ?';

  // Exécutez la requête SQL avec le paramètre d'ID
  db.query(selectQuery, [tagId], (err, results) => {
    if (err) {
      console.error('Error fetching tag:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    // Si aucun résultat n'est renvoyé, le tag n'a pas été trouvé
    if (results.length === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    // Renvoyez le tag trouvé en tant que réponse JSON
    const tag = results[0];
    res.json(tag);
  });
});

app.patch('/tags/:id', (req, res) => {
  const tagId = parseInt(req.params.id);

  if (isNaN(tagId) || tagId < 0) {
    res.status(400).json({ error: 'Invalid tag ID' });
    return;
  }

  const data = req.body;

  if (!data || !data.title) {
    res.status(400).json({ error: '"title" is a required field' });
    return;
  }

  // Générez l'URL mise à jour en fonction du nouvel ID
  const updatedUrl = `http://localhost:8080/tags/${tagId}`;

  // Requête SQL pour mettre à jour le titre et l'URL du tag en fonction de l'ID
  const updateQuery = 'UPDATE tags SET title = ?, url = ? WHERE id = ?';

  // Exécutez la requête SQL pour mettre à jour le titre et l'URL du tag
  db.query(updateQuery, [data.title, updatedUrl, tagId], (err, result) => {
    if (err) {
      console.error('Error updating tag:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json({ id: tagId, title: data.title, url: updatedUrl });
  });
});
// delete tags
app.delete('/tags/:id', (req, res) => {
  const tagId = parseInt(req.params.id);

  if (isNaN(tagId) || tagId < 0) {
    res.status(400).json({ error: 'Invalid tag ID' });
    return;
  }

  // Requête SQL pour supprimer le tag en fonction de son ID
  const deleteQuery = 'DELETE FROM tags WHERE id = ?';

  // Exécutez la requête SQL pour supprimer le tag
  db.query(deleteQuery, [tagId], (err, result) => {
    if (err) {
      console.error('Error deleting tag:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.sendStatus(204);
  });
});

app.get('/todos/:id/tags', (req, res) => {
  const todoId = parseInt(req.params.id);

  if (isNaN(todoId)) {
    res.status(400).json({ error: 'Invalid todo ID' });
    return;
  }

  // Requête SQL pour récupérer les tags associés à un todo par son ID
  const selectQuery = 'SELECT tags.id, tags.title, tags.url FROM tags JOIN todo_tags ON tags.id = todo_tags.tag_id WHERE todo_tags.todo_id = ?';

  // Exécutez la requête SQL
  db.query(selectQuery, [todoId], (err, results) => {
    if (err) {
      console.error('Error fetching todo tags:', err);
      res.status(500).json({ error: 'Internal Server Error' });
      return;
    }

    res.json(results);
  });
});

  


  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  