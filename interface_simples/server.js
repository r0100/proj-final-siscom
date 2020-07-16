'use strict'

const http = require("http");
//const util = require("util");
const fs = require("fs");

const HOSTNAME = '127.0.0.1';
const PORT = 8080;

let html = fs.readFileSync("./index.html");
let css = fs.readFileSync("./style.css");
let source = fs.readFileSync("./source.js")

///////////////////////////////////////////////////
//Funções diversas:

function parseBody(body_str)
{
    let div_str = body_str.split("&");
    //console.log("argument body_str = " + body_str)
    //console.log("div_str = " + div_str);
    let out_obj = {};
    //o código para quebrar as strings está estranho, mas funciona
    for(let i = 0; i<div_str.length; i++)
    {
        let aux2 = "";
        if(div_str[i]==="")
            continue;

        let aux = div_str[i].split("=");
        aux[1] = aux[1].split("+");

        for(let j = 0; j<aux[1].length; j++)
        {
            if(j>0)
                aux2+=" ";
            aux2+=aux[1][j];
        }

        //console.log(aux2);
        out_obj[aux[0]]=aux2;
        //console.log(out_obj);
    }


    return out_obj;
}

function extractPost(req)
{
    let promise = new Promise((resolve, reject) => {
        let body_str = "";
        req.on('data', (chunk) =>
        {
            //console.log(chunk.toString());
<<<<<<< HEAD
            body_str += chunk.toString();
=======
            body_str += chunk.toString() + "&";
>>>>>>> ea14f2cd75aff882f96e4aa7e764521924b54a6c
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
          	res.write(css);
          	break;
          	case "/source.js":
          	res.writeHead(200, {"Content-Type": "text/javascript"});
          	res.write(source);
          	break;
          	default:
          	res.writeHead(200, {"Content-Type": "text/html"});
          	res.write(html);
          	break;
        }
    }
    else if(req.method==="POST")
    {
        console.log("POST request received");
        extractPost(req)
<<<<<<< HEAD
            .then(	
            function(body_str)
		{
                console.log("body string = "+body_str);

                let body = JSON.parse(body_str);/*parseBody(body_str);*/
=======
        .then(
            function(body_str)
            {
                //console.log("body string = "+body_str);

                let body = parseBody(body_str);
>>>>>>> ea14f2cd75aff882f96e4aa7e764521924b54a6c
                return body;
            }
        )
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
