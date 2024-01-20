FROM python:3.13.0a3

WORKDIR /algorythm
RUN apt-get update && apt-get install -y r-base
RUN Rscript -e 'install.packages("randomForest")'
RUN Rscript -e 'install.packages("doParallel")'
RUN Rscript -e 'install.packages("foreach")'
RUN apt-get install -y git
RUN git clone --depth=1 https://github.com/raphaelleman/SPiP && mv SPiP/* .
RUN wget -O RefFiles/transcriptome_hg19.RData "https://master.dl.sourceforge.net/project/splicing-prediction-pipeline/transcriptome/transcriptome_hg19.RData?viasf=1"
RUN wget -O RefFiles/transcriptome_hg38.RData "https://master.dl.sourceforge.net/project/splicing-prediction-pipeline/transcriptome/transcriptome_hg38.RData?viasf=1"

COPY src/* ./
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


EXPOSE 6000

CMD [ "sh", "-c", "python main.py"]

