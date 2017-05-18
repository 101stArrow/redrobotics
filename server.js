// module imports

var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    low = require('lowdb'),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    uuid = require('uuid');

// globals

var PORT = 3000 || process.env.PORT
var db = low('db.json')
var game = {
    score: {
        red: 0,
        blue: 0
    },
    length: 180
}

// express config

app.use(morgan('common'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));
app.use(methodOverride());

app.use(express.static(__dirname + '/public/'));

// routes

app.get('/', function(req, res){
    res.sendFile(__dirname + '/public/index.html')
})

app.post('/red', function(req, res){
    if(req.body.value == 0){
        game.score.red++
        res.send(game.score)
        io.emit('score', game.score)
    } else {
        res.end()
    }
})

app.post('/blue', function(req, res){
    if(req.body.value == 0){
        game.score.blue++
        res.send(game.score)
        io.emit('score', game.score)
    } else {
        res.end()
    }
})

app.post('/startgame', function(req, res){
    startGame(req)
})

app.post('/score', function(req, res){
    score = req.body.score
    res.send(score)
})

io.on('connection', function(socket){
  console.log('a user connected');
  socket.emit('score', game.score)
});

// start server

http.listen(PORT)
console.log("Listening on http://localhost:"+PORT)

function startGame(req) {
    if(!req.body.length){
        clearInterval(game.timer)
        game.score = {
            red: 0,
            blue: 0
        }
        game.start = Date.now()
        game.clock = 0
        game.end = 180
        io.emit('startgame', game)
        game.timer = setInterval(function(){
            game.clock++
            io.emit('clock', game)
            if(game.clock == game.end){
                clearInterval(this)
                startGame(req)
            }
        }, 1000)
    }
}