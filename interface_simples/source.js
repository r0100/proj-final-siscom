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

function sendServer(cond)
{
    if(cond===true)
	$('#submit-btn').click();
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
