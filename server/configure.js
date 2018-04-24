const path = require('path');
const routes = require('./routes');
const exphbs = require('express-handlebars');
const express = require('express');
const bodyparser = require('body-parser');
const cookparser = require('cookie-parser');
const morgan = require('morgan');
const methodOverride = require('method-override');
const errorHandler = require('errorhandler');
const moment = require("moment");
const multer = require("multer");

module.exports = (app)=>{
    app.use(morgan('dev'));
    app.use(bodyparser.urlencoded({'extended':true}));
    app.use(bodyparser.json());
    app.use(methodOverride());
    app.use(cookparser('mycookie123'));


    if ('development'== app.get('env')) {
        app.use(errorHandler());
    }
    app.engine('handlebars', exphbs.create({
        defaultLayout:'main',
        layoutsDir: `${app.get('Views')}/layouts`,
        partialsDir: [`${app.get('Views')}/partials`],
        helpers: {
            timeago: (timestamp)=> {
                return moment(timestamp).startOf('minutes').fromNow();
            }
        }
    }).engine);
    app.set('view engine', 'handlebars');
    app.use(multer({ dest: path.join(__dirname, 'public/upload/temp')}).single('file'));
    
    routes(app);
    app.use('/public/', express.static(path.join(__dirname, '../public')));
    
    return app;
};