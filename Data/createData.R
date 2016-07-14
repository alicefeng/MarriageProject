# Create Datasets for Marriage Project

require(sqldf)
require(reshape2)

# Input Datasets:
# occupationData.csv - maps Census occupation groups to SOC occupation groups and 
#                      has total employment, earnings, and educational data 
# acsfiltered.csv - 2014 1-Year ACS data filtered to married, employed individuals


############### CREATE occupationGroups.csv ############################################

# read in my shortened names for the job groups
occnames <- read.csv("data/OccNamesMapping.csv")
str(occnames)

# read in data
occdat <- read.csv("data\\occupationData.csv", na.strings = c("*", "#"), nrows = 550)
occdat$TOT_EMP <- as.numeric(as.character(occdat$TOT_EMP))
occdat$A_MEAN <- as.numeric(as.character(occdat$A_MEAN))
occdat$A_PCT10 <- as.numeric(as.character(occdat$A_PCT10))
occdat$A_PCT25 <- as.numeric(as.character(occdat$A_PCT25))
occdat$A_MEDIAN <- as.numeric(as.character(occdat$A_MEDIAN))
occdat$A_PCT75 <- as.numeric(as.character(occdat$A_PCT75))
occdat$A_PCT90 <- as.numeric(as.character(occdat$A_PCT90))
str(occdat)

