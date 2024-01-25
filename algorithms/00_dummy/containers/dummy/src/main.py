#!/bin/env python

import json
from flask import Flask, jsonify, request
import os

print("out.vcf exists?:",os.path.isfile('out.vcf'))

API_PREFIX = "/api/"
app = Flask(__name__)
@app.route(API_PREFIX + "status", methods=["GET"])
def status():
    # check if output file has been created by program, then return it
    try:
        f = open('out.vcf')
    except FileNotFoundError:
        return {"done":False}
    
    with f:
        lines = f.readlines()
    return {"done":True,"result":lines}


@app.route(API_PREFIX + "calculateStuff", methods=["POST"])
def calculateStuff():
    record = json.loads(request.data)
    # can do some quick file checks here, or just pass to alg
    if all("#CHROM" not in r for r in record):
        return {"error":"missing header"},400

    return {"status":"ok"}


if __name__ == "__main__":
    app.run(port=6000)
