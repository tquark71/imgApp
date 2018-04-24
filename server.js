const express = require("express");
const config = require('./server/configure');
const mongoose = require('mongoose');

let app = express();

mongoose.connect('mongodb://localhost/ksimgstore');
mongoose.connection.on('open', ()=>{
    console.log('MongoDB connected.');
});

app.set('port', process.env.PORT || 3300);
app.set("Views", `${__dirname}/views`);
app = config(app);


const server = app.listen(app.get('port'),() =>{
    console.log(`Server up on http://localhost:${app.get('port')}`);
});