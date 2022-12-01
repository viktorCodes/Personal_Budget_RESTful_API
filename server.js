// app.js
const morgan = require('morgan');
const errorHandler = require('errorhandler');
const cors = require('cors');
const bodyParser = require('body-parser');
const express = require('express');
const envelopesRouter = express.Router();


const app = express();
const PORT = process.env.PORT || 4001;

app.use(bodyParser.json());
app.use(errorHandler());
app.use(cors());
app.use(morgan('dev'));

const apiRouter = require('./src/routes/api.js');
app.use('/', apiRouter);

app.use('/', envelopesRouter)

envelopesRouter.param('category', (req, res, next, cat) => {
    const envelope = getEnvelope(cat)
    if(envelope){
        req.envelope = envelope;
        req.category = cat;
        next();
    } else{
        res.status(404).send('Category not found');
        console.log('\n*****Invalid Category');
    }
});

envelopesRouter.param('action', (req, res, next, action) => {
    req.action = action;
    next();
})

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});

module.exports = app;