%This function demodualtes an FM signal. It is assumed that the FM signal
%is complex (i.e. an IQ signal) centered at DC and occupies less than 90%
%of total bandwidth. 

function [y_FM_demodulated] = FM_IQ_Demod(y)
    %b = firls(30,[0 .9],[0 1],'differentiator'); %design differentiater 
    d=y./abs(y);%normalize the amplitude (i.e. remove amplitude variations) 
    rd=real(d); %real part of normalized siganl. 
    id=imag(d); %imaginary part of normalized signal. 
    drd = diff([0; rd]')';
    did = diff([0; id]')';
    %y_FM_demodulated=(rd.*conv(id,b,'same')-id.*conv(rd,b,'same'))./(rd.^2+id.^2); %demodulate
    y_FM_demodulated=(rd.*did - id.*drd)./(rd.^2+id.^2);
end