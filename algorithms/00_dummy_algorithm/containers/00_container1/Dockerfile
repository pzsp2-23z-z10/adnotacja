FROM python:3.11.3

WORKDIR /algorythm
COPY src/* ./
COPY requirements.txt ./
RUN apt-get update && apt-get install -y git
RUN git clone --depth=1 https://github.com/tkzeng/Pangolin.git && mv Pangolin/* .
RUN pip3 install pip==23.0.1
RUN pip3 install setuptools==56.0.0
RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 5000

CMD [ "sh", "-c", "python main.py"]

