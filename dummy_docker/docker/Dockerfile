FROM python:3.11.3

COPY src/* /
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 5000

CMD [ "sh", "-c", "python main.py"]

