const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

module.exports = app;


app.get('/', (req, res, next) => {
    res.send('Hello World');
});


app.listen(PORT, () => {
    
    console.log("Server Listening on PORT", PORT);
});