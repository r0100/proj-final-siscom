function [y] = USB_IQ_Demod(x, b1, b2)
    %a demodulação USB é análoga à LSB, apenas com a troca da soma por uma subtração
    %da mesma forma, colocamos a regulação de amplitude
    y = 0;
    y = y./abs(y);
    y = real(y) + imag(y);
    %b2 = fir1(2, 18000/fs);
    y = filter(b2, 1, y);
end
