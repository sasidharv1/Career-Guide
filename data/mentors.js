/*
 * SAMPLE mentors — fictional people, shown with a "Sample" badge so the demo
 * works out of the box. For the summit, set MENTOR_SHEET_CSV in config.js to
 * a published Google Sheet (filled by an opt-in Google Form) and these are
 * replaced automatically.
 *
 * Google Sheet columns expected (header row, any order):
 *   name, title, organization, grade, location, skills, roles, contact
 *   - skills: comma/semicolon separated, using names from skills.js
 *   - roles:  comma/semicolon separated role ids from roles.js (optional)
 *   - contact: a URL (Collabratec / LinkedIn) or mailto: link
 */
window.CA_SAMPLE_MENTORS = [
  { name: "Ananya Rao", title: "Staff ML Engineer", organization: "Cloud platform company", grade: "IEEE Senior Member", location: "Atlanta, GA",
    skills: ["Machine Learning", "MLOps", "Deep Learning", "Python", "Kubernetes"], roles: ["ml", "genai"], contact: "" },
  { name: "Marcus Bell", title: "Principal Software Engineer", organization: "Fintech", grade: "IEEE Member", location: "Remote",
    skills: ["System Design", "Java", "AWS", "REST APIs", "Leadership"], roles: ["swe", "cloud"], contact: "" },
  { name: "Lucía Fernández", title: "Data Science Manager", organization: "Healthcare analytics", grade: "IEEE Senior Member", location: "Austin, TX",
    skills: ["Statistics", "Machine Learning", "SQL", "Data Visualization", "Communication"], roles: ["ds", "de"], contact: "" },
  { name: "Kwame Mensah", title: "Grid Modernization Lead", organization: "Electric utility", grade: "IEEE PES Member", location: "Charlotte, NC",
    skills: ["Power Systems", "Smart Grid", "Renewable Energy", "Standards & Compliance"], roles: ["power"], contact: "" },
  { name: "Mei Lin", title: "Senior FPGA Design Engineer", organization: "Semiconductor company", grade: "IEEE Member", location: "San Jose, CA",
    skills: ["Verilog", "FPGA", "VLSI / ASIC", "Signal Processing"], roles: ["hw", "telecom"], contact: "" },
  { name: "Daniel Okafor", title: "Security Architect", organization: "Enterprise software", grade: "IEEE Senior Member", location: "Washington, DC",
    skills: ["Cybersecurity", "Network Security", "Security Compliance", "Cryptography", "AWS"], roles: ["sec", "cloud"], contact: "" },
  { name: "Priya Venkatesh", title: "Group Product Manager", organization: "Consumer tech", grade: "IEEE Member", location: "Seattle, WA",
    skills: ["Product Management", "UX Research", "Leadership", "Data Analysis"], roles: ["pm"], contact: "" },
  { name: "Tomás Herrera", title: "Robotics Software Lead", organization: "Autonomous systems startup", grade: "IEEE RAS Member", location: "Pittsburgh, PA",
    skills: ["Robotics", "C++", "Control Systems", "Computer Vision", "Reinforcement Learning"], roles: ["robotics", "embedded"], contact: "" },
  { name: "Sarah Kim", title: "Embedded Firmware Manager", organization: "Medical devices", grade: "IEEE Senior Member", location: "Minneapolis, MN",
    skills: ["Embedded Systems", "C", "IoT", "Testing & QA", "Leadership"], roles: ["embedded"], contact: "" },
  { name: "Rahul Iyer", title: "Applied AI Scientist", organization: "Research lab", grade: "IEEE Member", location: "Boston, MA",
    skills: ["LLMs & GenAI", "RAG", "NLP", "Research", "PyTorch"], roles: ["genai", "ml"], contact: "" }
];
