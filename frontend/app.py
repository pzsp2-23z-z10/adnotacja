from flask import Flask, render_template, redirect
from flask import request as rq, session, url_for
from configure import PORT, HOST, BACKEND_LINK
import requests
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
            try:
                data = parse_data.read_file(file)
                link = f"{BACKEND_LINK}/analysis/new"
                token = requests.post(link, json=data).json()['token']
            except Exception as e:
                return redirect(url_for('error'))
            return redirect(url_for('uploaded', token=token))
        return redirect('index')


@app.route('/analysis/added')
def uploaded():
    token = rq.args.get('token', None)
    return render_template('uploaded.html', token=token)


@app.route('/error', methods=['GET'])
def error():
    return render_template('error.html')


@app.route('/analysis/status', methods=['GET'])
def status():
    return render_template('dashboard.html')


if __name__ == "__main__":
    app.run(host=HOST, port=PORT)
