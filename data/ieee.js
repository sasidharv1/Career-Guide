/*
 * IEEE knowledge assets used for recommendations.
 * This is a starter catalog built from public IEEE entry points. When IEEE
 * provides a course/webinar catalog (or an IEEE Xplore API key), replace or
 * extend these lists — the UI reads everything from here.
 */
(function () {
  const X = (q, extra) =>
    "https://ieeexplore.ieee.org/search/searchresult.jsp?queryText=" + encodeURIComponent(q) + (extra || "");

  window.CA_IEEE = {
    links: {
      learning: "https://iln.ieee.org",
      xplore: "https://ieeexplore.ieee.org",
      standards: "https://standards.ieee.org",
      collabratec: "https://ieee-collabratec.ieee.org",
      jobs: "https://jobs.ieee.org",
      events: "https://events.vtools.ieee.org",
      yp: "https://yp.ieee.org",
      tv: "https://ieeetv.ieee.org",
      spectrum: "https://spectrum.ieee.org",
      entrepreneurship: "https://entrepreneurship.ieee.org",
      wie: "https://wie.ieee.org"
    },
    xplore: X,
    xploreStandards: (q) => X(q, "&refinements=ContentType:Standards"),
    googleSite: (site, q) => "https://www.google.com/search?q=" + encodeURIComponent("site:" + site + " " + q),

    // Society / community that best fits each skill category
    societies: {
      "Languages": { name: "IEEE Computer Society", url: "https://www.computer.org" },
      "Software": { name: "IEEE Computer Society", url: "https://www.computer.org" },
      "AI/ML": { name: "IEEE Computational Intelligence Society", url: "https://cis.ieee.org" },
      "Data": { name: "IEEE Signal Processing Society", url: "https://signalprocessingsociety.org" },
      "Cloud": { name: "IEEE Computer Society", url: "https://www.computer.org" },
      "Security": { name: "IEEE Cybersecurity", url: "https://cybersecurity.ieee.org" },
      "Networking": { name: "IEEE Communications Society", url: "https://www.comsoc.org" },
      "Hardware": { name: "IEEE Circuits and Systems Society", url: "https://ieee-cas.org" },
      "Power & Energy": { name: "IEEE Power & Energy Society", url: "https://ieee-pes.org" },
      "Product": { name: "IEEE Technology & Engineering Management Society", url: "https://www.ieee-tems.org" },
      "Leadership": { name: "IEEE Young Professionals", url: "https://yp.ieee.org" },
      "Research": { name: "IEEE Standards Association", url: "https://standards.ieee.org" }
    },

    // Skill-specific overrides (more precise society/community)
    skillSociety: {
      "Robotics": { name: "IEEE Robotics and Automation Society", url: "https://www.ieee-ras.org" },
      "Control Systems": { name: "IEEE Control Systems Society", url: "https://ieeecss.org" },
      "Power Electronics": { name: "IEEE Power Electronics Society", url: "https://www.ieee-pels.org" },
      "Electric Vehicles": { name: "IEEE Transportation Electrification Community", url: "https://tec.ieee.org" },
      "Smart Grid": { name: "IEEE Smart Grid", url: "https://smartgrid.ieee.org" },
      "IoT": { name: "IEEE Internet of Things", url: "https://iot.ieee.org" },
      "Signal Processing": { name: "IEEE Signal Processing Society", url: "https://signalprocessingsociety.org" },
      "Communication": { name: "IEEE Professional Communication Society", url: "https://procomm.ieee.org" },
      "Product Management": { name: "IEEE Entrepreneurship", url: "https://entrepreneurship.ieee.org" }
    },

    // Relevant IEEE standards per skill (opened as IEEE Xplore standards searches)
    standards: {
      "Wireless Communications": ["IEEE 802.11", "IEEE 802.15.4"],
      "Computer Networking": ["IEEE 802.3", "IEEE 802.1Q"],
      "Network Security": ["IEEE 802.1X", "IEEE 802.1AE"],
      "Verilog": ["IEEE 1800 SystemVerilog", "IEEE 1364 Verilog"],
      "VHDL": ["IEEE 1076 VHDL"],
      "VLSI / ASIC": ["IEEE 1149.1 JTAG", "IEEE 1801 low power"],
      "FPGA": ["IEEE 1149.1 JTAG", "IEEE 1800 SystemVerilog"],
      "Power Systems": ["IEEE 1547", "IEEE C37.118"],
      "Smart Grid": ["IEEE 2030", "IEEE 2030.5"],
      "Renewable Energy": ["IEEE 1547", "IEEE 2030.2"],
      "IoT": ["IEEE 2413", "IEEE 802.15.4"],
      "AI Ethics & Responsible AI": ["IEEE 7000", "IEEE 7001"],
      "Machine Learning": ["IEEE 7000", "IEEE 2801"],
      "LLMs & GenAI": ["IEEE 7000", "IEEE 7001"],
      "System Design": ["ISO/IEC/IEEE 42010", "ISO/IEC/IEEE 12207"],
      "Testing & QA": ["ISO/IEC/IEEE 29119", "IEEE 1012"],
      "C": ["IEEE 754 floating point"],
      "C++": ["IEEE 754 floating point"],
      "Embedded Systems": ["IEEE 1588 precision time", "IEEE 754 floating point"],
      "Technical Writing": ["ISO/IEC/IEEE 26514"],
      "Project Management": ["ISO/IEC/IEEE 16326"],
      "Security Compliance": ["IEEE 1686", "IEEE 2030.102.1"]
    }
  };
})();
