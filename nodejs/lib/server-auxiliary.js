'use strict'

const http = require("http");
const fs = require("fs");


const HTML = "./interface/index.html"; //diretório do arquivo html da interface
const CSS = "./interface/style.css"; //diretório do arquivo css da interface
const SOURCE = "./interface/source.js"; //diretório do código javascript da interface
const FAVICON = "./interface/favicon.ico"; //diretório do ícone

const SUCCESS = 200; //código padrão do http para sucesso
const ERROR = 500; //código padrão do http para um erro do servidor
const ERROR_USR_CFG = 422; //código padrão do http para entidades que não puderam ser processadas

const BAD_USR_CFG = -1; //caso a configuração do usuário não pôde ter sido decodificada,
                        //esta será a saída como um valor de erro

module.exports =
{
    //constantes
    SUCCESS: SUCCESS,
    ERROR: ERROR,
    ERROR_USR_CFG: ERROR_USR_CFG,
    BAD_USR_CFG: BAD_USR_CFG,

    //funções    
    extractPost: extractPost,
    respondGet: respondGet,
    getUsrCfg: getUsrCfg,
    sendStream: sendStream
}


function extractPost(req)
{
    let promise = new Promise((resolve, reject) => {
        let body_str = "";
        req.on('data', (chunk) =>
	{
	    //console.log(chunk.toString());
	    body_str += chunk.toString();
	})
	.on('end', () =>
	{
	    console.log("Dados extraídos da requisição");
	    if(body_str!=="")
	        resolve(body_str);
	    else
                reject("ERRO EM EXTRACTPOST!");
	});
    })

    return promise;
}

function respondGet(response, url)
{
    let res = response;
    switch(url)
    {
        case "/style.css":
        res.writeHead(SUCCESS, {"Content-Type": "text/css"});
        res.write(fs.readFileSync(CSS));
        break;
        case "/source.js":
        res.writeHead(SUCCESS, {"Content-Type": "text/javascript"});
        res.write(fs.readFileSync(SOURCE));
        break;
        case "/favicon.ico":
        res.writeHead(SUCCESS, {"Content-Type": "image/jpg"});
        res.write(fs.readFileSync(FAVICON));
        break;
        default:
        res.writeHead(SUCCESS, {"Content-Type": "text/html"});
        res.write(fs.readFileSync(HTML));
        break;
    }
    res.end();

    return res;
}

function getUsrCfg(req)
{
    const promise = new Promise((resolve, reject) =>
    {
        extractPost(req)
        .then(body_str =>
	{
	    let body = JSON.parse(body_str);
	    //console.log("body string = "+body_str);
	    //console.log(body);

	    console.log("Sucesso ao obter a configuração do usuário")
	    resolve(body);
	})
	.catch(err =>
	{
	    console.log("ERRO EM GETUSRCFG!");
	    //console.log(err);
	    console.log("Erro ao obter a configuração do usuário")
	    reject(BAD_USR_CFG);
	});  
    })

    return promise;
}

function sendStream(request, usr_cfg)
{
    let res = request;

    res.end();
    return res;
}