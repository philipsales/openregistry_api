#!/bin/bash
M=$1
N=$2

if [ -z $M ] || [ -z $N ]
then
    echo "You must specify both parameters"
    exit 1
fi

for i in `seq 1 $M`
do
    nohup ./e2e.sh $N &> ./logs/e2e-tests-$i.out & 
done