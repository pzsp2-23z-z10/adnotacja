from flask import Flask, render_template, redirect
from flask import request as rq, session, url_for
from configure import PORT, HOST, BACKEND_PORT
import requests
from uuid import uuid4
from datetime import timedelta
import parse_data


app = Flask(__name__)
app.secret_key = 'Bruhuhuhuhu64'
app.permanent_session_lifetime = timedelta(seconds=60)


@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route('/analysis/add', methods=['GET', 'POST'])
def add():
    if rq.method == 'GET':
        return render_template('upload.html')
    elif rq.method == 'POST':
        file = rq.files['file']
        if parse_data.is_text_file(file):
            data = parse_data.read_file(file)
            try:
                link = f"http://{HOST}:{BACKEND_PORT}/analysis/new"
                token = requests.post(link, json=data).json()['token']
            except Exception as e:
                token = None
        return render_template('uploaded.html', token=token)


@app.route('/analysis/status', methods=['GET'])
def status():
    return render_template('dashboard.html')


if __name__ == "__main__":
    app.run(host=HOST, port=PORT)
