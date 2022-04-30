// Place your server entry point code here
//Require Express 
const express = require('express')
const app = express()
//Require Mninmist 
const args = require('minimist')(process.argv.slice(2))
args["port", "debug", "log", "help"]
//Require database
const db = require('src\services\database.js')
//Require morgan
const morgan = require('morgan')
//Require fs 
const fs = require('fs')

app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//Store help text 
const help = (`
server.js [options]
--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.
--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws 
            an error with the message "Error test successful." Defaults to 
            false.
--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.
--help	Return this message and exit.
`)

//If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

//Initialize  
const HTTP_PORT = args.port || process.env.PORT || 5555
//Start Listening 
const server = app.listen(HTTP_PORT, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',HTTP_PORT))
});

//Check w morgan
if (!args.log) { 
    //Create a write stream to append (flags: 'a') to a file
    const access = fs.createWriteStream('access.log', { flags: 'a' })
    //Set up the access logging middleware
    app.use(morgan('combined', { stream: access }))
}

//Middleware 
app.use( (req, res, next) => {
  //Your middleware goes here:
  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      date: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['useragent']
  }

  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, date, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.date, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referer, logdata.useragent)
  next()
});

app.get('/app/', (req, res) => {
  res.statusCode = 200; 
  //Respond with status message "OK"
  res.statusMessage = 'OK';
  res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
  res.end(res.statusCode + ' ' + res.statusMessage)
}); 

//Endpoints
if (args.debug) {
    app.get('/app/log/access', (req, res) => {
      try{
        const fr = db.prepare('SELECT * FROM accesslog').all()
        res.status(200).json(fr)
      } catch (e){
        console.error(e);
      }
    });
    
    app.get('/app/error', (req, res) => {
        throw new Error ("Error test successful.")
    })
}

//Functions from a02
function coinFlip() {
    var results = ['heads', 'tails'];
    return results[Math.floor(Math.random() * results.length)];
  }

function coinFlips(flips) {
  var results = ['heads', 'tails'];
  var answer = []; 

  for(let i = 0; i < flips; i++) {
    answer[i] = results[Math.floor(Math.random() * results.length)];
  }

  return answer; 
}

function countFlips(array) {

    var headss = 0; 
    var tailss = 0; 
  
    for(let i = 0; i < array.length; i++) {
      if(array[i] == "heads"){
        headss++; 
      }
      else{ 
        tailss++; 
      }
    }
  
    const count = { tails: tailss,  heads: headss };
    return count; 
  }

  function flipACoin(call) {
    var results = ['heads', 'tails'];
    var flipp = results[Math.floor(Math.random() * results.length)]; 
  
    var winOrLose; 
  
    if(flipp == call){
      winOrLose = "win";
    }
    else{
      winOrLose = "lose";
    }
  
    const resultss = { call: call, flip: flipp, result: winOrLose };
    return resultss; 
  }
  //End Functions...

  //a03 Calls 

  app.get('/app/flip/', (req, res) => {
    res.statusCode = 200;
    res.writeHead(res.statusCode, {'Content-Type' : 'text/plain'});
    res.end('{"flip":"' + coinFlip() + '"}')
  });

  app.get('/app/flips/:number', (req, res) => {
    var flip = coinFlips(req.params.number)
    var num = countFlips(flip)
    res.status(200).json({'raw' : flip, 'summary' : num})
  });

  app.get('/app/flip/call/:guess(heads|tails)/', (req, res) => {
    const guesss = flipACoin(req.params.guess)
    res.status(200).json(guesss)
  });

  //Default Response 
  app.use(function(req, res) {
    res.status(404).send('404 NOT FOUND')
  });
