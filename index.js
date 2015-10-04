var express = require('express');
var app = express();
var pg = require('pg');

app.set('port', (process.env.PORT || 5000));
var connectionString = process.env.DATABASE_URL || 'postgres://test:test@localhost:5432/charidata';

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/api/v1/haiti', function(request, response) {
  console.log(request.query);

  pg.connect(connectionString, function(err, client, done) {
    client.query("INSERT INTO haiti(msisdn, phone, messageid, message, keyword, time, fullreq) values($1,$2,$3,$4,$5,$6,$7)",
        [request.query.msisdn, request.query.to, request.query.messageId, request.query.text, request.query.keyword, request.query['message-timestamp'], request.url], function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { console.log('success!');
         client.end(); }
    });
  });

  response.sendStatus(200);
});

app.get('/haiti', function(request, response) {
  pg.connect(connectionString, function(err, client, done) {
    client.query('SELECT * FROM haiti', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
  console.log('Starting database on this URL: ', connectionString);
});