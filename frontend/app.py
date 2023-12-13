from flask import Flask, render_template, redirect
from flask import request as rq, session, url_for
from configure import PORT, HOST, BACKEND_LINK, ANALYSIS
import requests
from datetime import timedelta
import parse_data
import vcf


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
        try:
            link = f"{BACKEND_LINK}/analysis/new"
            token = requests.post(link, files={'file': file}).json()['token']
            return redirect(url_for('uploaded', token=token))
        except Exception:
            session['err'] = 'Zły format danych lub mogły zostać uszkodzone'
            return redirect(url_for('error'))


@app.route(f'/{ANALYSIS}/added')
def uploaded():
    token = rq.args.get('token', None)
    return render_template('uploaded.html', token=token)


@app.route('/error', methods=['GET'])
def error():
    mes = session.pop('mes', None)
    err = session.pop('err', None)
    return render_template('error.html', mes=mes, err=err)


@app.route(f'/{ANALYSIS}/status', methods=['GET'])
@requires_token
def status(token):
    res = requests.get(f'{BACKEND_LINK}/analysis/status/{token}')
    if res.status_code == 200:
        try:
            data = res.json()
        except Exception:
            session['err'] = "Zły format danych. Możliwe, że dane zostały uszkodzone."
            return redirect(url_for('error'))
        if isinstance(data, dict):
            data = [data]
        return render_template('status.html', data=data)
    elif res.status_code == 202:
        return render_template("notyet.html")
    elif res.status_code == 404:
        session['mes'] = "Dane nie są jeszcze gotowe"
        return redirect(url_for("error"))
    return redirect(url_for("error"))


@app.route(f'/{ANALYSIS}/token_input')
def token_input():
    data = rq.args.get('data', None)
    
    return render_template("token_input.html", data=data)


if __name__ == "__main__":
    app.run(host=HOST, port=PORT)
