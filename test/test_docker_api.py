import requests

# paste url of a dockerized alghoritm to verify if data returned is correct
# will trigger calculations!!!
url = "http://localhost:5000"

def test_init_calc():
	test_file = ['#CHROM\tPOS\tID\tREF\tALT\tQUAL\tFILTER\tINFO', 'chr17\t41276135\t.\tTTAA\tGTCT\t.\t.\t.']
	response = requests.post(url+"/api/calculateStuff", json=test_file)
	assert response.status_code==200
	json_data = response.json()
	assert json_data['status']=="ok"
	
def test_invalid_file():
	test_file = ['apples\tbananastoranges','1\t2\t3']
	response = requests.post(url+"/api/calculateStuff", json=test_file)
	assert response.status_code==400
	
def test_status():
	assert requests.get(url+"/api/status").status_code == 200

# def test_status_invalid_token():
# 	assert requests.get(url+"/status/nonsense").status_code == 404

test_status()
