# Variable Operationalization Table

## Overview

This document maps each research question to its corresponding variables, survey items, measurement scales, and planned statistical analysis.

---

## Independent Variables (Demographics)

| Variable | Survey Item | Type | Categories |
|----------|-------------|------|------------|
| Gender | A1 | Nominal | Male, Female, Prefer not to say |
| Year of study | A2 | Ordinal | 1st, 2nd, 3rd, 4th year |
| Academic discipline | A3 | Nominal | IT, Business, Engineering, etc. |
| English proficiency | A4 | Ordinal | Beginner, Intermediate, Upper-Int, Advanced |
| Writing courses completed | A5 | Ordinal | None, 1, 2-3, 4+ |

---

## RQ1: GenAI Usage Patterns

| Variable | Survey Items | Measurement | Analysis |
|----------|-------------|-------------|----------|
| Awareness | B1 | Nominal (3 levels) | Frequency, percentage |
| Tools used | B2 | Nominal (multiple select) | Frequency, percentage |
| Usage frequency | B3 | Ordinal (5 levels) | Frequency, mean, SD |
| Duration of use | B4 | Ordinal (4 levels) | Frequency, percentage |
| Writing tasks | B5 | Nominal (multiple select) | Frequency, percentage, ranking |
| Writing types | B6 | Nominal (multiple select) | Frequency, percentage |
| AI-generated text proportion | B7 | Ordinal (5 levels) | Frequency, mean, SD |

**Planned Analysis:**
- Descriptive statistics (frequencies, percentages)
- Cross-tabulation with demographics
- Chi-square tests for group differences

---

## RQ2: Perceived Benefits

| Construct | Survey Items | # Items | Scale | Reliability Target |
|-----------|-------------|---------|-------|-------------------|
| Language Improvement | C1.1–C1.6 | 6 | 5-point Likert | Cronbach's α ≥ 0.70 |
| Writing Process | C2.1–C2.6 | 6 | 5-point Likert | Cronbach's α ≥ 0.70 |
| Learning & Confidence | C3.1–C3.5 | 5 | 5-point Likert | Cronbach's α ≥ 0.70 |
| **Total Benefits Scale** | **C1–C3** | **17** | **5-point Likert** | **Cronbach's α ≥ 0.70** |

**Composite Score Calculation:**
- Sub-scale score = Mean of items within each construct
- Total benefits score = Mean of all 17 items

**Planned Analysis:**
- Descriptive statistics (mean, SD for each item and construct)
- Cronbach's alpha for reliability
- Independent t-test: Compare benefits by gender, year group
- One-way ANOVA: Compare benefits by discipline, English proficiency
- Post-hoc Tukey HSD for significant ANOVA results

---

## RQ3: Plagiarism Awareness & Concerns

| Construct | Survey Items | # Items | Scale | Reliability Target |
|-----------|-------------|---------|-------|-------------------|
| Plagiarism Understanding | D1.1–D1.6 | 6 | 5-point Likert | Cronbach's α ≥ 0.70 |
| Ethical Concerns | D2.1–D2.6 | 6 | 5-point Likert | Cronbach's α ≥ 0.70 |
| Behavioral Intentions | D3.1–D3.4 | 4 | 5-point Likert | Cronbach's α ≥ 0.70 |
| **Total Plagiarism Concerns** | **D1–D3** | **16** | **5-point Likert** | **Cronbach's α ≥ 0.70** |

**Note on Reverse-Coded Items:**
- D1.3 (grammar correction is acceptable) — reverse code for "plagiarism concern" composite
- D1.5 (translation is acceptable) — reverse code for "plagiarism concern" composite
- D3.1 (would use even if prohibited) — reverse code for "ethical compliance" analysis

**Planned Analysis:**
- Descriptive statistics (mean, SD for each item and construct)
- Cronbach's alpha for reliability
- Independent t-test / ANOVA for group comparisons
- Pearson correlation between benefits score and plagiarism concern score

---

## RQ4: Demographic Differences

| Comparison | IV | DVs | Test |
|------------|-----|-----|------|
| Gender differences | Gender (2 groups*) | Benefits, Concerns | Independent t-test |
| Year of study | Year (4 groups) | Benefits, Concerns, Usage | One-way ANOVA |
| English proficiency | Proficiency (4 levels) | Benefits, Concerns, Usage | One-way ANOVA |
| Academic discipline | Discipline (grouped) | Benefits, Concerns, Usage | One-way ANOVA |

*\* "Prefer not to say" excluded from t-test if n < 30*

**Effect Size Reporting:**
- Cohen's d for t-tests
- Eta-squared (η²) for ANOVA
- Report as small (0.01), medium (0.06), or large (0.14)

---

## Overall Perceptions (Section E)

| Item | Construct Measured | Analysis |
|------|-------------------|----------|
| E1 | Perceived usefulness | Descriptive |
| E2 | Future relevance | Descriptive |
| E3 | Institutional responsibility | Descriptive |
| E4 | Fairness concern | Descriptive |
| E5 | Overall risk-benefit assessment | Descriptive + correlation with C & D scores |

---

## Measurement Validity & Reliability Plan

| Step | Action | Threshold |
|------|--------|-----------|
| Content validity | Expert review by 2-3 academics | Qualitative feedback |
| Face validity | Pilot test with 15-20 students | Comprehension check |
| Construct reliability | Cronbach's alpha | α ≥ 0.70 |
| Item analysis | Item-total correlation | r ≥ 0.30 |
| Normality check | Skewness & kurtosis | -2 to +2 |
