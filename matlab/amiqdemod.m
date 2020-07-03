function [y] = amiqdemod(x, b)
    %b = fir1(5, 18000/fs);
    %a = 1;
    y = abs(x);
    y = filter(b, 1, y);
    y = detrend(y);
end