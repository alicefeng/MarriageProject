# -*- coding: utf-8 -*-
"""
Title: createOccupationData.py

Description:
This program joins together data that maps Census Occupation Codes to SOC Codes
so that data on average earnings, total employment, educational attainment, 
and gender breakdowns for each occupation (which are labeled using SOC Codes) 
can be mapped to the Census Occupation Codes which is what the ACS uses.

Inputs: a SQLite database already set up with CensusToSOCMapping.csv,
        EarningsByOcc.csv, EducationbyOcc.csv, and OccBySexRace.csv 
        already loaded into it
        
Outputs: occupationData.csv

Created on Mon Apr 25 20:15:36 2016

@author: Alice
"""

import sqlite3
import pandas.io.sql as sql

# connect to database
conn = sqlite3.connect('marriageProj.db')
print "Opened database successfully."

# use pandas to load results and dump to csv    
table = sql.read_sql("SELECT t1.*, t2.TOT_Emp, t2.A_Mean, t2.A_PCT10, \
                        t2.A_PCT25, t2.A_MEDIAN, t2.A_PCT75, t2.A_PCT90, \
                        t3.NoHighSchool, t3.HighSchool, t3.SomeCollege, \
                        t3.Associates, t3.Bachelors, t3.Masters, t3.DoctorProf,\
                        (t3.Bachelors + t3.Masters + t3.DoctorProf) \
                        as BachelorsPlus, t4.PctWomen \
                        FROM CensusSOCMap t1 \
                        LEFT JOIN EarningsByOcc t2 \
                        ON RTRIM(t1.SOC_Code) = t2.OCC_CODE \
                        LEFT JOIN EducByOcc t3 \
                        ON RTRIM(t1.SOC_Code) = t3.SOCCode \
                        LEFT JOIN OccbySexRace t4 \
                        ON RTRIM(t1.SOC_Desc) = t4.Occupation ;", conn)
table.to_csv('occupationData.csv', index = False)

# close connection
conn.close()
print "Database closed successfully."