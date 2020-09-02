%test routine
clear; clc;
pkg load signal

file = './raw.dat';
fssdr = 2.5E6;
fsdmd = 240E3;
%fs = 44.1E3;
fs = 44.1E3;
raw_data = loadFile(file);

%implementar isso no javascript, tira todo o ruído
shifted_data=raw_data.*transpose(exp(-j*2*pi*0.178E6*[1:1:length(raw_data)]/2.5E6));
%shifted_data = raw_data;
clear raw_data;
dec_shifted_data = decimate(shifted_data,round(fssdr/fsdmd),'fir'); 
clear shifted_data;
dmd_signal = FM_IQ_Demod(dec_shifted_data);
clear dec_shifted_data;
%audio_signal = decimate(dmd_signal,round(fsdmd/fs),'fir');
audio_signal = dmd_signal;
clear dmd_signal;
sound(audio_signal,fs);
%audiowrite('./aaron_dmd.wav', audio_signal, fs);