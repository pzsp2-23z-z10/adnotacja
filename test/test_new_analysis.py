import requests

url = "http://localhost:1234/analysis"

def test_new_analysis():
	res = requests.post(url+"/new", files={'losowa_nazwa_parametru_nie_wazne': ('nazwa_pliku','zawartosc')}, data={"alg":"pangolin"})
	assert res.status_code == 200
	assert 'token' in res.json()

def test_new_analysis_no_file():
	res = requests.post(url+"/new")
	assert res.status_code == 400

test_new_analysis()