FROM python:3.11.3

WORKDIR /algorythm
COPY src/* ./
COPY requirements.txt ./
RUN apt-get update && apt-get install -y git
RUN git clone --depth=1 https://github.com/tkzeng/Pangolin.git && mv Pangolin/* .
RUN pip3 install pip==23.0.1
RUN pip3 install setuptools==56.0.0
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install .
RUN wget https://www.dropbox.com/sh/6zo0aegoalvgd9f/AAA9Q90Pi1UqSzX99R_NM803a/gencode.v38lift37.annotation.db
# RUN python scripts/create_db.py gencode.v38lift37.annotation.db

EXPOSE 5000

CMD [ "sh", "-c", "python main.py"]

