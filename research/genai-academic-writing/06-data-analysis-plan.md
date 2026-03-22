# Data Analysis Plan

## Overview

This document provides a step-by-step guide for analyzing the questionnaire data using SPSS (or equivalent).

---

## Step 0: Data Preparation

### 0.1 Data Cleaning
- Remove incomplete responses (< 80% completion)
- Check for straight-lining (same answer for all Likert items) — flag and review
- Check for impossible combinations (e.g., "Not aware of GenAI" but answered usage questions)
- Verify all responses are within valid ranges

### 0.2 Coding
| Variable | Coding |
|----------|--------|
| Gender | 1 = Male, 2 = Female, 3 = Prefer not to say |
| Year | 1 = Freshman, 2 = Sophomore, 3 = Junior, 4 = Senior |
| English proficiency | 1 = Beginner, 2 = Intermediate, 3 = Upper-Int, 4 = Advanced |
| Likert items | 1–5 as marked |
| Reverse-coded items (D1.3, D1.5, D3.1) | Recode: 1→5, 2→4, 3→3, 4→2, 5→1 |

### 0.3 Compute Composite Scores
```
Language_Improvement = MEAN(C1.1, C1.2, C1.3, C1.4, C1.5, C1.6)
Writing_Process = MEAN(C2.1, C2.2, C2.3, C2.4, C2.5, C2.6)
Learning_Confidence = MEAN(C3.1, C3.2, C3.3, C3.4, C3.5)
Total_Benefits = MEAN(C1.1 to C3.5)

Plagiarism_Understanding = MEAN(D1.1, D1.2, D1.3R, D1.4, D1.5R, D1.6)
Ethical_Concerns = MEAN(D2.1, D2.2, D2.3, D2.4, D2.5, D2.6)
Behavioral_Intentions = MEAN(D3.1R, D3.2, D3.3, D3.4)
Total_Plagiarism = MEAN(D1.1 to D3.4)  [with reverse-coded items]
```

---

## Step 1: Reliability Analysis

### For Each Scale
```
SPSS: Analyze → Scale → Reliability Analysis
```

| Scale | Items | Target α |
|-------|-------|----------|
| Language Improvement (C1) | C1.1–C1.6 | ≥ 0.70 |
| Writing Process (C2) | C2.1–C2.6 | ≥ 0.70 |
| Learning & Confidence (C3) | C3.1–C3.5 | ≥ 0.70 |
| Plagiarism Understanding (D1) | D1.1–D1.6 | ≥ 0.70 |
| Ethical Concerns (D2) | D2.1–D2.6 | ≥ 0.70 |
| Behavioral Intentions (D3) | D3.1–D3.4 | ≥ 0.70 |

**Action if α < 0.70:** Check "Cronbach's alpha if item deleted" — consider removing problematic items

---

## Step 2: Descriptive Statistics

### 2.1 Demographics
- Frequency tables for A1–A5
- Bar charts for visual presentation

### 2.2 Usage Patterns (RQ1)
- Frequency and percentage for B1–B7
- Bar charts for tools used (B2), writing tasks (B5)
- Cross-tabulation: usage frequency × English proficiency

### 2.3 Perceived Benefits (RQ2)
- Mean and SD for each item (C1.1–C3.5)
- Mean and SD for each sub-scale
- Rank items by mean score (highest to lowest)
- Histogram of Total_Benefits distribution

### 2.4 Plagiarism Concerns (RQ3)
- Mean and SD for each item (D1.1–D3.4)
- Mean and SD for each sub-scale
- Rank items by mean score
- Histogram of Total_Plagiarism distribution

### 2.5 Overall Perceptions
- Mean and SD for E1–E5
- Frequency distribution per item

---

## Step 3: Normality Testing

Before parametric tests, check normality:

```
SPSS: Analyze → Descriptive Statistics → Explore → Plots → Normality plots with tests
```

