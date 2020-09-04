function [y] = lsbiqdemod(x, b1, b2)
    %o processo de demodulação LSB que encontramos em nossas pesquisas consiste de 
    %subtrair a parte real das amostras (a parte I) e a parte imaginária (Q), seguido
    %de um filtro passa-baixa
    %como é uma operação bastante simples, tomamos a liberdade de realizar a regulação da
    %amplitude que foi cortada da demodulação FM e AM    
    y = 0;
    y = y./abs(y);
    y = real(y) - imag(y);
    %b2 = fir1(2, 18000/fs);
    y = filter(b2, 1, y);
end
