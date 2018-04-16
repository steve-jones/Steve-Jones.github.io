var express = require('express');
var path = require('path');
var fs = require('fs');

var app = express();
app.use('/static', express.static(path.join(__dirname, '../static')));
app.use('/data', express.static(path.join(__dirname, '../data')));

var port = 7450;

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(port, function() {
    console.log('App listening on port %d', port);
});
