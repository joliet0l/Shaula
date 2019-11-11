import argparse
import codecs
import re
import sys
import unicodedata
from distutils.util import strtobool

import chardet

reTitle = re.compile(r"\s*第([0-9一二三四五六七八九十百千万零]{1,9})[章节卷集部篇回]\s*(.{1,16})$")
ChEndPun=("”", "。", "！", "？", "」", "』")

def get_title(s):
    sno   = ""
    sname = ""
    m = reTitle.search(s)
    if m:
        if m.start(0) < 16:
            sno   = m.group(1)
            sname = m.group(2)
        else:
            print("maybe not a title")

    return (sno, sname.strip())




def str_escape(s):
    s = s.replace('\\\\', '\\')
    s = s.replace('\\\'', '\'')
    s = s.replace('\\"', '"')
    s = s.replace('\\n', '\n')
    s = s.replace('\\r', '\r')
    s = s.replace('\\t', '\t')
    s = s.replace('\\0', '')
    return s


def parse_text(slist):
    stxt = ""
    lines = len(slist)
    slnew = []

    sl = ""
    ss = ""
    for s in slist:
        sl = s.strip()
        sno, sname = get_title(sl)
        if(len(sno) > 0):
            ss = "第%s章 %s\n\n" % (sno, sname)
            print(ss)
            slnew.append(ss)
            continue
        # content
        if len(sl) == 0:
            continue

        endchar = sl[-1]
        if endchar in ChEndPun:
            stxt = stxt + sl + "\n"
            slnew.append(stxt)
            stxt = ""
        else:
            stxt = stxt + sl

    return "  ".join(slnew)


'''
    parse the arguments
'''
parser = argparse.ArgumentParser()
parser.add_argument(
    '-i',
    '--in_filename',
    type=str,
    default='',
    help='input filename, use stdin if omitted')

parser.add_argument(
    '-o',
    '--out_filename',
    type=str,
    default='',
    help='output filename, use stdout if omitted')

# Export parameters to global namespace
args = parser.parse_args()
for key in sorted(vars(args)):
    globals()[key] = getattr(args, key)


if __name__ == '__main__':
    if in_filename:
        # detect the charset of the input file
        with open(in_filename, 'rb') as f:
            raw = f.read()
        in_encoding = chardet.detect(raw)['encoding']
        print("Open the file: %s with the encoding [%s]" % (in_filename, in_encoding))
        #open the file with the charset
        with codecs.open(in_filename, 'r', in_encoding) as f:
            s = f.readlines()
    else:
        print("MUST give the input file!\n")
        sys.exit(-1)


    s = parse_text(s)


    if out_filename:
        with codecs.open(out_filename, 'w', 'utf-8') as g:
            g.write(s)
    else:
        print(s)