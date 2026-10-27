/* Fictional sample profile for the "Try a sample profile" button. */
window.CA_SAMPLE = {
  name: "Alex Rivera",
  targetRoleId: "ml",
  resumeText: `Alex Rivera
alex.rivera@example.com | linkedin.com/in/alexrivera-sample | github.com/alexrivera-sample
EXPERIENCE
Software Engineer II, Northwind Analytics (2022 – Present)
- Built a Python and FastAPI recommendation service handling 2M requests/day, reducing p95 latency by 35%
- Deployed scikit-learn and PyTorch models with Docker on AWS; automated CI/CD with GitHub Actions
- Led a team of 4 engineers to migrate ETL pipelines to Airflow, saving $40k per year
- Mentored 3 interns and presented architecture reviews to engineering leadership
Data Analyst Intern, Bright Labs (2021)
- Analyzed 5M customer records with pandas and SQL; built Tableau dashboards used by 12 teams
- Designed A/B testing framework and statistical significance reports for marketing experiments
PROJECTS
- Resume parser using NLP and Hugging Face transformers (1.2k monthly users)
- Kaggle competition: gradient boosting model with XGBoost, top 10% of 3,000 teams
- Smart home energy monitor with ESP32 and MQTT
EDUCATION
B.S. Computer Engineering, Georgia Institute of Technology, 2021
SKILLS
Python, SQL, Java, Docker, AWS, Git, PyTorch, scikit-learn, pandas, React, Linux
ACTIVITIES & PUBLICATIONS
IEEE Atlanta Section Young Professionals volunteer; organized 3 technical workshops for 150+ members
"Lightweight resume parsing with transformers", IEEE SoutheastCon 2024 proceedings
Speaker, PyData Atlanta meetup: "Shipping ML to production"`,
  github: {
    user: "alexrivera-sample", name: "Alex Rivera", avatar: "", url: "", bio: "ML + backend engineer", followers: 48,
    publicRepos: 23, ownRepos: 17, stars: 64, activeRepos: 7,
    languages: { "Python": 9, "Jupyter Notebook": 4, "TypeScript": 2, "C++": 1, "Dockerfile": 1 },
    topRepos: [
      { name: "resume-parser-nlp", url: "", stars: 41, lang: "Python", desc: "Transformer-based resume section and skill extraction" },
      { name: "kaggle-churn-xgb", url: "", stars: 12, lang: "Jupyter Notebook", desc: "Top-10% churn prediction solution" },
      { name: "esp32-energy-monitor", url: "", stars: 7, lang: "C++", desc: "IoT home energy monitor with MQTT dashboard" }
    ],
    text: "resume parser nlp transformers hugging face\nkaggle churn xgboost machine learning\nesp32 energy monitor iot mqtt\nfastapi docker template",
    sample: true
  }
};
