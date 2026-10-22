import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");

/**
 * Extracts plain text from pdf, docx, doc, or txt files.
 * @param {Buffer} buffer File buffer
 * @param {string} originalname File name with extension
 * @returns {Promise<string>} Plain text
 */
async function extractText(buffer, originalname) {
  const ext = originalname.split(".").pop().toLowerCase();
  
  if (ext === "pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return result.text || "";
    } finally {
      await parser.destroy().catch(() => {});
    }
  } else if (ext === "docx" || ext === "doc") {
    // Note: mammoth parses docx. For doc files, it's a best-effort.
    const result = await mammoth.extractRawText({ buffer: buffer });
    return result.value || "";
  } else {
    // Fallback for .txt or other files
    return buffer.toString("utf8");
  }
}

/**
 * Parses details from plain text of a resume using heuristics and regex.
 * @param {string} text Plain text of resume
 * @param {string} originalname Original filename as a fallback for name
 * @returns {object} Parsed details
 */
function parseDetailsFromText(text, originalname) {
  const lowerText = text.toLowerCase();
  
  // 1. Email extraction
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = text.match(emailRegex) || [];
  const email = emails[0] || "";

  // 2. Phone extraction
  const phoneRegex = /(?:\+91[\-\s]?)?[6-9]\d{9}|(?:\+91[\-\s]?)?\d{5}[\-\s]?\d{5}/g;
  const phones = text.match(phoneRegex) || [];
  const cleanPhone = (p) => p.replace(/[^\d+]/g, '');
  const phone = phones[0] ? cleanPhone(phones[0]) : "";

  // 3. Name extraction
  let name = "";
  const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines.slice(0, 15)) {
    // Skip if line contains email, digits (phone/year), URLs, or colons
    if (line.includes("@") || line.match(/\d{5,}/) || /https?|www\./i.test(line) || line.includes(":")) {
      continue;
    }
    // Skip common headings and sections
    if (/resume|cv|curriculum|vitae|page|contact|profile|details|academic|record|education|experience|summary|project|skills|objective|declaration|personal/i.test(line)) {
      continue;
    }
    const words = line.split(/\s+/);
    if (words.length >= 1 && words.length <= 4 && line.length < 35) {
      name = line;
      break;
    }
  }
  // Fallback for name from email
  if (!name && email) {
    const prefix = email.split("@")[0];
    name = prefix
      .replace(/[._\-0-9]+/g, " ")
      .trim()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  // Fallback from filename
  if (!name && originalname) {
    let nameWithoutExt = originalname.split(".")[0];
    // Strip common words like 'resume', 'cv'
    nameWithoutExt = nameWithoutExt.replace(/\b(?:resume|cv)\b/gi, "");
    name = nameWithoutExt
      .replace(/[._\-0-9\(\)]+/g, " ")
      .trim()
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // 4. Skills extraction
  const SKILLS_DICT = [
    "React", "React.js", "ReactJS", "Node", "Node.js", "NodeJS", "Express", "Express.js", "MongoDB", "SQL", "MySQL", "PostgreSQL",
    "JavaScript", "TypeScript", "HTML", "CSS", "Python", "Java", "C++", "C#", "Ruby", "PHP", "Laravel", "Swift", "Kotlin",
    "Flutter", "React Native", "Angular", "Vue", "Vue.js", "Next.js", "Docker", "Kubernetes", "AWS", "Azure", "GCP",
    "Git", "GitHub", "Redux", "GraphQL", "REST API", "Bootstrap", "Tailwind", "Tailwind CSS", "UI/UX", "Figma",
    "Machine Learning", "Data Science", "Deep Learning", "TensorFlow", "PyTorch", "Django", "Flask", "Spring Boot"
  ];
  
  const matchedSkills = [];
  SKILLS_DICT.forEach(skill => {
    const escapedSkill = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedSkill}\\b`, "i");
    const isCPlusPlus = skill.toLowerCase() === "c++";
    const matched = isCPlusPlus ? lowerText.includes("c++") : regex.test(lowerText);
    if (matched) {
      matchedSkills.push(skill);
    }
  });

  // 5. Location extraction
  const CITIES_DICT = [
    "Mumbai", "Delhi", "Bangalore", "Bengaluru", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata", "Surat", "Pune", "Jaipur",
    "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Visakhapatnam", "Pimpri-Chinchwad", "Patna", "Vadodara",
    "Ghaziabad", "Ludhiana", "Agra", "Nashik", "Faridabad", "Meerut", "Rajkot", "Kalyan-Dombivli", "Vasai-Virar", "Varanasi",
    "Srinagar", "Aurangabad", "Dhanbad", "Amritsar", "Navi Mumbai", "Allahabad", "Ranchi", "Howrah", "Coimbatore", "Jabalpur",
    "Gwalior", "Vijayawada", "Jodhpur", "Madurai", "Raipur", "Kota", "Guwahati", "Chandigarh", "Solapur", "Hubli-Dharwad",
    "Bareilly", "Moradabad", "Mysore", "Gurgaon", "Gurugram", "Noida", "Aligarh", "Jalandhar", "Tiruchirappalli", "Bhubaneswar",
    "Salem", "Mira-Bhayandar", "Warangal", "Guntur", "Bhiwandi", "Saharanpur", "Gorakhpur", "Bikaner", "Amravati"
  ];
  
  let location = "";
  for (const city of CITIES_DICT) {
    const regex = new RegExp(`\\b${city}\\b`, "i");
    if (regex.test(lowerText)) {
      location = city;
      break;
    }
  }

  // 6. Experience extraction
  let experience = "";
  const expRegexes = [
    /(\d+(?:\.\d+)?)\s*(?:years?|yrs?)(?:\s*of)?\s*(?:experience|exp)/i,
    /(?:experience|exp)(?:\s*of)?\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,
    /(\d+(?:\.\d+)?)\+\s*(?:years?|yrs?)(?:\s*experience)?/i
  ];
  for (const rx of expRegexes) {
    const match = text.match(rx);
    if (match) {
      experience = `${match[1]} Years`;
      break;
    }
  }
  if (!experience) {
    // Default fallback
    experience = "1 Year";
  }

  // 7. Highest Qualification
  const DEGREES = ["B.Tech", "M.Tech", "B.E.", "M.E.", "B.Sc", "M.Sc", "BCA", "MCA", "B.Com", "M.Com", "BBA", "MBA", "Ph.D", "Diploma"];
  let education = "";
  for (const deg of DEGREES) {
    const escaped = deg.replace(/\./g, "\\.?");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(text)) {
      education = deg;
      break;
    }
  }

  // 8. Role / Position
  const ROLES = [
    "Frontend Developer", "Frontend Engineer", "Backend Developer", "Backend Engineer", "Full Stack Developer", "Full Stack Engineer",
    "Software Developer", "Software Engineer", "Web Developer", "MERN Stack Developer", "Node.js Developer", "React Developer",
    "Java Developer", "Python Developer", "Data Scientist", "UI/UX Designer", "Product Manager", "DevOps Engineer", "QA Engineer",
    "Android Developer", "iOS Developer"
  ];
  let role = "";
  for (const r of ROLES) {
    const regex = new RegExp(`\\b${r.replace(/\./g, "\\.?")}\\b`, "i");
    if (regex.test(text)) {
      role = r;
      break;
    }
  }

  // 9. Company
  let company = "";
  const compPatterns = [
    /worked\s+at\s+([A-Z][a-zA-Z0-9\s\.\,\-\&]+?)(?:\s+as|\s+from|\.|\,|\n|\r)/,
    /employer:\s*([A-Z][a-zA-Z0-9\s\.\,\-\&]+)/i,
    /company:\s*([A-Z][a-zA-Z0-9\s\.\,\-\&]+)/i,
    /(?:software engineer|developer|engineer|analyst)\s+at\s+([A-Z][a-zA-Z0-9\s\.\,\-\&]+?)(?:\s+[\(\-\d]|\s+from|\.|\,|\n|\r)/i
  ];
  for (const rx of compPatterns) {
    const match = text.match(rx);
    if (match && match[1]) {
      company = match[1].trim();
      break;
    }
  }

  return {
    name,
    email,
    phone,
    skills: matchedSkills,
    role,
    company,
    location,
    experience,
    education,
  };
}

/**
 * Main parser method
 * @param {Buffer} buffer File buffer
 * @param {string} originalname Original filename
 * @returns {Promise<object>} Parsed details
 */
export async function parseResumeFromBuffer(buffer, originalname) {
  try {
    const text = await extractText(buffer, originalname);
    return parseDetailsFromText(text, originalname);
  } catch (error) {
    console.error("Resume Parser error:", error);
    try {
      const fs = require("fs");
      fs.writeFileSync("parser_error.log", `Error parsing ${originalname}:\n${error.stack || error.message || String(error)}`);
    } catch (e) {
      console.error("Failed to write parser error log:", e);
    }
    // Return basic fallback details from filename
    return parseDetailsFromText("", originalname);
  }
}
