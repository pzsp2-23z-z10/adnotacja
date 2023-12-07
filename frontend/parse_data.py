import mimetypes
from werkzeug.datastructures import FileStorage


def is_text_file(file: FileStorage):
    mime_type, _ = mimetypes.guess_type(file.filename)
    return mime_type and mime_type.startswith('text')


def read_file(file: FileStorage):
    headers = [i.lower() for i in file.stream.readline().decode('utf-8').split()]
    allowed_headers = ['chr', 'pos', 'ref', 'alt']
    idx = [headers.index(j) for j in allowed_headers]
    data = []
    for line in file.stream.readlines():
        line = line.decode('utf-8').split()
        dic = {}
        for i, header in enumerate(allowed_headers):
            dic[header] = line[idx[i]]
        data.append(dic)
    return data
