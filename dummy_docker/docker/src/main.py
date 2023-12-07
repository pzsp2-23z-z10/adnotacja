#!/bin/env python

import json
from flask import Flask, jsonify, request

API_PREFIX = "/api/"
app = Flask(__name__)


@app.route(API_PREFIX + "calculateStuff", methods=["POST"])
def calculateStuff():
    #record = json.loads(request.data)
    return jsonify({"result":{"statistic1":123,"statistic2":456}})


if __name__ == "__main__":
    app.run()
