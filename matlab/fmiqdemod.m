%feito com base no código de Aarom Scher
%www.aaronscher.com/wireless_com_SDR/RTL_SDR_AM_spectrum_demod.html
function [y] = FM_IQ_Demod(x, b1, b2)
    %o filtro abaixo é um filtro fir que imita uma derivada, usado na fórmula de
    %demodulação FM em amostras IQ (y = (i*(dq/dt) - q*(di/dt))/(i^2 + q^2)
    %o mesmo pode ser obtido com a derivada diretamente (o valor menos o anterior),
    %mas fizemos com este filtro seguindo o exemplo do Aaron citado acima
    %b = firls(30,[0 .9],[0 1],'differentiator'); %filtro que imita uma derivada    

    %regulação da amplitude para qeu fique sempre um valor unitário, isso causa
    %uma melhora no som tocado, mas não é tão necessário e foi cortado aqui
    %d=x./abs(x);%normalize the amplitude (i.e. remove amplitude variations) 

    i=real(x); 
    q=imag(x);

    %demodulação propriamente dita, conforme a fórmula descrita acima, com
    %a adição de um filtro passa-baixa
    y=(i.*conv(q,b1,'same')-q.*conv(i,b1,'same'))./(i.^2+q.^2);
    y = filter(b2, 1, y);
end
