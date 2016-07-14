# -*- coding: utf-8 -*-
"""
Title: cleanData.py 

Description:
This file produces the final ACS dataset used for analysis and visualization.

It filters rows to only respondents who are married and employed.
It also only keeps the relevant columns needed as specified in variableList.txt.

Inputs: a SQLite database already set up with ss14pusa.csv and ss14pusb.csv
        loaded into it

Outputs: acsfiltered.csv

Created on Sat Apr 30 15:35:18 2016

@author: Alice
"""

import sqlite3
import pandas.io.sql as sql

# connect to database
conn = sqlite3.connect('marriageproj.db')
print "Opened database successfully."

# use pandas to load results and dump to csv
table = sql.read_sql("SELECT SERIALNO, SPORDER, ADJINC, PWGTP, AGEP, COW,    \
                      MAR, RELP, SCHL, SEMP, SEX, WAGP, WKHP, ESR, OCCP,     \
                      PERNP, PINCP                                           \
                      FROM acs2014                                           \
                      WHERE (RELP == '00' OR RELP == '01')                   \
                      AND COW not in ('b', '8', '9') and COW is not null     \
                      AND MAR == '1'                                         \
                      AND ESR not in ('b', '3', '6') ;", conn)

table.to_csv('acsfiltered.csv', index = False)

# close connection
conn.close()
print "Database closed successfully."