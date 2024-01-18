import requests

url = "http://localhost:1234/analysis"

def test_status():
	json_data = requests.post(url+"/new", files={'file': ('nazwa','zawartosc')}, data={"alg":"pangolin"}).json()
	assert 'token' in json_data

	res = requests.get(url+"/status/"+str(json_data['token']))

	assert res.status_code in (200,202) # either ready, or in progress

def test_missing_params():
	result = requests.post(url+"/new", files={'file': ('nazwa','zawartosc')})
	assert result.status_code == 400 

def test_status_no_token():
	assert requests.get(url+"/status/").status_code == 500

# def test_status_invalid_token():
# 	assert requests.get(url+"/status/nonsense").status_code == 404