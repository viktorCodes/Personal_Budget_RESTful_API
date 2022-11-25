const express = require('express');
const app = express();
envelopesRouter = express.Router()
const PORT = process.env.PORT || 3000;

module.exports = app;


evelopeRouter.param('id', (req, res, next, id) => {

})


app.listen(PORT, () => {
    
    console.log("Server Listening on PORT", PORT);
});