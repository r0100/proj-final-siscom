function output= readsdrwav(path, sample_window)
if(sample_window <= 0)
    raw = audioread(path);
else
    raw = audioread(path, sample_window);
end
  output = raw(:, 1) + j*raw(:, 2);
end