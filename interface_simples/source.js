/*TODO: simplificar funções de atualização*/

'use strict'

let onoff="off";
let vol_value="50";
let freq=(85+110)/2;
let bnd_esq=16;
let bnd_dir=16;
let dmd="nenhum";
let flt=true;

function printAll()
{
    console.log("onoff="+onoff);
    console.log("vol="+vol_value);
    console.log("frq="+freq);
    console.log("bndeq="+bnd_esq);
    console.log("bnddr="+bnd_dir);
    console.log("dmd="+dmd);
    console.log("flt="+flt);
}

function showInfoText(code, value)
{
    let text = "";
    switch(code)
    {
	case "onoff":
	text = "Status: " + ((value==="on")?"Ligado":"Desligado");
	break;
	case "vol_value":
	text = "Volume: "+value+"%";
	break;
	case "freq":
	text = "Frequência Central: "+value+"MHz";
	break;
	case "bnd_esq":
	text = "Banda Esquerda: "+value+"MHz";
	break;
	case "bnd_dir":
	text = "Banda Direita: "+value+"MHz";
	break;
	case "dmd":
	text = "Método de Demodulação: " + ((value==="nenhum")?(value[0].toUpperCase()+value.substr(1)):value.toUpperCase());
	break;
	case "flt":
	text = "Filtro anti-ruído: "+((value===true)?"Ligado":"Desligado");
	break;
	default:
	text = "ERRO!";
	break;
    }

    return text;
}

function initInfo()
{
    $("#frqshow").html(showInfoText("freq",freq));
    $("#bndeqshow").html(showInfoText("bnd_esq", bnd_esq));
    $("#bnddrshow").html(showInfoText("bnd_dir", bnd_dir));
    $("#dmdshow").html(showInfoText("dmd", dmd));
    $("#onoffshow").html(showInfoText("onoff", onoff));
    $("#volshow").html(showInfoText("vol_value", vol_value));
    $("#fltshow").html(showInfoText("flt", flt));
}

function sendServer(cond)
{
    if(cond===false)
	return;

    //$('#submit-btn').click();
    $.ajax
    ({
    	method: "POST",
    	url: "/receiver.js",
    	data: "onoff="+onoff+"&vol_value="+vol_value+"&freq="+freq+"&bnd_esq="+bnd_esq+"&bnd_dir="+bnd_dir+"&dmd="+dmd+"&flt="+flt,
    	contentType: "application/json; charset=utf-8",
    	dataType: "json",
    	async: true,
    	cache: false,
    	success: function(result){
    	    console.log("Success");
    	}
    });

}

function updateStatus(status)
{
    let text="";
    if(status==="on")
	text="Ligado";
    else if(status==="off")
	text="Desligado";
    else
	text="ERRO!";

    $('#onoffshow').html("Status: "+text);

    return status;
}

function updateVol()
{
    let text=$('#vol').val();
    $('#volshow').html("Volume: "+text+'%');
    return text;
}

function updateFrq(id)
{
    let text = "";
    if(id==="frq")
	text="Frequência Central: ";
    else if(id==="bndeq")
	text="Banda Esquerda: ";
    else if(id==="bnddr")
	text="Banda Direita: ";
    else
	text="ERRO!";

    let frq_text=$('#'+id).val();
    $('#'+id+'show').html(text+frq_text+'MHz');
    return frq_text;
}

function updateDemod(dmd_code)
{
    let text = "";

    switch(dmd_code)
    {
	case "nenhum":
	text="Nenhum";
	break;
	case "am":
	text="AM";
	break;
	case "fm":
	text="FM";
	break;
	case "lsb":
	text="LSB";
	break;
	case "usb":
	text="USB";
	break;
	default:
	text="ERRO!";
	break;
    }
    $('#dmdshow').html('Método de Demodulação: '+text);

    return dmd_code;
}

function updateFilt(flt_atv)
{
    let text = "";
    if(flt_atv===true)
	text="Ativado";
    else
	text="Desativado";

    $('#fltshow').html('Filtro anti-ruído: '+text);

    return flt_atv;
}
