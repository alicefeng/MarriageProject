# -*- coding: utf-8 -*-
"""
Title: createMarriedCompareData.py 

Description:
This file produces the final datasets used for visualizing differences in 
education and income between married people and the entire US population ages 
35 - 50.  It also compares the percentage of people within an occupation who 
are married.

Inputs: a SQLite database already set up with ss14pusa.csv and ss14pusb.csv
        loaded into it

Outputs: occcompare.csv, inccompare.csv, educompare.csv

Created on Sun Jul 10 11:55:20 2016

@author: Alice
"""

import sqlite3
import pandas.io.sql as sql

# connect to database
conn = sqlite3.connect('marriageproj.db')
print "Opened database successfully."

# calculate total number of people married or not married by occupation
occcompare = sql.read_sql("SELECT OCCP,                                      \
                           CASE WHEN MAR = 1 THEN 'Married'                  \
                                ELSE 'NotMarried' END AS MaritalStatus,      \
                            SUM(PWGTP) as NumPeople                          \
                          FROM acs2014                                       \
                          WHERE AGEP between 35 and 50                       \
                          AND COW not in ('b', '8', '9') and COW is not null \
                          AND ESR not in ('b', '3', '6')                     \
                          GROUP BY OCCP, MaritalStatus;", conn)

occcompare.to_csv('occcompare.csv', index = False)

# create table of all adults ages 35-50 and their income, level of schooling 
# and marital status (only need to do this once so don't rerun the code after
# the table has been created)
#adults35to50 = sql.read_sql("CREATE TABLE adults35to50 as                  \
#                             SELECT SERIALNO, SPORDER, PWGTP,               \
#                             CASE WHEN MAR = 1 THEN 'Married'               \
#                                  ELSE 'Not Married' END AS MaritalStatus,  \
#                             CASE WHEN SCHL < 16 THEN 'Less than HS'        \
#                                  WHEN SCHL between 16 and 17 THEN 'HS Diploma' \
#                                  WHEN SCHL between 18 and 20 THEN 'Some College' \
#                                  WHEN SCHL = 21 THEN 'Bachelors'                 \
#                                  WHEN SCHL between 22 and 24 THEN 'Professional degree' \
#                                  ELSE '' END as EduCat,                    \
#                             CASE WHEN CAST(PERNP as int) <= 21432 THEN 'Bottom quintile'\
#                                  WHEN CAST(PERNP as int) > 21432 AND CAST(PERNP as int) <= 41186 THEN 'Second quintile' \
#                                  WHEN CAST(PERNP as int) > 41168 AND CAST(PERNP as int) <= 68212 THEN 'Middle quintile' \
#                                  WHEN CAST(PERNP as int) > 68212 AND CAST(PERNP as int) <= 112262 THEN 'Fourth quintile'\
#                                  WHEN CAST(PERNP as int) > 112262 THEN 'Top quintile' \
#                                  ELSE '' END as IncCat                     \
#                             FROM acs2014                                   \
#                             WHERE AGEP between 35 and 50                   \
#                             AND PERNP >= 0;", conn)


inccompare = sql.read_sql("SELECT IncCat, t1.MaritalStatus,                 \
                           SUM(PWGTP)/(Total+0.0) as Pct                    \
                           FROM adults35to50 t1                             \
                           JOIN (                                           \
                                SELECT MaritalStatus, SUM(PWGTP) as Total   \
                                FROM adults35to50                           \
                                GROUP BY MaritalStatus                      \
                           ) t2                                             \
                           ON t1.MaritalStatus = t2.MaritalStatus           \
                           GROUP BY t1.MaritalStatus, IncCat;", conn)

inccomparew = inccompare.pivot(index="MaritalStatus", columns="IncCat", 
                               values="Pct")
                               
inccomparew.to_csv('inccompare.csv')



educompare = sql.read_sql("SELECT EduCat, t1.MaritalStatus,                 \
                           SUM(PWGTP)/(Total+0.0) as Pct                    \
                           FROM adults35to50 t1                             \
                           JOIN (                                           \
                                SELECT MaritalStatus, SUM(PWGTP) as Total   \
                                FROM adults35to50                           \
                                GROUP BY MaritalStatus                      \
                           ) t2                                             \
                           ON t1.MaritalStatus = t2.MaritalStatus           \
                           GROUP BY t1.MaritalStatus, EduCat;", conn)

educomparew = educompare.pivot(index="MaritalStatus", columns="EduCat",
                               values="Pct")
                               
educomparew.to_csv('educompare.csv')

# close connection
conn.close()
print "Database closed successfully."
