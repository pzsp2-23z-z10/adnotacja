#!/bin/env python

import json
from flask import Flask, jsonify, request

API_PREFIX = "/api/"
app = Flask(__name__)
@app.route(API_PREFIX + "status", methods=["GET"])
def status():
    return {"done":True}


@app.route(API_PREFIX + "calculateStuff", methods=["POST"])
def calculateStuff():
    #record = json.loads(request.data)
    return jsonify({"id":123,
  "Wyniki":[
    {"name":"SPiP","result":[{
      "CHROM": "chr1",
      "POS": 15765825,
      "ID": "NM_007272:g.15765825:G>A",
      "REF": "G",
      "ALT": "A",
      "QUAL": ".",
      "FILTER": ".",
      "INFO": "SPiP=A|NTR|00.04 % [00.02 % ; 00.08%]|+|substitution|G>A|Intron 1 (1795)|NM_007272|CTRC|donor|825|DeepIntron|0|Outside SPiCE Interpretation|0|No|NA|15765816|Acc|0.00206159394907144|No|Don|15765000|816|15765816|0.00161527498798199|No|15766795|0.0775463330795674|Yes|0.0775463330795674|Yes"
  }]}
]})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port="6000")