# calculate total number of people in each major occupational grouping
grppop <- sqldf("SELECT SOC_Major_Group, SUM(TOT_EMP) as TOT_EMP
                FROM occdat
                GROUP BY SOC_Major_Group")

# calculate weighted average income and educational levels for each consolidated group
occdat$tot_A_MEAN <- occdat$A_MEAN * occdat$TOT_EMP
occdat$tot_BachelorsPlus <- occdat$BachelorsPlus * occdat$TOT_EMP
occdat$tot_Female <- occdat$PctWomen * occdat$TOT_EMP

occdatgrps <- sqldf("SELECT t3.MyName as SOC_Major_Group, t2.TOT_EMP as TOT_EMP,
                    SUM(t1.tot_A_MEAN/t2.TOT_EMP) as A_MEAN,
                    SUM(t1.tot_BachelorsPlus/t2.TOT_EMP) as BachelorsPlus,
                    SUM(t1.tot_Female/t2.TOT_EMP) as PctWomen
                    FROM occdat t1
                    JOIN grppop t2
                    ON t1.SOC_Major_Group = t2.SOC_Major_Group
                    JOIN occnames t3
                    ON t1.SOC_Major_Group = t3.SOC_Major_Group
                    GROUP BY t1.SOC_Major_Group")


# give each group an income/education score which is the sum of the standardized variables
occdatgrps$score <- scale(occdatgrps$A_MEAN) + scale(occdatgrps$BachelorsPlus)

# assign rank to each occupation based on score
occdatgrps <- occdatgrps[order(occdatgrps$score, decreasing = TRUE),]
occdatgrps$rank <- seq(1:nrow(occdatgrps))

# write out dataset
write.csv(occdatgrps, "data\\occupationGroups.csv", row.names = FALSE)





###################### CREATE pairingsbyocc.csv ########################################

# read in data
acs <- read.csv("data\\acsfiltered.csv")
str(acs)

# filter out observations missing class of worker status
acs <- acs[!is.na(acs$COW),]

# recode education into factors
summary(acs$SCHL)
acs$educat <- NULL
acs$educat[acs$SCHL < 16] <- "Less than HS"
acs$educat[acs$SCHL == 16 | acs$SCHL == 17] <- "HS Diploma"
acs$educat[acs$SCHL >= 18 & acs$SCHL <= 20] <- "Some College"
acs$educat[acs$SCHL == 21] <- "Bachelor's"
acs$educat[acs$SCHL >= 22] <- "Professional degree"
acs$educat <- factor(acs$educat, 
                     levels=c("Less than HS", "HS Diploma", "Some College", "Bachelor's", "Professional degree"),
                     ordered=TRUE)

# recode income into buckets based on quintiles and the top 5%
# cutoffs taken from h01AR.xls for the year 2014
summary(acs$PERNP)
acs$inccat <- NULL
acs$inccat[acs$PERNP*(acs$ADJINC/1000000) <= 21432] <- "Bottom quintile"
acs$inccat[acs$PERNP*(acs$ADJINC/1000000) > 21432 & acs$PERNP*(acs$ADJINC/1000000) <= 41186] <- "Second quintile"
acs$inccat[acs$PERNP*(acs$ADJINC/1000000) > 41186 & acs$PERNP*(acs$ADJINC/1000000) <= 68212] <- "Middle quintile"
acs$inccat[acs$PERNP*(acs$ADJINC/1000000) > 68212 & acs$PERNP*(acs$ADJINC/1000000) <= 112262] <- "Fourth quintile"
acs$inccat[acs$PERNP*(acs$ADJINC/1000000) > 112262 & acs$PERNP*(acs$ADJINC/1000000) < 206568] <- "Upper quintile"
acs$inccat[acs$PERNP*(acs$ADJINC/1000000) > 206568] <- "Top 5 percent"
acs$inccat <- factor(acs$inccat, 
                     levels=c("Bottom quintile", "Second quintile", "Middle quintile",
                              "Fourth quintile", "Upper quintile", "Top 5 percent"), 
                     ordered=TRUE)

# merge in occupation descriptions and grouping labels and scores
dat <- sqldf("SELECT DISTINCT t1.*, t2.Census_Desc, t2.SOC_Major_Group, t3.score, t3.rank
             FROM acs t1
             JOIN occdat t2
             ON t1.OCCP = t2.Census_Occ_Code
             JOIN occdatgrps t3
             ON t2.SOC_Major_Group = t3.SOC_Major_Group")

# keep only full time workers (worked >= 30 hours/week)
dat <- dat[dat$WKHP >= 30,]

# keep only workers between ages 18-65
dat <- dat[dat$AGEP >= 18 & dat$AGEP <= 65,]

# drop workers with negative earnings or earnings less than $10,000/year
dat <- dat[dat$PERNP > 10000,]

# put respondent and their spouse's data on same line
respondentdat <- dat[dat$RELP == 0,]
spousedat <- dat[dat$RELP == 1,]

merged <- sqldf("SELECT DISTINCT t1.SERIALNO, t1.PWGTP, t1.SCHL, t1.SEX, t1.AGEP, t1.OCCP, t1.Census_Desc, 
                t1.SOC_Major_Group, t1.rank, t1.PERNP, t1.inccat, t1.educat, t1.WKHP,
                t2.SCHL as SSCHL, t2.SEX as SSEX, t1.AGEP as SAGEP, t2.OCCP as SOCCP, 
                t2.Census_Desc as SCensus_Desc, t2.SOC_Major_Group as SSOC_Major_Group, t2.rank as Srank, 
                t2.PERNP as SPERNP, t2.inccat as Sinccat, t2.educat as Seducat, t2.WKHP as SWKHP
                FROM respondentdat t1
                JOIN spousedat t2
                ON t1.SERIALNO = t2.SERIALNO
                ")

merged$Seducat <- factor(merged$Seducat, 
                         levels=c("Less than HS", "HS Diploma", "Some College", "Bachelor's", "Professional degree"),
                         ordered=TRUE)
merged$Sinccat <- factor(merged$Sinccat, 
                         levels=c("Bottom quintile", "Second quintile", "Middle quintile",
                                  "Fourth quintile", "Upper quintile", "Top 5 percent"), 
                         ordered=TRUE)
str(merged)

# calculate number of pairings per job combination
pairings <- sqldf("SELECT o1.MyName as Spouse1Job, m.rank as Spouse1Rank, 
                  o2.MyName as Spouse2Job, m.Srank as Spouse2Rank, SUM(m.PWGTP) as NumPairings,
                  SUM(m.PWGTP)/(t.TotPairs + 0.0) as PctPairs
                  FROM merged m
                  JOIN (
                  SELECT SOC_Major_Group, SUM(PWGTP) as TotPairs
                  FROM merged
                  GROUP BY SOC_Major_Group
                  ) t
                  ON m.SOC_Major_Group = t.SOC_Major_Group
                  JOIN occnames o1
                  ON m.SOC_Major_Group = o1.SOC_Major_Group
                  JOIN occnames o2
                  ON m.SSOC_Major_Group = o2.SOC_Major_Group
                  GROUP BY m.SOC_Major_Group, m.SSOC_Major_Group
                  ORDER BY m.rank, SUM(m.PWGTP) DESC
                  ")
str(pairings)

# calculate difference in occupation rankings between couples to see who tends to marry up, below or with equal status
pairings$rankdiff <- pairings$Spouse1Rank - pairings$Spouse2Rank

write.csv(pairings, "data\\pairingsbyocc.csv", row.names=FALSE)
# this file is then used as input into createPairingsJson.py to create pairings.json




###################### CREATE edudiffdata.csv, incdiffdata.csv ###############################

# find difference between spouses' incomes
merged$incdiff <- merged$PERNP - merged$SPERNP
merged$pctincdiff <- merged$incdiff/merged$PERNP

# filter out couples whose % difference in income is too large to be beliveable
merged <- merged[merged$pctincdiff > -10,]

# label categories
merged$incdiffcat <- "Within 25%"
merged$incdiffcat[merged$pctincdiff > .25] <- "More"
merged$incdiffcat[merged$pctincdiff <= -.25] <- "Less"

merged$incdiffcat <- factor(merged$incdiffcat,
                            levels = c("Less",
                                       "Within 25%",
                                       "More"),
                            ordered = TRUE)

sum(merged$PWGTP) #20234567
incdiffdata <- sqldf("SELECT o.MyName as SOC_Major_Group, m.rank as rank, m.incdiffcat as incdiffcat, 
                     SUM(PWGTP)/(t.TotPairs + 0.0) as value
                     FROM merged m
                     JOIN (
                         SELECT SOC_Major_Group, SUM(PWGTP) as TotPairs
                         FROM merged
                         GROUP BY SOC_Major_Group
                     ) t
                     ON m.SOC_Major_Group = t.SOC_Major_Group
                     JOIN occnames o
                     ON m.SOC_Major_Group = o.SOC_Major_Group
                     GROUP BY m.SOC_Major_Group, incdiffcat
                     
                     UNION
                     
                     SELECT 'Overall' as SOC_Major_Group, 0 as rank, incdiffcat, SUM(PWGTP)/20234567.0 as value
                     FROM merged
                     GROUP BY incdiffcat")

incdiffdata <- incdiffdata[order(incdiffdata$rank, incdiffdata$incdiffcat),]

# convert dataframe into wide format and change names to be JS-friendly
incdiffdataw <- dcast(incdiffdata, SOC_Major_Group + rank ~ incdiffcat)
names(incdiffdataw) <- c("Occupation", "Rank", "Less", "Equal", "More")
incdiffdataw[is.na(incdiffdataw)] <- 0

write.csv(incdiffdataw, "data\\incdiffdata.csv", row.names = FALSE)


# compare educational attainment within couples
merged$edudiffcat[as.numeric(merged$educat) - as.numeric(merged$Seducat) > 0] <- "More educated"
merged$edudiffcat[as.numeric(merged$educat) - as.numeric(merged$Seducat) < 0] <- "Less educated"
merged$edudiffcat[merged$educat == merged$Seducat] <- "Equal edu attainment"
merged$edudiffcat <- factor(merged$edudiffcat,
                            levels = c("Less educated",
                                       "Equal edu attainment",
                                       "More educated"),
                            ordered = TRUE)

edudiffdata <- sqldf("SELECT o.MyName as SOC_Major_Group, m.rank as rank, m.edudiffcat as edudiffcat, 
                     SUM(PWGTP)/(t.TotPairs + 0.0) as value
                     FROM merged m
                     JOIN (
                         SELECT SOC_Major_Group, SUM(PWGTP) as TotPairs
                         FROM merged
                         GROUP BY SOC_Major_Group
                     ) t
                     ON m.SOC_Major_Group = t.SOC_Major_Group
                     JOIN occnames o
                     ON m.SOC_Major_Group = o.SOC_Major_Group
                     GROUP BY m.SOC_Major_Group, edudiffcat
                     
                     UNION
                     
                     SELECT 'Overall' as SOC_Major_Group, 0 as rank, edudiffcat, SUM(PWGTP)/20234567.0 as value
                     FROM merged
                     GROUP BY edudiffcat")

edudiffdata <- edudiffdata[order(edudiffdata$rank, edudiffdata$edudiffcat),]

# convert dataframe into wide format and change names to be JS-friendly
edudiffdataw <- dcast(edudiffdata, SOC_Major_Group + rank ~ edudiffcat)
names(edudiffdataw) <- c("Occupation", "Rank", "Less", "Equal", "More")
edudiffdataw[is.na(edudiffdataw)] <- 0

write.csv(edudiffdataw, "data\\edudiffdata.csv", row.names = FALSE)






###################### CREATE occmarried.csv ########################################

# compare what % of people are married within each occupation
occcompare <- read.csv("data/occcompare.csv")
str(occcompare)

# map occupations to the job groupings
occcompare2 <- sqldf("SELECT t3.MyName as Occ, t4.rank, t1.MaritalStatus, SUM(t1.NumPeople) as Num
                     FROM occcompare t1
                     JOIN occdat t2
                     ON t1.OCCP = t2.Census_Occ_Code
                     JOIN occnames t3
                     ON t2.SOC_Major_Group = t3.SOC_Major_Group
                     JOIN occdatgrps t4
                     ON t2.SOC_Major_Group = t4.SOC_Major_Group
                     GROUP BY t3.MyName, t1.MaritalStatus")

# calculate % of people are married within each occupation
occmarried <- sqldf("SELECT t1.Occ, t1.rank, t1.MaritalStatus, Num/(Total + 0.0) as Pct
                    FROM occcompare2 t1
                    JOIN (
                    SELECT Occ, SUM(Num) as Total
                    FROM occcompare2
                    GROUP BY Occ
                    ) t2
                    ON t1.Occ = t2.Occ
                    ORDER BY t1.Rank, t1.MaritalStatus")

# convert into wide format to be JS-friendly
occmarriedw <- dcast(occmarried, Occ + rank ~ MaritalStatus)

write.csv(occmarriedw, "data\\occmarried.csv", row.names=FALSE)
