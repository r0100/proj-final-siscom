'use strict'
const fs = require('fs');
let audio_filter = [0.0261, 0.1402, 0.3337, 0.3337, 0.1402, 0.0261];

module.exports = {
    fir_filter: function(sinal, fltr_coef)
    {
        let sinal_length = sinal.length;
        let filter_order = fltr_coef.length;
        let y = 0;

        for(let i = 0; i<filter_order; i++)
            y += sinal[filter_order-i]*fltr_coef[i];

        return y;
    },

    wavreader: function(path)
    {
        let file = fs.readFileSync(path, 'base64');
        return file;
    },
    
    conv: function(sinal1, sinal2)
    {
        let sn1_length = sinal1.length;
        let sn2_length = sinal2.length;
        let y = [];
        let y_length = sinal1.length + sinal2.length;
        let dl = Math.round((y_length-sn1_length)/2);

        //formula da convolucao: u*v = y[n] = \sum_{m=0}^n u[m]v[n-m]

        for(let i = dl; i<(dl+sn1_length); i++)
        {
            let k = i-dl;
            //console.log(sn1_length-k);
            y[k] = 0;
            for(let j = 0; j<=i; j++)
            {
                if( (i-j) < 0 || (i-j)>=sn2_length)
                    y[k] += 0;
                else if(j<0 || j>=sn1_length)
                    y[k] += 0;
                else
                    y[k] += sinal1[j]*sinal2[i-j];
            }
        }

        return y;
    }
};
