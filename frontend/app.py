from flask import Flask, render_template
from configure import PORT, HOST
import requests


app = Flask(__name__)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


if __name__ == "__main__":
    app.run(host=HOST, port=PORT)
