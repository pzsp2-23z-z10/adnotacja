from flask import Flask, render_template, redirect
from flask import request as rq, session, url_for
from configure import PORT, HOST, BACKEND_LINK, ANALYSIS
import requests
from datetime import timedelta
import parse_data


app = Flask(__name__)
app.secret_key = 'Bruhuhuhuhu64'
app.permanent_session_lifetime = timedelta(seconds=60)


def requires_token(view_func):
    def wrapper():
        token = rq.args.get('token', None)
        if not token:
            return redirect(url_for('token_input'))
        return view_func(token)
    return wrapper

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')


@app.route(f'/{ANALYSIS}/add', methods=['GET', 'POST'])
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


@app.route(f'/{ANALYSIS}/added')
def uploaded():
    token = rq.args.get('token', None)
    return render_template('uploaded.html', token=token)


@app.route('/error', methods=['GET'])
def error():
    return render_template('error.html')


@app.route(f'/{ANALYSIS}/status', methods=['GET'])
@requires_token
def status(token):
    res = requests.get(f'{BACKEND_LINK}/analysis/status/{token}')
    try:
        data = res.json()
    except Exception:
        return redirect(url_for('error'))
    if res.status_code == 500:
        return redirect(url_for('error'))
    elif res.status_code == 200:
        if isinstance(data, dict):
            data = [data]
        return render_template('status.html', data=data)


@app.route(f'/{ANALYSIS}/token_input')
def token_input():
    return render_template("token_input.html")


if __name__ == "__main__":
    app.run(host=HOST, port=PORT)
