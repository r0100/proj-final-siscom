'use strict'

const http = require("http");
//const util = require("util");
const fs = require("fs");

const HOSTNAME = '127.0.0.1';
const PORT = 8080;

const HTML = "./index.html";
const CSS = "./style.css";
const SOURCE = "./source.js";
const FAVICON = "./favicon.ico";


///////////////////////////////////////////////////
//Funções diversas:

function extractPost(req)
{
    let promise = new Promise((resolve, reject) => {
        let body_str = "";
        req.on('data', (chunk) =>
        {
            //console.log(chunk.toString());
            body_str += chunk.toString();
        });
        //sim, isto é uma gambiarra muito feia, eu não me orgulho desse código
        setTimeout( () =>
        {
            if(body_str!=="")
                resolve(body_str);
            else
                reject("ERRO!");
        }, 0);
    })

    return promise;
}
///////////////////////////////////////////////////

const server = http.createServer((req, res)=>
{
    if(req.method==="GET")
    {
        console.log("GET request received for " + req.url);
        switch(req.url)
        {
          	case "/style.css":
          	res.writeHead(200, {"Content-Type": "text/css"});
          	res.write(fs.readFileSync(CSS));
          	break;
          	case "/source.js":
          	res.writeHead(200, {"Content-Type": "text/javascript"});
          	res.write(fs.readFileSync(SOURCE));
          	break;
          	case "/favicon.ico":
          	res.writeHead(200, {"Content-Type": "image/jpg"});
          	res.write(fs.readFileSync(FAVICON));
          	break;
          	default:
          	res.writeHead(200, {"Content-Type": "text/html"});
          	res.write(fs.readFileSync(HTML));
          	break;
        }
        res.end();
    }
    else if(req.method==="POST")
    {
        console.log("POST request received");
        extractPost(req)
        .then(
            function(body_str)
		        {
                console.log("body string = "+body_str);
                let body = JSON.parse(body_str);
                return body;
            })
        .then(body => console.log(body))
        .catch(err => console.log("ERRO!"));

        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/text');
        res.setHeader('sucess', true);
        res.end('Data received');
    }
        res.end();
})
server.listen(PORT, HOSTNAME, () =>
{
    console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
