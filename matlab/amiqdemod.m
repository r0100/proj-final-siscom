function [y] = amiqdemod(x, b)
    %as duas linhs abaixo são a geração do filtro que não é mais feita aqui
    %para fazer o código de stream inicial feito aqui
    %b = fir1(5, 18000/fs);
    %a = 1;

    %a demodulação é feita tirando-se o módulo da amostra IQ, passando-se um filtro
    %passa-baixa e retirando o offset sobre o resultado, restando um sinal de áudio
    y = abs(x);
    y = filter(b, 1, y);
    y = detrend(y);
end
