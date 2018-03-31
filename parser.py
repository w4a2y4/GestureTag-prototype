import sys
import re
import os

# usage: python parser.py <file_in>
if re.search('CalibrationLog', sys.argv[1]):
    sys.exit()

method = ''
in_path = os.path.dirname(sys.argv[1])
in_file = os.path.basename(sys.argv[1])

try:
    os.mkdir( os.path.join(in_path, 'parsed') )
except:
    pass

out_path = os.path.join(in_path, 'parsed', in_file[10:14])

fout = open(out_path, 'w')
fout.write('CompletionTime, ErrorCount, DwellSelectionCount, MouseClickCount, Size, Spacing\n')

with open(sys.argv[1]) as fp:  
    head = fp.readline()

    while head:
        tmp = head.split('\t')[1]

        # start a round
        if re.match('trial', tmp):
            try:
                method = tmp.split(' ')[3]
            except:
                head = fp.readline()
                continue
            size = tmp.split(' ')[6]
            spacing = tmp.split(' ')[8]

        # for each trial
        else:
            line = head[:-1].split('\t')
            arr = ''
            for j in range(5, 9):
                arr += line[j].split(' ')[1] + ', '
            fout.write(arr + size + ' ' + spacing)

        head = fp.readline()

os.rename(out_path, out_path + '_' + method + '.log')

