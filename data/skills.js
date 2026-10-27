/*
 * Skill taxonomy. Each skill has a canonical name, a category, and aliases
 * (lower-case) that are matched as whole words in resume / profile text.
 * Extend freely — the engine picks up new entries automatically.
 */
window.CA_SKILLS = [
  // ---- Programming languages
  { name: "Python", cat: "Languages", aliases: ["python", "py"] },
  { name: "Java", cat: "Languages", aliases: ["java"] },
  { name: "C++", cat: "Languages", aliases: ["c++", "cpp"] },
  { name: "C", cat: "Languages", aliases: ["c programming", "embedded c", "ansi c"] },
  { name: "C#", cat: "Languages", aliases: ["c#", "csharp", ".net"] },
  { name: "Go", cat: "Languages", aliases: ["golang", "go lang"] },
  { name: "Rust", cat: "Languages", aliases: ["rust"] },
  { name: "JavaScript", cat: "Languages", aliases: ["javascript", "js", "es6", "node.js", "nodejs"] },
  { name: "TypeScript", cat: "Languages", aliases: ["typescript"] },
  { name: "SQL", cat: "Languages", aliases: ["sql", "postgresql", "postgres", "mysql", "sqlite", "t-sql"] },
  { name: "MATLAB", cat: "Languages", aliases: ["matlab", "simulink"] },
  { name: "R", cat: "Languages", aliases: ["r programming", "rstudio", "tidyverse"] },
  { name: "Scala", cat: "Languages", aliases: ["scala"] },
  { name: "Kotlin", cat: "Languages", aliases: ["kotlin"] },
  { name: "Swift", cat: "Languages", aliases: ["swift", "swiftui"] },
  { name: "Verilog", cat: "Hardware", aliases: ["verilog", "systemverilog"] },
  { name: "VHDL", cat: "Hardware", aliases: ["vhdl"] },

  // ---- AI / ML / Data
  { name: "Machine Learning", cat: "AI/ML", aliases: ["machine learning", "ml", "scikit-learn", "sklearn", "xgboost"] },
  { name: "Deep Learning", cat: "AI/ML", aliases: ["deep learning", "neural network", "neural networks", "cnn", "rnn", "lstm"] },
  { name: "PyTorch", cat: "AI/ML", aliases: ["pytorch", "torch"] },
  { name: "TensorFlow", cat: "AI/ML", aliases: ["tensorflow", "keras", "tf2"] },
  { name: "NLP", cat: "AI/ML", aliases: ["nlp", "natural language processing", "transformers", "bert", "hugging face", "huggingface"] },
  { name: "LLMs & GenAI", cat: "AI/ML", aliases: ["llm", "llms", "large language model", "generative ai", "genai", "gpt", "claude", "prompt engineering", "fine-tuning", "fine tuning"] },
  { name: "RAG", cat: "AI/ML", aliases: ["rag", "retrieval augmented generation", "retrieval-augmented", "vector database", "vector db", "langchain", "llamaindex", "embeddings"] },
  { name: "Computer Vision", cat: "AI/ML", aliases: ["computer vision", "opencv", "image processing", "object detection", "yolo"] },
  { name: "MLOps", cat: "AI/ML", aliases: ["mlops", "mlflow", "kubeflow", "model deployment", "model serving", "sagemaker", "vertex ai"] },
  { name: "CUDA / GPU", cat: "AI/ML", aliases: ["cuda", "gpu programming", "gpgpu", "tensorrt"] },
  { name: "Reinforcement Learning", cat: "AI/ML", aliases: ["reinforcement learning", "rl"] },
  { name: "Statistics", cat: "Data", aliases: ["statistics", "statistical", "hypothesis testing", "regression", "a/b testing", "bayesian"] },
  { name: "Data Analysis", cat: "Data", aliases: ["data analysis", "pandas", "numpy", "data analytics", "exploratory data analysis", "eda"] },
  { name: "Data Visualization", cat: "Data", aliases: ["data visualization", "tableau", "power bi", "matplotlib", "seaborn", "d3", "plotly"] },
  { name: "Big Data", cat: "Data", aliases: ["spark", "pyspark", "hadoop", "big data", "databricks", "kafka", "flink"] },
  { name: "Data Engineering", cat: "Data", aliases: ["data engineering", "etl", "elt", "airflow", "dbt", "data pipeline", "data pipelines", "snowflake", "bigquery", "redshift"] },

  // ---- Software engineering
  { name: "System Design", cat: "Software", aliases: ["system design", "distributed systems", "scalability", "high availability", "microservices", "software architecture"] },
  { name: "Data Structures & Algorithms", cat: "Software", aliases: ["data structures", "algorithms", "leetcode", "competitive programming"] },
  { name: "REST APIs", cat: "Software", aliases: ["restful", "rest api", "api design", "graphql", "grpc", "fastapi", "flask", "django", "spring boot", "express"] },
  { name: "Frontend (React)", cat: "Software", aliases: ["react", "reactjs", "react.js", "next.js", "nextjs", "angular", "vue", "vue.js", "html", "css", "tailwind"] },
  { name: "Mobile Development", cat: "Software", aliases: ["android", "ios", "react native", "flutter", "mobile development"] },
  { name: "Testing & QA", cat: "Software", aliases: ["unit testing", "pytest", "junit", "selenium", "test automation", "tdd", "jest", "cypress", "playwright"] },
  { name: "Git", cat: "Software", aliases: ["git", "github", "gitlab", "bitbucket", "version control"] },
  { name: "Agile / Scrum", cat: "Software", aliases: ["agile", "scrum", "kanban", "jira", "sprint"] },
  { name: "Databases (NoSQL)", cat: "Software", aliases: ["mongodb", "redis", "cassandra", "dynamodb", "nosql", "elasticsearch"] },

  // ---- Cloud / DevOps
  { name: "AWS", cat: "Cloud", aliases: ["aws", "amazon web services", "ec2", "s3", "lambda"] },
  { name: "Azure", cat: "Cloud", aliases: ["azure", "microsoft azure"] },
  { name: "GCP", cat: "Cloud", aliases: ["gcp", "google cloud", "google cloud platform"] },
  { name: "Docker", cat: "Cloud", aliases: ["docker", "containers", "containerization", "dockerfile"] },
  { name: "Kubernetes", cat: "Cloud", aliases: ["kubernetes", "k8s", "helm", "eks", "gke", "aks"] },
  { name: "CI/CD", cat: "Cloud", aliases: ["ci/cd", "cicd", "jenkins", "github actions", "gitlab ci", "continuous integration", "continuous delivery"] },
  { name: "Infrastructure as Code", cat: "Cloud", aliases: ["terraform", "cloudformation", "ansible", "pulumi", "infrastructure as code", "iac"] },
  { name: "Linux", cat: "Cloud", aliases: ["linux", "unix", "bash", "shell scripting", "ubuntu"] },
  { name: "Observability", cat: "Cloud", aliases: ["prometheus", "grafana", "observability", "monitoring", "datadog", "splunk", "opentelemetry"] },

  // ---- Security
  { name: "Cybersecurity", cat: "Security", aliases: ["cybersecurity", "cyber security", "information security", "infosec", "security"] },
  { name: "Network Security", cat: "Security", aliases: ["network security", "firewall", "intrusion detection", "vpn", "zero trust"] },
  { name: "Penetration Testing", cat: "Security", aliases: ["penetration testing", "pentest", "pen testing", "ethical hacking", "burp suite", "metasploit", "owasp"] },
  { name: "Cryptography", cat: "Security", aliases: ["cryptography", "encryption", "pki", "tls"] },
  { name: "Security Compliance", cat: "Security", aliases: ["nist", "iso 27001", "soc 2", "gdpr", "hipaa", "compliance", "risk assessment"] },

  // ---- Networking / Comms
  { name: "Computer Networking", cat: "Networking", aliases: ["tcp/ip", "networking", "routing", "switching", "ccna", "bgp", "ospf", "sdn"] },
  { name: "Wireless Communications", cat: "Networking", aliases: ["wireless", "5g", "lte", "wi-fi", "wifi", "802.11", "rf", "antenna", "mimo", "ofdm"] },
  { name: "Signal Processing", cat: "Networking", aliases: ["signal processing", "dsp", "digital signal processing", "fft", "filter design"] },

  // ---- Embedded / Hardware / EE
  { name: "Embedded Systems", cat: "Hardware", aliases: ["embedded systems", "embedded", "microcontroller", "microcontrollers", "arm cortex", "stm32", "arduino", "esp32", "firmware", "rtos", "freertos"] },
  { name: "FPGA", cat: "Hardware", aliases: ["fpga", "xilinx", "vivado", "quartus", "intel fpga"] },
  { name: "VLSI / ASIC", cat: "Hardware", aliases: ["vlsi", "asic", "rtl design", "physical design", "synthesis", "cadence", "synopsys", "timing analysis"] },
  { name: "PCB Design", cat: "Hardware", aliases: ["pcb", "pcb design", "altium", "kicad", "eagle", "orcad"] },
  { name: "Circuit Design", cat: "Hardware", aliases: ["circuit design", "analog design", "analog circuits", "spice", "ltspice", "mixed-signal"] },
  { name: "IoT", cat: "Hardware", aliases: ["iot", "internet of things", "mqtt", "zigbee", "lora", "lorawan", "ble", "bluetooth low energy"] },
  { name: "Robotics", cat: "Hardware", aliases: ["robotics", "ros", "ros2", "slam", "motion planning", "kinematics"] },
  { name: "Control Systems", cat: "Hardware", aliases: ["control systems", "control theory", "pid", "mpc", "model predictive control", "state space"] },

  // ---- Power & Energy
  { name: "Power Systems", cat: "Power & Energy", aliases: ["power systems", "power system", "load flow", "power flow", "transmission systems", "distribution systems", "etap", "pscad", "psse", "pss/e"] },
  { name: "Power Electronics", cat: "Power & Energy", aliases: ["power electronics", "inverter", "inverters", "converter", "dc-dc", "motor drives", "plecs"] },
  { name: "Renewable Energy", cat: "Power & Energy", aliases: ["renewable energy", "solar", "photovoltaic", "pv", "wind energy", "battery storage", "energy storage", "bess"] },
  { name: "Smart Grid", cat: "Power & Energy", aliases: ["smart grid", "microgrid", "der", "distributed energy", "demand response", "scada"] },
  { name: "Electric Vehicles", cat: "Power & Energy", aliases: ["electric vehicle", "electric vehicles", "ev charging", "battery management", "bms"] },

  // ---- Product / Business / Soft
  { name: "Product Management", cat: "Product", aliases: ["product management", "product manager", "roadmap", "product roadmap", "user stories", "prd", "go-to-market"] },
  { name: "UX Research", cat: "Product", aliases: ["user research", "ux research", "usability testing", "figma", "wireframing", "ux", "ui/ux"] },
  { name: "Project Management", cat: "Product", aliases: ["project management", "pmp", "prince2", "stakeholder management", "program management"] },
  { name: "Technical Writing", cat: "Product", aliases: ["technical writing", "documentation", "technical documentation", "specifications"] },
  { name: "Leadership", cat: "Leadership", aliases: ["led", "leadership", "team lead", "managed a team", "mentored", "mentoring", "chair", "president", "founder", "co-founder", "head of", "captain"] },
  { name: "Communication", cat: "Leadership", aliases: ["presented", "presentation", "public speaking", "keynote", "workshop", "taught", "teaching", "speaker", "communication"] },
  { name: "Research", cat: "Research", aliases: ["research", "publication", "publications", "published", "journal", "conference paper", "ieee transactions", "thesis", "patent"] },
  { name: "Standards & Compliance", cat: "Research", aliases: ["ieee standard", "standards", "iso", "iec", "standardization", "working group"] },
  { name: "AI Ethics & Responsible AI", cat: "AI/ML", aliases: ["responsible ai", "ai ethics", "fairness", "explainability", "xai", "ai governance", "ieee 7000"] }
];
