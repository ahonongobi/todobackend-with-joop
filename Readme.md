unue mi havas tion: 

```python
const TODOS = {
  0: { title: 'build an API', order: 1, completed: false},
  1: { title: '?????', order: 2, completed: false },
  2: { title: 'profit!', order: 3, completed: false},
};

```

Add tags (e.g. 'work', 'social', 'miscellaneous'...) so we can add one or more tag to todos (many-to-many relationship between todos and tags). We should be able to add tags and find todos linked to specific tag(s) directly from your REST API.

Add database persistence such that todos and tags are not lost upon server restart