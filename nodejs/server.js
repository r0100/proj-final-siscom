'use strict'

const http = require("http");
const fs = require("fs");

const aux = require("./lib/server-auxiliary");

const HOSTNAME = '127.0.0.1';
const PORT = 8080;


const server = http.createServer((req, res)=>
{
    if(req.method==="GET")
    {
	console.log("Requisição GET recebida para " + req.url);
	res = aux.respondGet(res, req.url);
    }
    
    else if(req.method==="POST")
    {
        console.log("Requisição POST recebida");

	aux.getUsrCfg(req)
	    .then(usr_cfg =>
		  {
		      console.log(usr_cfg);
		      res = aux.sendStream(res, usr_cfg);
		  })
	    .catch(() =>
		   {
		       console.log("Erro ao obter a configuração do usuário");
		       res.statusCode = aux.ERROR_USR_CFG;
		       res.statusMessage = "Houve um erro na transmissão ou na recepção das informações."
		       res.end();

		   });        
    }
    else
    {
	console.log("ERRO DE REQUISIÇÃO!");
	res.statusCode = 405;
	res.statusMessage = "A requisição não pôde ser interpretada pois o método está incorreto";
	res.end();
    }
});

server.listen(PORT, HOSTNAME, () =>
{
    console.log(`Servidor rodando no endereço http://${HOSTNAME}:${PORT}/`);
});
