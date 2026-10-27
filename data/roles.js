/*
 * Target roles. Skill weights: 3 = core, 2 = important, 1 = nice to have.
 * Skill names must match the canonical names in skills.js.
 * "jobQuery" is used to build IEEE Job Site / search links.
 */
window.CA_ROLES = [
  {
    id: "swe", title: "Software Engineer", jobQuery: "software engineer",
    skills: { "Data Structures & Algorithms": 3, "System Design": 3, "Git": 2, "REST APIs": 2, "SQL": 2,
      "Testing & QA": 2, "Python": 1, "Java": 1, "JavaScript": 1, "Docker": 1, "CI/CD": 1, "AWS": 1, "Agile / Scrum": 1, "Linux": 1 }
  },
  {
    id: "ml", title: "Machine Learning Engineer", jobQuery: "machine learning engineer",
    skills: { "Python": 3, "Machine Learning": 3, "Deep Learning": 3, "PyTorch": 2, "MLOps": 2, "Statistics": 2,
      "SQL": 1, "Docker": 2, "Kubernetes": 1, "CUDA / GPU": 1, "System Design": 1, "AWS": 1, "Git": 1, "TensorFlow": 1 }
  },
  {
    id: "genai", title: "AI / GenAI Engineer", jobQuery: "generative AI engineer",
    skills: { "Python": 3, "LLMs & GenAI": 3, "RAG": 3, "NLP": 2, "REST APIs": 2, "Deep Learning": 2, "PyTorch": 1,
      "Docker": 1, "AWS": 1, "AI Ethics & Responsible AI": 1, "Testing & QA": 1, "System Design": 1, "Git": 1 }
  },
  {
    id: "ds", title: "Data Scientist", jobQuery: "data scientist",
    skills: { "Python": 3, "Statistics": 3, "Machine Learning": 3, "SQL": 3, "Data Analysis": 2, "Data Visualization": 2,
      "R": 1, "Big Data": 1, "Deep Learning": 1, "Communication": 1, "Git": 1 }
  },
  {
    id: "de", title: "Data Engineer", jobQuery: "data engineer",
    skills: { "SQL": 3, "Python": 3, "Data Engineering": 3, "Big Data": 2, "AWS": 2, "Docker": 1, "Databases (NoSQL)": 1,
      "Scala": 1, "CI/CD": 1, "Linux": 1, "Git": 1, "Infrastructure as Code": 1 }
  },
  {
    id: "cloud", title: "Cloud / DevOps Engineer", jobQuery: "devops engineer",
    skills: { "Linux": 3, "AWS": 3, "Docker": 3, "Kubernetes": 3, "CI/CD": 2, "Infrastructure as Code": 2, "Observability": 2,
      "Python": 1, "Go": 1, "Computer Networking": 1, "Git": 1, "Azure": 1, "GCP": 1 }
  },
  {
    id: "sec", title: "Cybersecurity Engineer", jobQuery: "cybersecurity engineer",
    skills: { "Cybersecurity": 3, "Network Security": 3, "Computer Networking": 2, "Linux": 2, "Penetration Testing": 2,
      "Cryptography": 2, "Security Compliance": 2, "Python": 1, "AWS": 1, "Observability": 1 }
  },
  {
    id: "embedded", title: "Embedded Systems Engineer", jobQuery: "embedded software engineer",
    skills: { "C": 3, "Embedded Systems": 3, "C++": 2, "IoT": 1, "Linux": 2, "Circuit Design": 1, "PCB Design": 1,
      "Control Systems": 1, "Python": 1, "Git": 1, "Testing & QA": 1, "Wireless Communications": 1 }
  },
  {
    id: "hw", title: "VLSI / FPGA Design Engineer", jobQuery: "FPGA design engineer",
    skills: { "Verilog": 3, "VLSI / ASIC": 3, "FPGA": 3, "VHDL": 2, "Circuit Design": 2, "Python": 1, "C": 1,
      "Linux": 1, "Signal Processing": 1, "Testing & QA": 1 }
  },
  {
    id: "power", title: "Power Systems Engineer", jobQuery: "power systems engineer",
    skills: { "Power Systems": 3, "Power Electronics": 2, "Smart Grid": 2, "Renewable Energy": 2, "MATLAB": 2,
      "Control Systems": 2, "Python": 1, "Standards & Compliance": 1, "Electric Vehicles": 1, "Data Analysis": 1 }
  },
  {
    id: "robotics", title: "Robotics Engineer", jobQuery: "robotics engineer",
    skills: { "Robotics": 3, "C++": 3, "Python": 2, "Control Systems": 3, "Computer Vision": 2, "Embedded Systems": 1,
      "Linux": 1, "Machine Learning": 1, "Reinforcement Learning": 1, "MATLAB": 1, "Git": 1 }
  },
  {
    id: "telecom", title: "Wireless / RF Engineer", jobQuery: "wireless RF engineer",
    skills: { "Wireless Communications": 3, "Signal Processing": 3, "MATLAB": 2, "Computer Networking": 2, "Python": 1,
      "C++": 1, "FPGA": 1, "Standards & Compliance": 1, "Circuit Design": 1 }
  },
  {
    id: "pm", title: "Technical Product Manager", jobQuery: "technical product manager",
    skills: { "Product Management": 3, "Communication": 3, "Leadership": 2, "Agile / Scrum": 2, "UX Research": 2,
      "Data Analysis": 2, "SQL": 1, "System Design": 1, "Project Management": 1, "Technical Writing": 1 }
  }
];
