#!/bin/bash
N=$1

for i in `seq 1 $N`
do
 #ng e2e --no-serve 
 protractor protractor.conf.js
done