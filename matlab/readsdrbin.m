%função de leitura de binários provindos direto do RTL-SDR
function output = readsdrbin(path)
  
  shiftbits = bin2dec('10000');
  raw = 0;
  id = fopen(path, 'rb');
  raw = fread(id);
  raw = raw - 127.5;
  L= round(length(raw)/2);
  iq = zeros(L, 2);
  
  %raw=raw.*transpose(exp(-j*2*pi*0.178E6*[1:1:length(y)]/2.5E6));  
  for i = 1:L
    iq(i, 1) = raw(2*i-1);
    iq(i, 2) = raw(2*i);
  end
  
  output = iq(:, 1) + sqrt(-1)*iq(:, 2);
  
end
