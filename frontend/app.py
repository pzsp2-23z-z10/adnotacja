from flask import Flask, render_template, redirect
from flask import request as rq, session, url_for
from configure import BACKEND_LINK, ANALYSIS
import requests


app = Flask(__name__)
app.secret_key = "PZSP2-z10"


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
        link = f"{BACKEND_LINK}/analysis/algorithms"
        try:
            algs = requests.get(link, timeout=60).json()
        except Exception:
            algs = None
        return render_template('upload.html', algs=algs)
    if rq.method == 'POST':
        file = rq.files['file']
        algs = rq.form.getlist('alg')
        selected_alg = {"alg": algs}
        try:
            link = f"{BACKEND_LINK}/analysis/new"
            res = requests.post(link, files={'file': (file.filename, file)},
                                data=selected_alg, timeout=60)
            token = res.json()['token']
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
    try:
        res = requests.get(f'{BACKEND_LINK}/analysis/status/{token}', timeout=60)
    except TimeoutError:
        session["err"] = "Nie można się połączyć z serwerem."
        return redirect(url_for("error"))
    if res.status_code == 200:
        try:
            data = res.json()
        except Exception:
            session['err'] = "Zły format danych. Możliwe, że dane zostały uszkodzone."
            return redirect(url_for('error'))
        print(data)
        data = data["results"]
        return render_template('status.html', data=data)
    if res.status_code == 202:
        return render_template("notyet.html")
    if res.status_code == 404:
        session['mes'] = "Zły token. Sprawdź czy na pewno podałeś poprawny token."
        return redirect(url_for("error"))
    return redirect(url_for("error"))


@app.route(f'/{ANALYSIS}/token_input')
def token_input():
    data = rq.args.get('data', None)
    return render_template("token_input.html", data=data)