| Check | Threshold | Action if Violated |
|-------|-----------|-------------------|
| Skewness | -2 to +2 | Use non-parametric alternative |
| Kurtosis | -2 to +2 | Use non-parametric alternative |
| Shapiro-Wilk (n < 50) | p > 0.05 | Normal |
| Kolmogorov-Smirnov (n ≥ 50) | p > 0.05 | Normal |

**Non-parametric alternatives:**
- t-test → Mann-Whitney U
- ANOVA → Kruskal-Wallis H

---

## Step 4: Inferential Statistics (RQ4)

### 4.1 Gender Differences
```
SPSS: Analyze → Compare Means → Independent Samples T-Test
- Grouping: Gender (Male vs Female)
- Test variables: Total_Benefits, Total_Plagiarism, sub-scales
```

Report: t-value, df, p-value, Cohen's d

### 4.2 Year of Study Differences
```
SPSS: Analyze → Compare Means → One-Way ANOVA
- Factor: Year of Study
- Dependent: Total_Benefits, Total_Plagiarism, sub-scales
- Post Hoc: Tukey HSD (if p < 0.05)
```

Report: F-value, df, p-value, η², post-hoc results

### 4.3 English Proficiency Differences
```
SPSS: Analyze → Compare Means → One-Way ANOVA
- Factor: English Proficiency Level
- Dependent: Total_Benefits, Total_Plagiarism, sub-scales
- Post Hoc: Tukey HSD
```

### 4.4 Academic Discipline Differences
```
SPSS: Analyze → Compare Means → One-Way ANOVA
- Factor: Academic Discipline (may need to group small categories)
- Dependent: Total_Benefits, Total_Plagiarism, sub-scales
```

---

## Step 5: Correlation Analysis

```
SPSS: Analyze → Correlate → Bivariate
- Variables: Total_Benefits, Total_Plagiarism, Usage_Frequency, AI_Text_Proportion
- Method: Pearson (if normal) or Spearman (if non-normal)
```

**Key correlations to examine:**
- Benefits ↔ Plagiarism concerns
- Usage frequency ↔ Benefits
- Usage frequency ↔ Plagiarism concerns
- English proficiency ↔ Benefits
- AI-generated text proportion ↔ Plagiarism concerns

---

## Step 6: Optional — Multiple Regression

**If time permits and data supports it:**

```
DV: Total_Plagiarism_Concerns
IVs: Usage_Frequency, AI_Text_Proportion, English_Proficiency, Total_Benefits
```

**Assumptions to check:**
- Linearity (scatterplots)
- Multicollinearity (VIF < 10, Tolerance > 0.1)
- Homoscedasticity (residual plots)
- Normality of residuals

---

## Reporting Guidelines

### Table Format for Likert Items
```
| Item | Mean | SD | Interpretation |
|------|------|----|----------------|
| C1.1 | 4.12 | 0.89 | Agree |
```

**Interpretation scale:**
- 1.00–1.80 = Strongly Disagree
- 1.81–2.60 = Disagree
- 2.61–3.40 = Neutral
- 3.41–4.20 = Agree
- 4.21–5.00 = Strongly Agree

### Significance Level
- p < 0.05 = Statistically significant
- p < 0.01 = Highly significant
- Always report exact p-values
- Always report effect sizes alongside p-values

---

## Required Sample Size Justification

| Test | Parameters | Minimum n |
|------|-----------|-----------|
| Independent t-test | Medium effect (d=0.5), α=0.05, power=0.80 | 64 per group |
| One-way ANOVA (4 groups) | Medium effect (f=0.25), α=0.05, power=0.80 | 45 per group |
| Correlation | Medium effect (r=0.3), α=0.05, power=0.80 | 84 total |
| Regression (4 predictors) | Medium effect (f²=0.15), α=0.05, power=0.80 | 85 total |

**Target: 200-300 respondents** to ensure adequate power across all analyses.
