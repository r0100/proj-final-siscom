function [y] = USB_IQ_Demod(x, b1, b2)
    y = 0;
    %b1 = fir1(2, (fc+18000)/fs);
    y = filter(b1, 1, x);
    y = y./abs(y);
    y = real(y) + imag(hilbert(imag(y)));
    %b2 = fir1(2, 18000/fs);
    y = filter(b2, 1, y);
end