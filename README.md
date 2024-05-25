#

npm install electron@25.1.1
npm install electron-builder@22.10.5
npm install electron-log@4.4.8
npm install fs-extra@11.2.0
npm run build:linux


conda create -n HantaCon -c conda-forge python==3.10 bioconda::bcftools==1.17 bioconda::bedtools==2.31.0 bioconda::htslib==1.17 bioconda::minimap2==2.26 bioconda::samtools==1.17 bioconda::seqkit==2.4.0 bioconda::k8==0.2.5 bioconda::vcfpy==0.13.6
pip install medaka==1.7.3
pip install medaka-cpu==1.7.3

"desktop": {
        "Icon": "img/256x256.png"
      }t


~/HantaCon/ref/HTNV_76-118/HTNV_76-118_L.fasta
readlink -f ~/HantaCon/HTNV_L.fasta



#
리눅스를 설치한다
 sudo apt install git-all #git install
   ssh-keygen -t rsa -b 4096 -C "Songlab" #SSH key generation
   cat ~/.ssh/id_rsa.pub  #idnetification of key
   깃허브가서 키 등록? 
   git clone git@github.com:KU-MV/HantaCon.git #pull key
   
   Anaconda 설치
   1. 설치 파일다운로드
   2. 설치 파일 실행 bash Anaconda3-2019.10-Linux-x86_64.sh
   
sudo apt-get install openjdk=17-jdk # java 설치
curl -s https://get.nextflow.io | bash # 넥스플로우 설치
chmod +x nextflow
sudo mv nextflow /usr/local/bin



sudo apt-get install -y libz-dev
sudo apt-get install -y libncurses-dev
sudo apt-get install -y liblzma-dev
sudo apt-get install -y libbz2-dev
sudo apt-get install -y libcurl4-gnutls-dev

https://www.htslib.org/download/
#위에 다운로드하고 압축을 풀고,
cd samtools-1.x    # and similarly for bcftools and htslib (위와 비슷한 방법으로 설치)
make
sudo make install

https://bedtools.readthedocs.io/en/latest/content/installation.html
sudo apt-get install -y bedtools
sudo apt-get install -y minimap2


#python 3.7 정도 버전 필요
medaka
pip install medaka
pip install medaka-cpu

conda create -n env_name python=3.7
conda activate env_name

conda create -n HantaCon -c conda-forge python==3.10 bioconda::bcftools==1.17 bioconda::bedtools==2.31.0 bioconda::htslib==1.17 bioconda::minimap2==2.26 bioconda::samtools==1.17 bioconda::seqkit==2.4.0 bioconda::k8==0.2.5 bioconda::vcfpy==0.13.6
pip install medaka==1.7.3
pip install medaka-cpu==1.7.3

#HAntaCon에 대한 설명
sudo apt-get install -y npm
npm install electron@25.1.1
npm install electron-builder@22.10.5
npm install electron-log@4.4.8
npm install fs-extra@11.2.0



#Nextstrain 설치
curl -fsSL --proto '=https' https://nextstrain.org/cli/installer/linux | bash
#설치후  설명대로 두개 명령어 실행.


도커 설치
sudo apt install docker.io
sudo gpasswd --add $USER docker

도커 설치 후 넥스트스트레인 도커 셋팅 > 오류 발생시 재부팅
nextstrain setup --set-default docker


pip install vcfpy==0.13.6

https://mafft.cbrc.jp/alignment/software/linux.html
mafft 설치




