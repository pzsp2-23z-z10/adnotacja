import app
from configure import PORT, HOST


if __name__ == "__main__":
    app.app.run(host=HOST, port=PORT)
