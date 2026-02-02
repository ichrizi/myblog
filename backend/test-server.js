const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('Got request to /');
  res.send('ok');
});

const server = app.listen(6666, () => {
  console.log('Server listening on 6666');
});

// Auto-close after 20 seconds
setTimeout(() => {
  console.log('Closing server');
  server.close();
}, 20000);
