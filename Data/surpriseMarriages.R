require(sqldf)
require(plyr)
require(data.table)

occdat <- read.csv("data\\occupationData.csv", na.strings = c("*", "#"), nrows = 550)
occdat <- occdat[!is.na(occdat$PctWomen),]

# Calculate male share of each occupation
occdat$PctMen <- 100 - occdat$PctWomen

# Chi Square test to see if distribution of occupations differs by gender 
# (i.e., if men tend to work in different jobs than women)
men_by_occ <- (occdat$PctMen/100)*occdat$TOT_EMP
women_by_occ <- (occdat$PctWomen/100)*occdat$TOT_EMP
occmat <- matrix(c(men_by_occ, women_by_occ), ncol = 2, byrow = FALSE, 
                 dimnames = list(occdat$Census_Desc, c("Men", "Women")))

chisq.test(occmat)  # p < 0.001

# Seems to be a difference in jobs by sex so will analyze marriage patterns
# Separately for men and women

# Need to clean the occupation data as some Census Occ Codes map to multiple SOC Codes
occdat_clean <- sqldf("SELECT Census_Occ_Code, Census_Desc, Census_Desc_Short, SOC_Major_Group,
                              SUM(TOT_EMP) as TOT_EMP, SUM(PctWomen/100*TOT_EMP) as n_women, 
                              SUM(PctMen/100*TOT_EMP) as n_men
                         FROM occdat 
                     GROUP BY Census_Occ_Code, Census_Desc, Census_Desc_Short, SOC_Major_Group")
occdat_clean$PctWomen <- occdat_clean$n_women/sum(occdat_clean$n_women)
occdat_clean$PctMen <- occdat_clean$n_men/sum(occdat_clean$n_men)

# Add ranks by gender (1 = most common occupation among men/women)
occdat_clean <- occdat_clean[order(occdat_clean$PctWomen, decreasing = TRUE),]
occdat_clean$rank_w <- seq(1, nrow(occdat_clean))
occdat_clean <- occdat_clean[order(occdat_clean$PctMen, decreasing = TRUE),]
occdat_clean$rank_m <- seq(1, nrow(occdat_clean))




# Prepare data on marriage frequencies by occupation

# read in ACS data
acs <- read.csv("data\\acsfiltered.csv")
str(acs)

# filter out obs missing class of worker status
acs <- acs[!is.na(acs$COW),]

# keep only full time workers (worked >= 30 hours/week)
acs <- acs[acs$WKHP >= 30,]

# keep only workers between ages 18-65
acs <- acs[acs$AGEP >= 18 & acs$AGEP <= 65,]

# drop workers with negative earnings or earnings less than $10,000/year
acs <- acs[acs$PERNP > 10000,]

# keep only needed columns
acs2 <- acs[, c("SERIALNO", "ADJINC", "PWGTP", "AGEP", "SCHL", "SEX", "OCCP", "PERNP", "PINCP")]

# put respondent and their spouse's data on same line 
husbands <- acs2[acs2$SEX == 1,]
wives <- acs2[acs2$SEX == 2,]
couples <- merge(husbands, wives, by="SERIALNO", suffixes=c("_H", "_W"))

# get total number of married men by occupation
n_husbands = sqldf("SELECT OCCP_H, COUNT(*) as num_couples
                      FROM couples 
                  GROUP BY OCCP_H")

# get total number of married women by occupation
n_wives = sqldf("SELECT OCCP_W, COUNT(*) as num_couples
                   FROM couples 
               GROUP BY OCCP_W")

# get number of couples in each occupational pairing
occ_pairings <- sqldf("SELECT OCCP_H, OCCP_W, COUNT(*) as num_couples
                         FROM couples
                     GROUP BY OCCP_H, OCCP_W")



# Let's look at the most common pairings - are they surprising?
occ_pairings <- occ_pairings[order(occ_pairings$num_couples, decreasing=TRUE),]
occ_pairings$rank <- seq(1:nrow(occ_pairings))
occ_pairings$pct_couples <- occ_pairings$num_couples/sum(occ_pairings$num_couples)

# Add some attributes
most_common <- sqldf(" SELECT a.OCCP_H, b.Census_Desc_Short as Husband_Occ, a.OCCP_W, c.Census_Desc_Short as Wife_Occ,
                              b.SOC_Major_Group as Husband_Occ_Group, c.SOC_Major_Group as Wife_Occ_Group,
                              a.rank, a.num_couples, a.pct_couples, b.rank_m as H_occ_rank, c.rank_w as W_occ_rank
                         FROM occ_pairings a 
                         JOIN occdat_clean b 
                           ON a.OCCP_H = b.Census_Occ_Code
                         JOIN occdat_clean c
                           ON a.OCCP_W = c.Census_Occ_Code
                        WHERE a.rank <= 100
                     ORDER BY a.rank")  # limit to top 100 most common pairings

# Because some occupations lack gender breakdown info, we end up with fewer than 100 pairs -> must re-rank
most_common$rank <- seq(1:nrow(most_common))

# couples where one spouse works in one of the most common occupations among people of that gender
top_women_jobs <- occdat_clean$Census_Occ_Code[order(occdat_clean$PctWomen, decreasing = TRUE)[1:20]]
top_men_jobs <- occdat_clean$Census_Occ_Code[order(occdat_clean$PctMen, decreasing = TRUE)[1:20]]
most_common$top_women_job <- ifelse(most_common$OCCP_W %in% top_women_jobs, 1, 0)
most_common$top_men_job <- ifelse(most_common$OCCP_H %in% top_men_jobs, 1, 0)
table(most_common$top_women_job, most_common$top_men_job)  
# most of these pairings involve at least one spouse having a popular job

write.csv(most_common, "Data\\most_common.csv", row.names = FALSE)



### Calculate Surprise

# Observed = ACS data of marriages
# Expected = % of women (men) employed in each job for the Base Rate Model,
#            average frequency of couples for the de Moivre funnel Model


## Calculate Observed:

# get breakdown of spouse's occupations per respondent's occupation 
# (i.e., % of male teachers married to wives who work as secretaries)
# this is the Observed data
pct_wife_occ <- sqldf("SELECT a.OCCP_H, a.OCCP_W, a.num_couples, b.num_couples as n_husband_occ,
                              (a.num_couples+0.0)/b.num_couples as pct_couples
                         FROM occ_pairings a 
                         JOIN n_husbands b 
                           ON a.OCCP_H = b.OCCP_H
                        WHERE b.num_couples > 10") # filter to occupations with at least 10 marriages

# (% of female teachers married to husbands who work as secretaries)
pct_husband_occ <- sqldf("SELECT a.OCCP_W, a.OCCP_H, a.num_couples, b.num_couples as n_wife_occ,
                                 (a.num_couples+0.0)/b.num_couples as pct_couples
                            FROM occ_pairings a 
                            JOIN n_wives b 
                              ON a.OCCP_W = b.OCCP_W
                           WHERE b.num_couples > 10") # filter to occupations with at least 10 marriages


## Calculate Expected:

# Base Rate Model: this is the % of people who work in each occupation
expected <- occdat_clean[, c("Census_Occ_Code", "Census_Desc_Short", "PctWomen", "PctMen")]

# de Moivre Funnel Model: 
# get group means and std errors by spouse's occupation
summarize_wife <- ddply(pct_wife_occ, c("OCCP_W"), summarise, mean = mean(pct_couples))
summarize_husband <- ddply(pct_husband_occ, c("OCCP_H"), summarise, mean = mean(pct_couples))

pct_wife_occ <- merge(pct_wife_occ, expected[,c("Census_Occ_Code", "Census_Desc_Short", "PctWomen")], by.x="OCCP_W", by.y = "Census_Occ_Code") 
pct_wife_occ <- merge(pct_wife_occ, summarize_wife, by="OCCP_W")
pct_wife_occ$se <- sqrt(pct_wife_occ$pct_couples*(1-pct_wife_occ$pct_couples)/pct_wife_occ$n_husband_occ)

pct_husband_occ <- merge(pct_husband_occ, expected[,c("Census_Occ_Code", "Census_Desc_Short", "PctMen")], by.x="OCCP_H", by.y = "Census_Occ_Code") 
pct_husband_occ <- merge(pct_husband_occ, summarize_husband, by="OCCP_H")
pct_husband_occ$se <- sqrt(pct_husband_occ$pct_couples*(1-pct_husband_occ$pct_couples)/pct_husband_occ$n_wife_occ)


## Calculate Likelihood [P(D|Model)]:
pct_wife_occ$pDM_base <- 1 - 0.5*abs(pct_wife_occ$pct_couples - pct_wife_occ$PctWomen)
pct_wife_occ$z <- (pct_wife_occ$pct_couples - pct_wife_occ$mean)/pct_wife_occ$se
pct_wife_occ$pDM_deMoivre <- 1 - (2 * (pnorm(abs(pct_wife_occ$z)) - 0.5)) + 0.0000001 #add a small factor so we don't have probability = 0 which is problematic when calculating KL divergence

pct_husband_occ$pDM_base <- 1 - 0.5*abs(pct_husband_occ$pct_couples - pct_husband_occ$PctMen)
pct_husband_occ$z <- (pct_husband_occ$pct_couples - pct_husband_occ$mean)/pct_husband_occ$se
pct_husband_occ$pDM_deMoivre <- 1 - (2 * (pnorm(abs(pct_husband_occ$z)) - 0.5)) + 0.0000001 #add a small factor so we don't have probability = 0 which is problematic when calculating KL divergence


## Calculate Posterior [P(Model|D)]:
# (assume each model has equal probability of being true)
pct_wife_occ$pMD_base = 0.5 * pct_wife_occ$pDM_base
pct_wife_occ$pMD_deMoivre = 0.5 * pct_wife_occ$pDM_deMoivre  

pct_husband_occ$pMD_base = 0.5 * pct_husband_occ$pDM_base
pct_husband_occ$pMD_deMoivre = 0.5 * pct_husband_occ$pDM_deMoivre  


## Calculate Surprise using KL-divergence
pct_wife_occ$kl = (pct_wife_occ$pMD_base*log(pct_wife_occ$pMD_base/0.5)) + (pct_wife_occ$pMD_deMoivre*log(pct_wife_occ$pMD_deMoivre/0.5))
pct_wife_occ$kl_base = (pct_wife_occ$pMD_base*log(pct_wife_occ$pMD_base/0.5))
pct_wife_occ$kl_deMoivre = pct_wife_occ$pMD_deMoivre*log(pct_wife_occ$pMD_deMoivre/0.5)
  
pct_husband_occ$kl = (pct_husband_occ$pMD_base*log(pct_husband_occ$pMD_base/0.5)) + (pct_husband_occ$pMD_deMoivre*log(pct_husband_occ$pMD_deMoivre/0.5))
pct_husband_occ$kl_base = (pct_husband_occ$pMD_base*log(pct_husband_occ$pMD_base/0.5))
pct_husband_occ$kl_deMoivre = pct_husband_occ$pMD_deMoivre*log(pct_husband_occ$pMD_deMoivre/0.5)

# adjust sign of surprise based on whether observed marriage rate is less than expected or not
pct_wife_occ$surprise <- ifelse(pct_wife_occ$pct_couples < pct_wife_occ$PctWomen, pct_wife_occ$kl, -1*pct_wife_occ$kl)
pct_husband_occ$surprise <- ifelse(pct_husband_occ$pct_couples < pct_husband_occ$PctMen, pct_husband_occ$kl, -1*pct_husband_occ$kl)

summary(pct_wife_occ$pMD_base)      
summary(pct_wife_occ$pMD_deMoivre)  

summary(pct_husband_occ$pMD_base)     
summary(pct_husband_occ$pMD_deMoivre)  
# seems like the base rate model is more plausible than the De Moivre model
# therefore will focus on surprising deviations from the base rate model

pct_wife_occ$diff = pct_wife_occ$pct_couples - pct_wife_occ$PctWomen
pct_husband_occ$diff = pct_husband_occ$pct_couples - pct_husband_occ$PctMen



# Create final datasets

# First clean occupation group names
grp_names <- read.csv('data\\occ_group_rename.csv')

final_w <- sqldf("SELECT DISTINCT a.OCCP_H, a.OCCP_W, b.Census_Desc_Short as Husband_Occ, 
                         a.Census_Desc_short as Wife_Occ, c.rank_w as Wife_Occ_Rank,
                         d.New_Group_Name as Husband_Occ_Group, e.New_Group_Name as Wife_Occ_Group,
                         a.num_couples, 
                         a.pct_couples, a.PctWomen, a.surprise, a.diff, a.kl_base, a.kl_deMoivre
                    FROM pct_wife_occ a 
                    JOIN occdat_clean b 
                      ON a.OCCP_H = b.Census_Occ_Code
                    JOIN occdat_clean c 
                      ON a.OCCP_W = c.Census_Occ_Code
                    JOIN grp_names d 
                      ON b.SOC_Major_Group = d.SOC_Major_Group
                    JOIN grp_names e
                      ON c.SOC_Major_Group = e.SOC_Major_Group
                   WHERE a.num_couples > 10
                ORDER BY a.OCCP_H, a.diff DESC")

final_h <- sqldf("SELECT DISTINCT a.OCCP_H, a.OCCP_W, b.Census_Desc_Short as Wife_Occ, 
                         a.Census_Desc_Short as Husband_Occ, c.rank_m as Husband_Occ_Rank,
                         d.New_Group_Name as Wife_Occ_Group, e.New_Group_Name as Husband_Occ_Group,
                         a.num_couples, 
                         a.pct_couples, a.PctMen, a.surprise, a.diff, a.kl_base, a.kl_deMoivre
                    FROM pct_husband_occ a 
                    JOIN occdat_clean b 
                      ON a.OCCP_W = b.Census_Occ_Code
                    JOIN occdat_clean c 
                      ON a.OCCP_H = c.Census_Occ_Code
                    JOIN grp_names d 
                      ON b.SOC_Major_Group = d.SOC_Major_Group
                    JOIN grp_names e
                      ON c.SOC_Major_Group = e.SOC_Major_Group
                   WHERE a.num_couples > 10
                ORDER BY a.OCCP_W, a.diff DESC")

surprise_w <- final_w[,c("OCCP_H", "OCCP_W", "Husband_Occ", "Wife_Occ", "PctWomen", "pct_couples")]
surprise_h <- final_h[,c("OCCP_H", "OCCP_W", "Husband_Occ", "Wife_Occ", "PctMen", "pct_couples")]

write.csv(surprise_w, "Data\\surprise_w.csv", row.names = FALSE)
write.csv(surprise_h, "Data\\surprise_h.csv", row.names = FALSE)




# Let's look at couples who deviate most from base rate model
non_base_rate <- sqldf("SELECT * FROM final_w ORDER BY diff DESC LIMIT 100")
non_base_rateh <- sqldf("SELECT * FROM final_h ORDER BY diff DESC LIMIT 100") 

# seems many are couples who have the same occupation
non_base_rate$same_occ <- ifelse(non_base_rate$OCCP_H==non_base_rate$OCCP_W, 1, 0)
table(non_base_rate$same_occ)

non_base_rateh$same_occ <- ifelse(non_base_rateh$OCCP_H==non_base_rateh$OCCP_W, 1, 0)
table(non_base_rateh$same_occ)

# or are in the same occ group
non_base_rate$same_occ_group <- ifelse(non_base_rate$Husband_Occ_Group==non_base_rate$Wife_Occ_Group, 1, 0)
table(non_base_rate$same_occ_group)

table(non_base_rate$Wife_Occ[non_base_rate$same_occ_group==0]) # most remaining marriages are to female teachers

non_base_rateh$same_occ_group <- ifelse(non_base_rateh$Husband_Occ_Group==non_base_rateh$Wife_Occ_Group, 1, 0)
table(non_base_rateh$same_occ_group)

table(non_base_rateh$Husband_Occ[non_base_rateh$same_occ_group==0]) # most remaining marriages are to misc managers

non_base_rate <- non_base_rate[,c("OCCP_H", "OCCP_W", "Husband_Occ", "Wife_Occ", "Husband_Occ_Group",
                                  "Wife_Occ_Group", "same_occ", "same_occ_group")]
non_base_rateh <- non_base_rateh[,c("OCCP_H", "OCCP_W", "Husband_Occ", "Wife_Occ", "Husband_Occ_Group",
                                  "Wife_Occ_Group", "same_occ", "same_occ_group")]
non_base_rate_final <- sqldf("SELECT * 
                                FROM non_base_rate 
                               UNION 
                              SELECT * 
                                FROM non_base_rateh")

# map each occupation to a position number for visualization purposes so jobs in the same group appear next to each other
surprising_occs <- sort(unique(c(non_base_rate_final$OCCP_H, non_base_rate_final$OCCP_W)))
occ_order <- data.frame(surprising_occs)
occ_order$occ_num <- seq(1:nrow(occ_order))

non_base_rate_final <- sqldf("SELECT a.*, b.occ_num as occ_num_h, c.occ_num as occ_num_w
                                FROM non_base_rate_final a 
                                JOIN occ_order b 
                                  ON a.OCCP_H = b.surprising_occs 
                                JOIN occ_order c 
                                  ON a.OCCP_W = c.surprising_occs")

write.csv(non_base_rate_final, "Data\\non_base_rate.csv", row.names = FALSE)




# Which professions marry at higher or lower rates than expected?
ttest_res <- data.frame(OCCP_W = integer(),
                        t = numeric(),
                        p_value = numeric(),
                        estimate = numeric(),
                        ci_l = numeric(),
                        ci_u = numeric(),
                        pct_couples = numeric(),
                        occ_rank = numeric())

final_wife_occs <- unique(final_w$OCCP_W)
for(occ in final_wife_occs) {
  n <- nrow(final_w[final_w$OCCP_W==occ,])
  if (n > 1){
    avg_rate <- occdat_clean$PctWomen[occdat_clean$Census_Occ_Code==occ]
    result <- t.test(final_w$pct_couples[final_w$OCCP_W==occ], 
                     mu=avg_rate)
    ttest_res <- rbind(ttest_res, data.frame(OCCP_W=occ, 
                                             t=result$statistic, 
                                             p_value=result$p.value, 
                                             estimate=result$estimate, 
                                             ci_l=result$conf.int[1], 
                                             ci_u=result$conf.int[2], 
                                             pct_couples=avg_rate,
                                             occ_rank=occdat_clean$rank_w[occdat_clean$Census_Occ_Code==occ]))
  }
}

ttest_res <- merge(ttest_res, occdat_clean[,c("Census_Occ_Code", "Census_Desc_Short", "SOC_Major_Group")],
                   by.x = "OCCP_W", by.y="Census_Occ_Code")

# occupations where avg pct_couples differs from pctwomen significantly
diff <- ttest_res[ttest_res$p_value<=0.05,]

# filter down to only the top 20 most common occupations
diff_top20 <- diff[diff$occ_rank<=20,]

# make final dataset
diff_w <- diff_top20[, c("OCCP_W", "pct_couples", "occ_rank", "Census_Desc_Short")]
diff_w$OCCP_H <- 0
diff_w$Husband_Occ <- "Base_Rate"
names(diff_w)[3] <- "Wife_Occ_Rank"
names(diff_w)[4] <- "Wife_Occ"
diff_final_w <- rbind(diff_w, final_w[final_w$OCCP_W %in% diff_w$OCCP_W, 
                                c("OCCP_H", "OCCP_W", "pct_couples", "Wife_Occ_Rank", "Husband_Occ", "Wife_Occ")])
write.csv(diff_final_w, "Data\\diff_final_w.csv", row.names=FALSE)

# repeat for husbands
ttest_res2 <- data.frame(OCCP_H = integer(),
                        t = numeric(),
                        p_value = numeric(),
                        estimate = numeric(),
                        ci_l = numeric(),
                        ci_u = numeric(),
                        pct_couples = numeric(),
                        occ_rank = numeric())

final_hus_occs <- unique(final_h$OCCP_H)
for(occ in final_hus_occs) {
  n <- nrow(final_h[final_h$OCCP_H==occ,])
  if (n > 1){
    avg_rate <- occdat_clean$PctMen[occdat_clean$Census_Occ_Code==occ]
    result <- t.test(final_h$pct_couples[final_h$OCCP_H==occ], 
                     mu=avg_rate)
    ttest_res2 <- rbind(ttest_res2, data.frame(OCCP_H=occ, 
                                             t=result$statistic, 
                                             p_value=result$p.value, 
                                             estimate=result$estimate, 
                                             ci_l=result$conf.int[1], 
                                             ci_u=result$conf.int[2], 
                                             pct_couples=avg_rate,
                                             occ_rank=occdat_clean$rank_m[occdat_clean$Census_Occ_Code==occ]))
  }
}

ttest_res2 <- merge(ttest_res2, occdat_clean[,c("Census_Occ_Code", "Census_Desc_Short", "SOC_Major_Group")],
                   by.x = "OCCP_H", by.y="Census_Occ_Code")

# occupations where avg pct_couples differs from pctwomen significantly
diff2 <- ttest_res2[ttest_res2$p_value<=0.05,]

# filter down to only the top 20 most common occupations
diff_top202 <- diff2[diff2$occ_rank<=20,]

# make final dataset
diff_h <- diff_top202[, c("OCCP_H", "pct_couples", "occ_rank", "Census_Desc_Short")]
diff_h$OCCP_W <- 0
diff_h$Wife_Occ <- "Base_Rate"
names(diff_h)[3] <- "Husband_Occ_Rank"
names(diff_h)[4] <- "Husband_Occ"
diff_final_h <- rbind(diff_h, final_h[final_h$OCCP_H %in% diff_h$OCCP_H, 
                                      c("OCCP_H", "OCCP_W", "pct_couples", "Husband_Occ_Rank", "Husband_Occ", "Wife_Occ")])
write.csv(diff_final_h, "Data\\diff_final_h.csv", row.names=FALSE)


# create appendix dataset: top 10 most common pairings per occupation 
a1 <- setorder(setDT(final_w), OCCP_H, -pct_couples)[, head(.SD, 10), by = OCCP_H]
a2 <- setorder(setDT(final_h), OCCP_W, -pct_couples)[, head(.SD, 10), by = OCCP_W]
a1$ref_person <- "Husband"
a2$ref_person <- "Wife"

setnames(a1, "Husband_Occ", "Ref_Occ")
setnames(a1, "Wife_Occ", "Spouse_Occ")
setnames(a2, "Husband_Occ", "Spouse_Occ")
setnames(a2, "Wife_Occ", "Ref_Occ")
appendix <- rbind(a1[,list(Ref_Occ, Spouse_Occ, pct_couples, ref_person)],
                  a2[,list(Ref_Occ, Spouse_Occ, pct_couples, ref_person)])

write.csv(appendix, "Data\\appendix_data.csv", row.names=FALSE)
