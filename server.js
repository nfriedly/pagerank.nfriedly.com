var cluster = require('cluster');
var numCPUs = require('os').cpus().length;


if (cluster.isMaster) {

    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker /*, code, signal*/ ) {
        console.log('worker ' + worker.process.pid + ' died');
        cluster.fork();
    });

} else {
    var app = require('./pr-app.js');
    var port = process.env.PORT || 3000;
    app.listen(port);
    console.log('PageRank server with pid ' + process.pid + ' listening on port ' + port);
}
