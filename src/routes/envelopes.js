const express = require('express');
const envelopesRouter = express.Router();
const Database = require('../database/database');
const dbPath = "./src/database/database.json";
const db = new Database(dbPath);

envelopesRouter.param('id', (req, res, next, id) => {
    if(id){
        const envelope = db.getEnvelope(Number(id));
        if(envelope){
            req.envelope = envelope;
            next();
        }else{
            res.status(404).send('Invalid Id.');
        }
    }else {
        req.envelope = null;
        next();
    }
    
});

envelopesRouter.post('/', (req, res, next) => {
    const label = req.body.label;
    const value = req.body.value;
    if(label && value){
        if((typeof value !== 'number') || (value < 0)){
            res.status(400).send('Value must be a number bigger than 0');
        }else{
            const newEnvelope = db.addEnvelope(label, value);
            res.status(201).send(newEnvelope);
        }
    }else{
        res.status(400).send('Missing Data');
    }
});

envelopesRouter.post('/update/:id', (req, res, next) => {
    const newValue = req.body.value;
    if(typeof newValue === "number"){
        try{
            const updatedEnvelope = db.updateEnvelope(req.envelope.id, newValue);
            res.status(200).send(updatedEnvelope);
        }catch(err){
            res.status(500).send(err);
        }
    }else{
        res.status(400).send('Invalid value.');
    }
});

envelopesRouter.post('/transfer/:from/:to',(req, res, next) => {
    const fromEnvelope = db.getEnvelope(Number(req.params.from));
    const toEnvelope = db.getEnvelope(Number(req.params.to));
    const value = req.body.value;
    if(fromEnvelope && toEnvelope){
        if(fromEnvelope.value - value <= 0){
            res.status(403).send('Insufficient funds');
        }else{
            const newFromValue = fromEnvelope.value - value;
            const newToValue = toEnvelope.value + value;
            try{
                const updatedFromEnvelope = db.updateEnvelope(fromEnvelope.id, newFromValue);
                const updatedToEnvelope = db.updateEnvelope(toEnvelope.id, newToValue);
                const data = {
                    "from": updatedFromEnvelope,
                    "to": updatedToEnvelope}
                res.status(200).send(data);
            }catch(err){
                res.status(500).send(err);
            }
        }
    }else{
        res.status(400).send('Invalid envelop.');
    }
});

envelopesRouter.get('/', (req, res, next) => {
    res.status(200).send(db.getEnvelope());
});

envelopesRouter.get('/:id', (req, res, next) => {
    res.status(200).send(req.envelope);
});

envelopesRouter.delete('/:id', (req, res, next) => {
    const removedEnvelope = db.removeEnvelope(req.envelope.id);
    if(removedEnvelope){
        res.status(200).send(removedEnvelope);
    } else{
        res.status(500).send('Something went wrong.');
    }
});

module.exports = envelopesRouter;