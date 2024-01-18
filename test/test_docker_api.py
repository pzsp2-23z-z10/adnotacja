import requests

# paste url of a dockerized alghoritm to verify if data returned is correct
# will trigger calculations!!!
url = "http://localhost:1234/analysis"

def test_init_calc():
	json_data = requests.post(url+"/new", data={[]}).json()
	assert 'status' in json_data
	
def test_status_no_token():
	assert requests.get(url+"/status/").status_code == 500

# def test_status_invalid_token():
# 	assert requests.get(url+"/status/nonsense").status_code == 404