var fs      = require('fs');
var express = require('express');
var app     = express();
var http    = require('http').Server(app);

var https = require('https');
var privateKey  = fs.readFileSync('key.pem', 'utf8');
var certificate = fs.readFileSync('key-cert.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);

var io      = require('socket.io')(http);
var url     = require("url");

var findpairsFilename = '/test.findpairs.html';
var adminFilename = '/test.admin.html';
var findpairsIconFilename = '/fp3.png';
var users = {}; // key:userName, value:{ socket, matchids:[], playingMatchId }
var games = []; // { matchId, players:[], numPairs }
var GameStates = { created:1, playing:2, suspended:3, gameover:4 };

var httpPort = 3010;
var httpsPort = 4010;

var admin;

function sendLogon(socket, user, inMsgName) {
  console.log(inMsgName + ", not logged, user=" + user);
  socket.emit("logon", { user:user, called:inMsgName, err:"not logged" });
}

function sendGames(socket) {
  socket.emit("games", games.map(g => {
    let gamesMsgGame = { matchId:g.matchId, creator:g.creator, numPairs:g.numPairs, numPlayers:g.players.length, gameState:Object.keys(GameStates)[g.gameState-1] };
    return gamesMsgGame;
  }));
}

function sendToPlayers(game, msgName, msg) {
  let sockets = [], brokenSocket;

  console.log('msg: <- "' + msgName + '"=' + JSON.stringify(msg));
  
  // sockets = game.players.map(user => users[user].socket);
  game.players.forEach(user => { if (game.removedPlayers[user] !== true) sockets.push(users[user].socket); });
  sockets.forEach(socket => { if (socket === undefined) brokenSocket = true; });

  if (!brokenSocket) {
    game.msgs.push({ msgName:msgName, msg:msg });
    
    sockets.forEach(socket => {
      socket.emit(msgName, msg);
    });
    
    if (msgName === "start game") game.players.forEach(user => { users[user].playingMatchId = game.matchId });
  }
}

function Game(args) {
  let
  gameState = args.state,
  creator = args.creator,
  pairList = Array(args.numOfPairs).fill(null).map((char, i) => { return "" + (i + 1); }), //String.fromCharCode("a".charCodeAt(0) + i)),
  faceUp = [],
  removed = 0,
  board,
  cards,
  scores,
  
  shuffleCards = function() {
    let numPairs = pairList.length,
	cardId = [ "a", "b" ], // [ 1, 2 ],
	alreadySet = {},
	boardSize = 2*numPairs,
	i;
    
    board = Array(boardSize).fill(null);
    cards = Array(boardSize);
    for (i=0; i<cards.length; i++) cards[i] = { facedown:true, removed:false, };
    
    pairList.forEach(pairName => {
      cardId.forEach(id => {
	for (;;) {
	  i = Math.floor(Math.random() * boardSize); // i = integer [0 - (boardSize-1)]
	  if (alreadySet["" + i] !== true) {
	    alreadySet["" + i] = true;
	    board[i] = pairName + id;
	    cards[i].faceValue = pairName;
	    cards[i].position = i;
	    break;
	  }
	} // for(;;)
      });
    });

    console.log("shuffleCards, board=" + board + ", numPairs=" + numPairs);
    console.log("shuffleCards, cards=" + JSON.stringify(cards));
    return board;
  }, // shuffleCards

  changeTurn = function(turn) {
    let newTurn = turn, i;

    for (i=0; i<this.players.length; i++) {
      newTurn = ((turn + 1 + i) % this.players.length);
      if (this.removedPlayers[ this.players[newTurn] ]) continue; // skip a removed player
      else break;
    }

    this.currentTurn = newTurn;
    return newTurn;
  },
  
  play = function(cardI, turn) {
    let card = cards[cardI],
	retVal = { gameover:false, cards:[ card ], turn:turn, scores:scores };
    
    if (faceUp.length < 2 && card.facedown) {
      card.facedown = false;
      faceUp.push(card);
      console.log("game.play, turned, cardI=" + cardI + ", card=" + JSON.stringify(card));
    }
    
    if (faceUp.length > 1) {
      /* two cards are face-up */
      retVal.cards.push(faceUp[0]);
      
      if (faceUp[0].faceValue === faceUp[1].faceValue) {
	/* pair found */
	faceUp.forEach(card => card.removed = true );
	faceUp = [];
	removed++;
	scores[turn] += 1;
	if (removed === pairList.length) {
	  retVal.gameover = true;
	  this.gameState = GameStates.gameover;
	}
	else retVal.turn = this.changeTurn(turn);
      } else {
	/* Not a pair. Return cards back to the face-down state. */
	faceUp.forEach(card => card.facedown = true);
	faceUp = [];
	retVal.turn = this.changeTurn(turn);
      }
    }

    return retVal;
  } // play

  this.shuffleCards = shuffleCards;
  this.changeTurn = changeTurn;
  this.play = play;

  this.matchId       = args.matchId;
  this.players       = args.players, // [ "userName", "userName", ... ]
  this.removedPlayers = {};          // when player is removed, removedPlayers[userName] = true; changeTurn() skips the removed players
  scores             = Array(args.players.length).fill(0);
  this.numPairs      = args.numOfPairs;
  this.gameState     = gameState;
  this.creator       = creator;
  this.joinedPlayers = [ creator.name ];
  this.msgs          = [];

  this.currentTurn = 0;

  this.getScores = function() { return scores };
}; // Game

//****************************************************************************************************************************************************************************
app.get("/font-awesome-4.7.0/*", function(req, res) {
  var pathname = url.parse(req.url).pathname.slice(1);
  res.sendFile(__dirname + "/" + pathname);
});

app.get('/css/spruits-2018.9.css', function(req, res){
  res.sendFile(__dirname + '/css/spruits-2018.9.css');
});

//****************************************************************************************************************************************************************************
app.get('/js/socket.io.js', function(req, res){
  res.sendFile(__dirname + '/js/socket.io.js');
});

app.get('/js/socket.io.js.map', function(req, res){
  res.sendFile(__dirname + '/js/socket.io.js.map');
});

app.get('/js/jquery-3.1.1.min.js', function(req, res){
  res.sendFile(__dirname + '/js/jquery-3.1.1.min.js');
});

app.get('/js/spruits2.js', function(req, res){
  res.sendFile(__dirname + '/js/spruits2.js');
});

//****************************************************************************************************************************************************************************
app.get('/', function(req, res){
  res.sendFile(__dirname + findpairsFilename);
});

app.get('/findpairs', function(req, res){
  res.sendFile(__dirname + findpairsFilename);
});

app.get('/fp2.png', function(req, res){
  res.sendFile(__dirname + findpairsIconFilename);
});

app.get('/favicon.ico', function(req, res){
  res.sendFile(__dirname + findpairsIconFilename);
});

app.get('/admin', function(req, res){
  res.sendFile(__dirname + adminFilename);
});

app.get('/manifest.json', function(req, res){
  //res.sendFile(__dirname + findpairsFilename);
  var pathname = url.parse(req.url).pathname.slice(1);
  res.sendFile(__dirname + "/" + pathname);
});

app.get('/*', function(req, res){
  //res.sendFile(__dirname + findpairsFilename);
  var pathname = url.parse(req.url).pathname.slice(1);
  console.log("app.get(/*), pathName=" + pathname);  
});

//****************************************************************************************************************************************************************************
io.on("connection", function(socket){
  console.log("user connected");

  socket.on("my-name", function(myname) {
    let i;
    
    console.log("my-name, myname=" + myname);
    if (users[myname] !== undefined) {
      console.log("my-name, exists in users, myname=" + myname + ", playing=" + users[myname].playingMatchId + ", matchids=" + users[myname].matchids);
      users[myname].socket = socket;
      if (users[myname].playingMatchId !== undefined && users[myname].playingMatchId > -1 && games[users[myname].playingMatchId].removedPlayers[myname] !== true) {
	console.log("my-name, rejoin to the game, matchId=" + users[myname].playingMatchId);
	socket.emit("hood", { state:"on" });
	games[users[myname].playingMatchId].msgs.forEach(msg => { socket.emit(msg.msgName, msg.msg) });
	socket.emit("hood", { state:"off", timeout:3000 });
      }
    } else {
      users[myname] = { socket:socket, matchids:[] };
    }
    
    for (i=0; i<users[myname].matchids.length; i++) {
      console.log("my-name, matchId=" + i + ", state=" + Object.keys(GameStates)[games[i].gameState-1]);
    }
    
    sendGames(socket);
  });
  
  socket.on("disconnect", function(){
    let u = Object.keys(users), i, disconnectedUser = "";
    for (i=0;i<u.length;i++) {
      if (socket.id === users[u[i]].socket.id) {
	disconnectedUser = u[i] + " ";
	break;
      }
    }
    console.log("user " + disconnectedUser + "disconnected");
  });

  socket.on("create game", function(msg){
    /* msg = { user, playerId, numPairs }, playerId = 0 or 1; id = 0 starts the game */
    let matchId,
	creator = {},
	players = Array(msg.numPlayers ? parseInt(msg.numPlayers) : 2);

    console.log("create game: " + JSON.stringify(msg));

    if (users[msg.user] === undefined) {
      sendLogon(socket, msg.user, "create game");
      return;
    }
      
    matchId = games.length;
    players[msg.playerId] = msg.user;
    users[msg.user].matchids.push(matchId);

    creator.id = players[0] ? 0 : 1;
    creator.name = players[creator.id];

    games.push(new Game({ matchId:matchId, state:GameStates.created, creator:creator, players:players, numOfPairs:parseInt(msg.numPairs) }));
    
    sendGames(io);
  });

  socket.on("join game", function(msg) {
    /* msg = { user, game:{ matchId, creator:{ id, name }, numPairs } } */
    let game = games[msg.game.matchId], // game = { matchId, players:[2], numPairs }
	sockets,
	brokenSocket = false,
	board;

    if (users[msg.user] === undefined) {
      sendLogon(socket, msg.user, "create game");
      return;
    }

    if (game.joinedPlayers.length === game.players.length) { // game.players[0] && game.players[1]) {
      console.log("join game: players attached already, game=" + JSON.stringify(game) + ", msg=" + JSON.stringify(msg));
    } else {
      
      /* if (game.players[0]) game.players[1] = msg.user;
       * else game.players[0] = msg.user;
       */
      for (i=0; i<game.players.length; i++) {
	if (game.players[i] === undefined) {
	  game.players[i] = msg.user;
	  game.joinedPlayers.push(msg.user);
	  console.log("join game, user=" + msg.user + ", i=" + i);
	  break;
	}
      }

      if (game.joinedPlayers.length === game.players.length) {
	game.gameState = GameStates.playing;
	game.players.forEach((user) => {
	  users[user].matchids.forEach((matchId) => {
	    if (matchId !== game.matchId && games[matchId].gameState === GameStates.created) {
	      games[matchId].gameState = GameStates.suspended;
	      console.log("join game, user=" + user + ", suspend matchId=" + matchId);
	    }
	  })
	});
	sendGames(io); 
	sendToPlayers(game, "start game", { matchId:game.matchId, players:game.players, turn:0, scores:game.scores, board:game.shuffleCards() });
      }
    }
  });

  socket.on("card click", function(msg) {
    /* msg = { matchId, players, turn, cardI } */
    let state, game = games[msg.matchId];
    console.log('msg: -> "card click"=' + JSON.stringify(msg));
    state = game.play(msg.cardI, msg.turn);
    sendToPlayers(game, "game state", { matchId:game.matchId, players:game.players, turn:state.turn, scores:state.scores, action:state });
  });

  socket.on("give up game", function(msg) {
    /* msg = { matchId, user, turn } */
    let game;
    
    console.log('msg: -> "give up game"=' + JSON.stringify(msg));

    if (msg.matchId === users[msg.user].playingMatchId) games[msg.matchId].removedPlayers[msg.user] = true;

    game = games[msg.matchId];
    if (msg.turn === game.currentTurn) {
      game.changeTurn(game.currentTurn);
      console.log("players[" + game.currentTurn +"] gave up. Changing turn.");
      sendToPlayers(game, "game state", { matchId:game.matchId, players:game.players, turn:game.currentTurn, scores:game.getScores(), action:{ gameover:false, cards:[], turn:game.currentTurn, scores:game.getScores() } });
    }
  });

  socket.on("unsuspend my games", function(msg){
    let activated = false;
    
    users[msg.user].matchids.forEach((matchId) => {
      if (games[matchId].gameState === GameStates.suspended) {
	games[matchId].gameState = GameStates.created;
	activated = true;
	console.log("unsuspend my games, user=" + msg.user + ", matchId=" + matchId);
      }
    });
    users[msg.user].playingMatchId = undefined;

    if (activated === true) sendGames(io);
  });  

  socket.on("private message", function(msg){
    users[msg.receiver].socket.emit("private message", { sender:msg.sender, msg:msg.msg });
  });
});

//****************************************************************************************************************************************************************************
admin = io.of('/admin');

// msg = { userName:"" }
function handleLoginMsg(socket, msg) {
  let outMsg = {};
  
  console.log('admin.msg: -> "login"=' + JSON.stringify(msg));

  outMsg.name = 'app state';
  outMsg.msg = {
    err:0,
    users:Object.keys(users).map(userName => {
      let user = users[userName];
      return { userName:userName, matchids:user.matchids, playingMatchId:user.playingMatchId };
    }),
    games:games,
    GameStates:GameStates
  };
  console.log('admin.msg: <- "' + outMsg.name + '"=' + JSON.stringify(outMsg.msg));
  socket.emit(outMsg.name, outMsg.msg);
}

function handleDisconnectMsg(socket, msg) {
  console.log("admin disconnected");
}

function handleMsgModifiedGame(socket, msg) {
  console.log('admin.msg: -> "modified game"=' + JSON.stringify(msg));

  modifiedGame = games[msg.matchId];
  modifiedGame.players.forEach(player => {
    if (msg.players.find(playerInMsg => { return player === playerInMsg; }) === undefined) {
      modifiedGame.removedPlayers[player] = true;
      console.log("handleMsgModifiedGame, matchId=" + msg.matchId + ", removed player=" + player);
    }
  });
}

admin.on("connection", function(socket) {
  console.log('admin connected');

  socket.on("login", msg => handleLoginMsg(socket, msg));
  socket.on("disconnect", msg => handleDisconnectMsg(socket, msg));
  socket.on("modified game", msg => handleMsgModifiedGame(socket, msg));
});

//****************************************************************************************************************************************************************************
http.listen(httpPort, function(){
  console.log('http listening on *:' + httpPort);
});
httpsServer.listen(httpsPort, function(){
  console.log('https listening on *:' + httpsPort);
});
