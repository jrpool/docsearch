// Load HTTP module.
const http = require("http");

// Use it to create an HTTP server and listen on port 8000 for requests.
http.createServer(
  (request, response) => {
    /*
      Define the response HTTP header with HTTP status 200 and Content type
      text/plain.
    */
    response.writeHead(200, {'Content-Type': 'text/plain'});
    // Send a response.
    response.end(
      'This is a pure-node web server and website.\n'
      + 'It is running at http://127.0.0.1:8000/.\n'
    );
  }
).listen(8000);

// Confirm to the console.
console.log('Running.');
