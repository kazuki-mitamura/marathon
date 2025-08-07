const express = require('express');
const app = express();
const port = 5036;

app.get('/', (req, res) => {
  res.send('Hello, World!mita');
});

app.listen(5036, () => {
  console.log(`Express app listening at http://localhost:${port}`);
});