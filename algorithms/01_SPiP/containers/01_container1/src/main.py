#!/bin/env python

import json
from flask import Flask, jsonify, request
import os
import subprocess
import sys

print("out.vcf exists:",os.path.isfile('out.vcf'))
if os.path.isfile('out.vcf'):
    os.remove('out.vcf')

process = None

API_PREFIX = "/api/"
app = Flask(__name__)
@app.route(API_PREFIX + "status", methods=["GET"])
def status():
    print("!!status")
    # check if program terminated (and if it started at all)
    if process is None:
        print("Process has never started")
        sys.stdout.flush()
        return {"done":False}
    if process.poll() is None:
        print("process not finished:",process)
        sys.stdout.flush()
        return {"done":False}
    if process.returncode is None:
        print("Process has no return code:",process)
        sys.stdout.flush()
        return {"done":False}
    print("Process finished:",process)
    sys.stdout.flush()
    # check if output file has been created by program, then return it
    try:
        f = open('out.vcf')
    except FileNotFoundError:
        return {"done":False}
    
    with f:
        lines = f.readlines()
    os.remove('out.vcf')
    print("RESUTLS SENT")
    sys.stdout.flush()
    return {"done":True,"result":lines}


@app.route(API_PREFIX + "calculateStuff", methods=["POST"])
def calculateStuff():
    print("!!calculateStuff")
    global process
    vcf = json.loads(request.data)
    # can do some quick file checks here, or just pass to alg
    if all("#CHROM" not in r for r in vcf):
        return {"error":"missing header"},400

    vcf = map(lambda x: x + '\n', vcf)
    with open('in.vcf', 'w') as f:
        f.writelines(vcf)

    command = "Rscript SPiPv2.1_main.r -I in.vcf -O out.vcf"
    print("running command:",command)
    process = subprocess.Popen(command, shell=True)
    return {"status":"ok"}


if __name__ == "__main__":
    app.run()
