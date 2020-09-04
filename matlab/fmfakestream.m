%este código é um simulacro de uma stream de áudio, ele pega um pedaço
%de um arquivo de áudio, demodula-o e toca-o. No meio tempo a operação
%é repetida para uma nova amostra e espera-se o fim do áudio anterior
%para tocar o novo, repetindo-e o processo até o fim
clear; clc;
on = 1;
buffer_time = 0.2; %segundos
fs = 150E3;
samples = buffer_time*fs;
audio = 0;
max_size = 2197504;
sample_window = [1, samples];
rec = 0;
step_sound = 2*samples;
k = step_sound;

demod_type = 2; 
%0->puro (padrão)
%1->AM
%2->FM
%3->LSB
%4->USB

%para otimização do código, os filtros passa-baixa e diferenciador
%são calculados antes do stream
a = 1;
fc = fs/4;
b_fm = firls(30,[0 .9],[0 1],'differentiator'); %design differentiater 
b_lp = fir1(5, 16000/fs);
b_lsb = fir1(2, (fc+1000)/fs);
b_usb = fir1(2, (fc+18000)/fs);

audio_file = readsdrwav('RadioArgentina.wav', 0);
disp('Iniciando');
%o ritmo em que os áudios são tocados é regulado pelas funções
%tic e toc do matlab que calculam o tempo decorrido a chamada
%de tic e a chamada de toc
tic;
while(on) 
    buffer = audio_file(sample_window(1):sample_window(2), 1);
    
    if(demod_type == 1)
        rec = AM_IQ_Demod(buffer, b_lp);
    elseif(demod_type ==2)
        rec = FM_IQ_Demod(buffer, b_fm, b_lp);
    elseif(demod_type == 3)
        rec = LSB_IQ_Demod(buffer, b_lsb, b_lp);
    elseif(demod_type == 4)
        rec = USB_IQ_Demod(buffer, b_usb, b_lp);
    else
        rec = real(buffer)+imag(buffer);
    end
        
    audio = [audio; rec];
    sample_window = sample_window + samples; 
    
    if(sample_window(1)<=k && sample_window(2)>=k)
        time = toc;
        if(time < step_sound/fs)
            %disp('waiting...');
            pause((step_sound/fs-time)*0.9);
        end
        sound(audio, fs);
        tic;
        audio = 0;
        k = k+step_sound;
    end
    
    if(sample_window(2)>max_size)
        %disp('resetting');
        sample_window = [1, samples];
        k = step_sound;
    end
end
