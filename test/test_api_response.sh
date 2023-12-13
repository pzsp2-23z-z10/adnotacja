RES="$(curl --request POST localhost:1234/analysis/new -d 'dane')"

if ! [[ "$RES" == *"token"* ]]; then
	echo "Fail: didn't receive token"
fi

token=$(echo "$RES" | grep -oP '":([^"}]*)')

RES2="$(curl localhost:1234/analysis/status/$token)"

echo $token
echo $RES2
echo "Test passed"
