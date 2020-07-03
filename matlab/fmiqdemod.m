%feito com base no código de Aarom Scher
%www.aaronscher.com/wireless_com_SDR/RTL_SDR_AM_spectrum_demod.html
function [y] = FM_IQ_Demod(x, b1, b2)
    %b = firls(30,[0 .9],[0 1],'differentiator'); %filtro que imita uma derivada    

    %d=x./abs(x);%normalize the amplitude (i.e. remove amplitude variations) 

    i=real(x); 
    q=imag(x);

    y=(i.*conv(q,b1,'same')-q.*conv(i,b1,'same'))./(i.^2+q.^2); %demodulate!
    y = filter(b2, 1, y);
end
