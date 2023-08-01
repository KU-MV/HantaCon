#!/bin/bash


l_path="./htv_L/data/metadata.tsv"
m_path="./htv_M/data/metadata.tsv"
s_path="./htv_S/data/metadata.tsv"

strain=$1
virus=$2
accession=$3
date=$4
host=$5
region=$6
country=$7
city=$8
town=$9
db=${10}
author=${11}
url=${12}
title=${13}
journal=${14}
paper_url=${15}


#tail ./htv_L/data/metadata.tsv -n1
#./test.sh "test_sample" " " " " "2023-07-30" "사람"
#tail ./htv_L/data/metadata.tsv -n1 | grep -c $'\n'
#awk 'END{print}' ./htv_L/data/metadata.tsv
#wc -l ./htv_L/data/metadata.tsv
#wc -l ./htv_L/data/metadata.tsv
#sed -n '123p' ./htv_L/data/metadata.tsv
echo -e "$strain\t$virus\t$accession\t$date\t$host\t$region\t$country\t$city\t$town\t$db\t$author\t$url\t$title\t$journal\t$paper_url" >> $l_path
echo -e "$strain\t$virus\t$accession\t$date\t$host\t$region\t$country\t$city\t$town\t$db\t$author\t$url\t$title\t$journal\t$paper_url" >> $m_path
echo -e "$strain\t$virus\t$accession\t$date\t$host\t$region\t$country\t$city\t$town\t$db\t$author\t$url\t$title\t$journal\t$paper_url" >> $s_path
