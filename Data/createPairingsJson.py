# -*- coding: utf-8 -*-
"""
Title: createPairingsJson.py

Description:
This program converts the pairings.csv file into a nested, hierarchical json
structure.

Inputs: pairings.csv
        
Outputs: pairings.json

Created on Wed May 04 21:46:59 2016

@author: Alice
"""

import csv
import json

data = []

# read in csv
with open('pairingsbyocc.csv', 'rb') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        data.append(row)

# restructure csv into hierarchical format

# first get list of unique jobs
jobs = []
for i in range(len(data)):
    jobs.append(data[i]['Spouse1Job'])

joblist = list(set(jobs))

# write dictionary
pairings = []

for job in joblist:
    spousejobs = []
    for i in range(len(data)):
        if data[i]['Spouse1Job'] == job:
            spousejobs.append({'Spouse1Job': job,
                               'Spouse2Job': data[i]['Spouse2Job'],
                               'Spouse2Rank':int(data[i]['Spouse2Rank']),
                               'NumPairings': int(data[i]['NumPairings']),
                               'PctPairs': float(data[i]['PctPairs']) })
            spouse1rank = data[i]['Spouse1Rank']
                               
    pairings.append({'Spouse1Job': job, 
                     'Spouse1Rank': int(spouse1rank), 
                     'Spouse2Jobs': spousejobs})
    
with open("pairings.json", "w") as j:
    json.dump(pairings, j)
    