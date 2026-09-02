import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import jobsRoutes from "./routes/jobs.js";
import candidatesRoutes from "./routes/candidates.js";
import offersRoutes from "./routes/offers.js";
import Job from "./models/Job.js";
import Candidate from "./models/Candidate.js";
import Offer from "./models/Offer.js";

// Load env vars
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/candidates", candidatesRoutes);
app.use("/api/offers", offersRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("SKS Talent Solutions ATS API is running...");
});

// Seed data definition
const seedJobs = [
  {
    title: "MERN Stack Developer",
    client: "TCS Technologies",
    logoText: "tcs",
    logoBg: "bg-red-550/10 text-red-650 dark:text-red-400 border border-red-500/20",
    type: "Full Time",
    location: "Noida, UP",
    fullLocation: "Noida, Uttar Pradesh",
    experience: "2 - 4 Years",
    vacancies: 5,
    status: "Active",
    postedOn: "20 May 2024",
    closingDate: "20 Jun 2024",
    ctcRange: "₹ 4,00,000 - ₹ 8,00,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 18,
    description: "We are looking for a skilled MERN Stack Developer to build and maintain scalable web applications using MongoDB, Express.js, React.js and Node.js. You will be responsible for translating design wireframes into high-quality code and defining system architecture.",
    skills: ["MongoDB", "ExpressJS", "ReactJS", "NodeJS", "JavaScript", "HTML", "CSS", "Git"],
    attachmentName: "Job_Description_MERN.pdf"
  },
  {
    title: "HR Executive",
    client: "Infosys Limited",
    logoText: "infy",
    logoBg: "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    type: "Full Time",
    location: "Bangalore, KA",
    fullLocation: "Bangalore, Karnataka",
    experience: "1 - 3 Years",
    vacancies: 3,
    status: "Active",
    postedOn: "18 May 2024",
    closingDate: "18 Jun 2024",
    ctcRange: "₹ 3,00,000 - ₹ 5,00,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 12,
    description: "We are seeking an HR Executive to manage our company's recruiting, learning and development, and employee relations. Responsibilities include sourcing candidates, onboarding new hires, and updating HR policies.",
    skills: ["Recruitment", "Onboarding", "HR Policies", "Communication", "Excel"],
    attachmentName: "HR_Executive_JD.pdf"
  },
  {
    title: "Business Development Executive",
    client: "HCL Technologies",
    logoText: "hcl",
    logoBg: "bg-indigo-600/10 text-indigo-650 dark:text-indigo-400 border border-indigo-500/20",
    type: "Full Time",
    location: "Mumbai, MH",
    fullLocation: "Mumbai, Maharashtra",
    experience: "1 - 4 Years",
    vacancies: 4,
    status: "Active",
    postedOn: "16 May 2024",
    closingDate: "16 Jun 2024",
    ctcRange: "₹ 3,50,000 - ₹ 6,00,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 15,
    description: "Looking for an energetic Business Development Executive to grow our customer base and build robust partner channels. Excellent communication and negotiations skills are required.",
    skills: ["B2B Sales", "Client Relations", "Lead Generation", "Negotiation", "CRM"],
    attachmentName: "BDE_Job_Description.pdf"
  },
  {
    title: "React Developer",
    client: "Wipro Limited",
    logoText: "wipro",
    logoBg: "bg-pink-600/10 text-pink-600 dark:text-pink-400 border border-pink-500/20",
    type: "Full Time",
    location: "Pune, MH",
    fullLocation: "Pune, Maharashtra",
    experience: "2 - 5 Years",
    vacancies: 3,
    status: "On Hold",
    postedOn: "15 May 2024",
    closingDate: "15 Jun 2024",
    ctcRange: "₹ 5,00,000 - ₹ 9,00,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 9,
    description: "We are hiring a React Developer to design, build, and optimize complex user interfaces for our digital platforms. Deep knowledge of React state management, hooks, and performance tuning is a must.",
    skills: ["ReactJS", "Redux", "TypeScript", "Tailwind CSS", "REST APIs"],
    attachmentName: "React_Dev_JD.pdf"
  },
  {
    title: "Sales Executive",
    client: "Reliance Retail",
    logoText: "reliance",
    logoBg: "bg-orange-600/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
    type: "Full Time",
    location: "Delhi, DL",
    fullLocation: "New Delhi, Delhi",
    experience: "0 - 2 Years",
    vacancies: 6,
    status: "Active",
    postedOn: "14 May 2024",
    closingDate: "14 Jun 2024",
    ctcRange: "₹ 2,50,000 - ₹ 4,00,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 20,
    description: "Seeking a motivated Sales Executive for store management and customer conversions. Experience in retail sales is a strong plus. Freshers are welcome to apply.",
    skills: ["Retail Sales", "Customer Support", "Inventory Management", "Communication"],
    attachmentName: "Sales_Executive_JD.pdf"
  },
  {
    title: "UI/UX Designer",
    client: "L&T Infotech",
    logoText: "l&t",
    logoBg: "bg-yellow-600/10 text-yellow-750 dark:text-yellow-400 border border-yellow-500/20",
    type: "Full Time",
    location: "Chennai, TN",
    fullLocation: "Chennai, Tamil Nadu",
    experience: "2 - 4 Years",
    vacancies: 2,
    status: "Active",
    postedOn: "12 May 2024",
    closingDate: "12 Jun 2024",
    ctcRange: "₹ 4,50,000 - ₹ 7,50,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 14,
    description: "We are looking for a UI/UX Designer to create wireframes, high-fidelity mockups, and interactive prototypes. You will work closely with engineering teams to bring design systems to life.",
    skills: ["Figma", "Adobe XD", "Wireframing", "User Research", "Prototyping"],
    attachmentName: "UI_UX_Designer_JD.pdf"
  },
  {
    title: "Java Developer",
    client: "Tech Mahindra",
    logoText: "techm",
    logoBg: "bg-red-600/10 text-red-600 dark:text-red-400 border border-red-500/20",
    type: "Full Time",
    location: "Hyderabad, TG",
    fullLocation: "Hyderabad, Telangana",
    experience: "2 - 5 Years",
    vacancies: 4,
    status: "Closed",
    postedOn: "10 May 2024",
    closingDate: "10 Jun 2024",
    ctcRange: "₹ 4,50,000 - ₹ 8,50,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 0,
    description: "Join us as a Senior Java Developer to design robust and secure web services. The ideal candidate will have strong experience with Spring Boot, Microservices architecture, Hibernate, and SQL databases.",
    skills: ["Java", "Spring Boot", "Microservices", "Hibernate", "PostgreSQL", "REST APIs"],
    attachmentName: "Java_Developer_JD.pdf"
  },
  {
    title: "Data Analyst",
    client: "Capgemini",
    logoText: "cap",
    logoBg: "bg-sky-600/10 text-sky-650 dark:text-sky-400 border border-sky-500/20",
    type: "Full Time",
    location: "Kolkata, WB",
    fullLocation: "Kolkata, West Bengal",
    experience: "1 - 3 Years",
    vacancies: 2,
    status: "Active",
    postedOn: "09 May 2024",
    closingDate: "09 Jun 2024",
    ctcRange: "₹ 4,00,000 - ₹ 7,00,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 11,
    description: "Responsible for translating business metrics into actionable analytics insights. You will compile data, perform SQL queries, and present reports to senior stakeholders using PowerBI and Excel.",
    skills: ["SQL", "Python", "PowerBI", "Excel", "Data Visualization", "Statistics"],
    attachmentName: "Data_Analyst_JD.pdf"
  },
  {
    title: "Digital Marketing Executive",
    client: "ICICI Bank",
    logoText: "icici",
    logoBg: "bg-amber-600/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    type: "Full Time",
    location: "Gurgaon, HR",
    fullLocation: "Gurgaon, Haryana",
    experience: "0 - 2 Years",
    vacancies: 3,
    status: "On Hold",
    postedOn: "08 May 2024",
    closingDate: "08 Jun 2024",
    ctcRange: "₹ 3,00,000 - ₹ 5,00,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 7,
    description: "Seeking a specialist to manage and optimize our digital presence. You will manage organic search, social media, paid ads campaigns (Google/Facebook Ads), and email marketing campaigns.",
    skills: ["SEO", "SEM", "Google Analytics", "Social Media Marketing", "Copywriting"],
    attachmentName: "Digital_Marketing_JD.pdf"
  },
  {
    title: "Python Developer",
    client: "Byju's",
    logoText: "byju",
    logoBg: "bg-purple-600/10 text-purple-650 dark:text-purple-400 border border-purple-500/20",
    type: "Full Time",
    location: "Bangalore, KA",
    fullLocation: "Bangalore, Karnataka",
    experience: "1 - 4 Years",
    vacancies: 4,
    status: "Active",
    postedOn: "07 May 2024",
    closingDate: "07 Jun 2024",
    ctcRange: "₹ 5,00,000 - ₹ 9,00,000 PA",
    recruiter: "Sanjay Kushwaha",
    candidatesCount: 16,
    description: "We are looking for a Python Developer to join our education systems team. Focus will be on developing backends using Django/Flask and writing high-efficiency data collection scrapers.",
    skills: ["Python", "Django", "Flask", "BeautifulSoup", "MySQL", "Docker"],
    attachmentName: "Python_Developer_JD.pdf"
  }
];

const seedCandidates = [
  { name:"Rahul Sharma",   initials:"RS", gradientFrom:"blue-500",    gradientTo:"blue-600",    role:"MERN Stack Developer", company:"TCS Technologies",   location:"Noida, UP",       experience:"3 Years",    appliedDate:"20 May 2024", rating:3.5, source:"Naukri.com",  currentCTC:"₹4,00,000", expectedCTC:"₹7,00,000", noticePeriod:"30 Days", email:"rahul.sharma@email.com",  phone:"9876543210", education:"B.Tech CS - DTU",          recruiter:"Sanjay Kushwaha", stage:"applied",     employeeId:"RSH1001NO", skills:["MERN","React","Node.js","MongoDB"] },
  { name:"Priya Singh",    initials:"PS", gradientFrom:"pink-500",    gradientTo:"rose-500",    role:"HR Executive",         company:"Infosys Limited",    location:"Pune, MH",        experience:"2 Years",    appliedDate:"19 May 2024", rating:3.0, source:"Direct",      currentCTC:"₹3,00,000", expectedCTC:"₹5,00,000", noticePeriod:"30 Days", email:"priya.singh@email.com",   phone:"9871234560", education:"MBA HR - Symbiosis",       recruiter:"Sanjay Kushwaha", stage:"applied",     employeeId:"PSI1002PU", skills:["Recruitment","HR Policies","Onboarding"] },
  { name:"Amit Verma",     initials:"AV", gradientFrom:"indigo-500",  gradientTo:"purple-500",  role:"Java Developer",       company:"TCS Technologies",   location:"Noida, UP",       experience:"2 Years",    appliedDate:"18 May 2024", rating:null,source:"Direct",      currentCTC:"₹3,50,000", expectedCTC:"₹6,00,000", noticePeriod:"45 Days", email:"amit.verma@email.com",    phone:"9812340001", education:"B.E CS - AKTU",            recruiter:"Sanjay Kushwaha", stage:"applied",     employeeId:"AVE1003NO", skills:["Java","Spring Boot","MySQL"] },
  { name:"Neha Gupta",     initials:"NG", gradientFrom:"amber-500",   gradientTo:"orange-500",  role:"Business Analyst",     company:"Deloitte Limited",   location:"Bangalore, KA",   experience:"1.5 Years",  appliedDate:"18 May 2024", rating:null,source:"LinkedIn",    currentCTC:"₹3,00,000", expectedCTC:"₹5,50,000", noticePeriod:"30 Days", email:"neha.gupta@email.com",    phone:"9823456780", education:"MBA Finance - XLRI",       recruiter:"Sanjay Kushwaha", stage:"applied",     employeeId:"NGU1004BL", skills:["Business Analysis","Excel","SQL"] },
  { name:"Rohit Patel",    initials:"RP", gradientFrom:"teal-500",    gradientTo:"cyan-500",    role:"UI/UX Designer",       company:"Capgemini",          location:"Mumbai, MH",      experience:"2.5 Years",  appliedDate:"18 May 2024", rating:null,source:"Internshala", currentCTC:"₹4,00,000", expectedCTC:"₹7,00,000", noticePeriod:"15 Days", email:"rohit.patel@email.com",   phone:"9899000002", education:"B.Des - NID",              recruiter:"Sanjay Kushwaha", stage:"applied",     employeeId:"RPA1005MU", skills:["Figma","Adobe XD","Wireframing"] },
  { name:"Sneha Yadav",    initials:"SY", gradientFrom:"violet-500",  gradientTo:"purple-600",  role:"React Developer",      company:"Mindtree",           location:"Pune, MH",        experience:"2 Years",    appliedDate:"16 May 2024", rating:3.5, source:"Naukri.com",  currentCTC:"₹4,50,000", expectedCTC:"₹7,50,000", noticePeriod:"30 Days", email:"sneha.yadav@email.com",   phone:"9898767676", education:"B.E IT - Pune Univ",       recruiter:"Sanjay Kushwaha", stage:"screening",   employeeId:"SYA1006PU", skills:["React","Redux","TypeScript"] },
  { name:"Vikram Joshi",   initials:"VJ", gradientFrom:"emerald-500", gradientTo:"green-600",   role:"DevOps Engineer",      company:"Tech Mahindra",      location:"Hyderabad, TG",   experience:"4 Years",    appliedDate:"15 May 2024", rating:4.0, source:"LinkedIn",    currentCTC:"₹7,00,000", expectedCTC:"₹11,00,000",noticePeriod:"45 Days", email:"vikram.joshi@email.com",  phone:"9811112223", education:"B.Tech ECE - IIT Roorkee", recruiter:"Sanjay Kushwaha", stage:"screening",   employeeId:"VJO1007HY", skills:["Docker","Kubernetes","AWS","CI/CD"] },
  { name:"Pooja Mehta",    initials:"PM", gradientFrom:"sky-500",     gradientTo:"blue-600",    role:"QA Engineer",          company:"Accenture",          location:"Chennai, TN",     experience:"2 Years",    appliedDate:"14 May 2024", rating:3.0, source:"Referral",    currentCTC:"₹4,00,000", expectedCTC:"₹6,50,000", noticePeriod:"30 Days", email:"pooja.mehta@email.com",   phone:"9900001235", education:"B.E CS - VIT",             recruiter:"Sanjay Kushwaha", stage:"screening",   employeeId:"PME1008CH", skills:["Selenium","Cypress","SQL","Jest"] },
  { name:"Arjun Nair",     initials:"AN", gradientFrom:"rose-500",    gradientTo:"pink-600",    role:"Data Analyst",         company:"Deloitte",           location:"Bangalore, KA",   experience:"2 Years",    appliedDate:"14 May 2024", rating:5.0, source:"Internshala", currentCTC:"₹4,50,000", expectedCTC:"₹7,00,000", noticePeriod:"30 Days", email:"arjun.nair@email.com",    phone:"9877000002", education:"B.Sc Stats - DU",          recruiter:"Sanjay Kushwaha", stage:"screening",   employeeId:"ANA1009BL", skills:["SQL","Python","PowerBI","Excel"] },
  { name:"Karan Mehta",    initials:"KM", gradientFrom:"amber-500",   gradientTo:"orange-500",  role:"Full Stack Developer", company:"Reliance Retail",    location:"Mumbai, MH",      experience:"3.5 Years",  appliedDate:"14 May 2024", rating:null,source:"Referral",    currentCTC:"₹6,00,000", expectedCTC:"₹9,50,000", noticePeriod:"30 Days", email:"karan.mehta@email.com",   phone:"9876543211", education:"B.Tech CS - BITS",         recruiter:"Sanjay Kushwaha", stage:"shortlisted", employeeId:"KME1010MU", skills:["React","Node.js","PostgreSQL","AWS"] },
  { name:"Anjali Desai",   initials:"AD", gradientFrom:"teal-500",    gradientTo:"cyan-500",    role:"Digital Marketing Exec",company:"XYZ Solutions",     location:"Delhi, DL",       experience:"2 Years",    appliedDate:"13 May 2024", rating:4.0, source:"LinkedIn",    currentCTC:"₹3,50,000", expectedCTC:"₹5,50,000", noticePeriod:"15 Days", email:"anjali.desai@email.com",  phone:"9823456781", education:"MBA Marketing - NMIMS",    recruiter:"Sanjay Kushwaha", stage:"shortlisted", employeeId:"ADE1011DL", skills:["SEO","SEM","Google Ads","Analytics"] },
  { name:"Saurabh Singh",  initials:"SS", gradientFrom:"violet-500",  gradientTo:"purple-600",  role:"Frontend Developer",   company:"L&T Infotech",       location:"Pune, MH",        experience:"2.5 Years",  appliedDate:"12 May 2024", rating:null,source:"Naukri.com",  currentCTC:"₹5,00,000", expectedCTC:"₹8,00,000", noticePeriod:"30 Days", email:"saurabh.singh@email.com", phone:"9811112224", education:"B.E CS - Pune Univ",       recruiter:"Sanjay Kushwaha", stage:"shortlisted", employeeId:"SSI1012PU", skills:["React","Angular","HTML5","CSS3"] },
  { name:"Manish Kumar",   initials:"MK", gradientFrom:"blue-600",    gradientTo:"indigo-700",  role:"Java Developer",       company:"HCL Technologies",   location:"Bangalore, KA",   experience:"3.5 Years",  appliedDate:"12 May 2024", rating:4.0, source:"LinkedIn",    currentCTC:"₹6,00,000", expectedCTC:"₹9,50,000", noticePeriod:"30 Days", email:"manish.kumar@email.com",  phone:"9876543210", education:"B.Tech CS - NIT Surathkal",recruiter:"Sanjay Kushwaha", stage:"interview",   employeeId:"MKR4321LO", skills:["Java","Spring Boot","Microservices","PostgreSQL","Docker"] },
  { name:"Ritika Sharma",  initials:"RS", gradientFrom:"pink-500",    gradientTo:"rose-500",    role:"HR Executive",         company:"Infosys Limited",    location:"Delhi, DL",       experience:"1.5 Years",  appliedDate:"11 May 2024", rating:4.2, source:"Referral",    currentCTC:"₹3,00,000", expectedCTC:"₹5,00,000", noticePeriod:"30 Days", email:"ritika.sharma@email.com", phone:"9833456780", education:"MBA HR - Amity",           recruiter:"Sanjay Kushwaha", stage:"interview",   employeeId:"RSH1014DL", skills:["Recruitment","Onboarding","HR Policies"] },
  { name:"Deepak Yadav",   initials:"DY", gradientFrom:"emerald-500", gradientTo:"green-600",   role:"MERN Stack Developer", company:"TCS Technologies",   location:"Noida, UP",       experience:"4 Years",    appliedDate:"10 May 2024", rating:5.0, source:"Naukri.com",  currentCTC:"₹7,00,000", expectedCTC:"₹11,00,000",noticePeriod:"60 Days", email:"deepak.yadav@email.com",  phone:"9877000003", education:"MCA - Delhi University",   recruiter:"Sanjay Kushwaha", stage:"interview",   employeeId:"DYA1015NO", skills:["MERN","React","Node.js","MongoDB","Redis"] },
  { name:"Nikhil Rawat",   initials:"NR", gradientFrom:"sky-500",     gradientTo:"blue-600",    role:"DevOps Engineer",      company:"Wipro Limited",      location:"Pune, MH",        experience:"5 Years",    appliedDate:"10 May 2024", rating:4.2, source:"LinkedIn",    currentCTC:"₹9,00,000", expectedCTC:"₹14,00,000",noticePeriod:"45 Days", email:"nikhil.rawat@email.com",  phone:"9900001236", education:"B.Tech ECE - IIT Delhi",   recruiter:"Sanjay Kushwaha", stage:"offer",       employeeId:"NRA1016PU", skills:["Docker","Kubernetes","Terraform","AWS"] },
  { name:"Megha Jain",     initials:"MJ", gradientFrom:"fuchsia-500", gradientTo:"pink-600",    role:"Business Analyst",     company:"Deloitte",           location:"Delhi, DL",       experience:"3 Years",    appliedDate:"09 May 2024", rating:4.3, source:"Referral",    currentCTC:"₹6,00,000", expectedCTC:"₹9,00,000", noticePeriod:"30 Days", email:"megha.jain@email.com",    phone:"9871234561", education:"MBA Finance - IIM Indore", recruiter:"Sanjay Kushwaha", stage:"offer",       employeeId:"MJA1017DL", skills:["Business Analysis","JIRA","SQL","PowerBI"] },
  { name:"Abhishek Verma", initials:"AV", gradientFrom:"amber-500",   gradientTo:"orange-500",  role:"Java Developer",       company:"Capgemini",          location:"Noida, UP",       experience:"4 Years",    appliedDate:"09 May 2024", rating:4.4, source:"Naukri.com",  currentCTC:"₹7,00,000", expectedCTC:"₹10,00,000",noticePeriod:"30 Days", email:"abhishek.v@email.com",    phone:"9812340002", education:"B.Tech CS - NIT Allahabad",recruiter:"Sanjay Kushwaha", stage:"hired",       employeeId:"AVE1018NO", skills:["Java","Spring Boot","Microservices","AWS"] },
  { name:"Pallavi Joshi",  initials:"PJ", gradientFrom:"violet-500",  gradientTo:"purple-600",  role:"HR Executive",         company:"TCS Technologies",   location:"Chennai, TN",     experience:"2 Years",    appliedDate:"08 May 2024", rating:4.1, source:"Campus",      currentCTC:"₹3,50,000", expectedCTC:"₹5,50,000", noticePeriod:"15 Days", email:"pallavi.joshi@email.com", phone:"9898767677", education:"MBA HR - Symbiosis",       recruiter:"Sanjay Kushwaha", stage:"hired",       employeeId:"PJO1019CH", skills:["Recruitment","Payroll","HRMS"] },
  { name:"Sameer Khan",    initials:"SK", gradientFrom:"emerald-500", gradientTo:"green-600",   role:"UI/UX Designer",       company:"L&T Infotech",       location:"Mumbai, MH",      experience:"3 Years",    appliedDate:"07 May 2024", rating:4.3, source:"LinkedIn",    currentCTC:"₹5,50,000", expectedCTC:"₹8,50,000", noticePeriod:"30 Days", email:"sameer.khan@email.com",   phone:"9811112225", education:"B.Des - NIFT",             recruiter:"Sanjay Kushwaha", stage:"hired",       employeeId:"SKH1020MU", skills:["Figma","Sketch","Adobe XD","Zeplin"] },
];

const seedOffers = [
  {
    candidateName: "Rahul Sharma",
    candidateEmail: "rahul.sharma@email.com",
    candidatePhone: "9876543210",
    jobTitle: "MERN Stack Developer",
    client: "TCS Technologies",
    offerId: "OFF-2024-00032",
    sentOn: "20 May 2024, 10:30 AM",
    validTill: "28 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 6,00,000 PA",
    location: "Mumbai",
    status: "Accepted",
    responseOn: "22 May 2024, 04:15 PM",
    assignedTo: { name: "Anjali Desai", role: "HR Manager", avatar: "AD" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" },
      { name: "Compensation Breakup.pdf", url: "#" },
      { name: "Employment Terms.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "20 May 2024, 10:15 AM", user: "Anjali Desai (HR Manager)" },
      { event: "Offer Sent", date: "20 May 2024, 10:30 AM", user: "Anjali Desai (HR Manager)" },
      { event: "Offer Accepted", date: "22 May 2024, 04:15 PM", user: "Rahul Sharma (Candidate)" }
    ]
  },
  {
    candidateName: "Priya Singh",
    candidateEmail: "priya.singh@email.com",
    candidatePhone: "9871234560",
    jobTitle: "HR Executive",
    client: "Infosys Limited",
    offerId: "OFF-2024-00033",
    sentOn: "20 May 2024, 02:00 PM",
    validTill: "22 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 3,20,000 PA",
    location: "Bangalore",
    status: "Pending",
    assignedTo: { name: "Vikram Joshi", role: "Tech Lead", avatar: "VJ" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" },
      { name: "Compensation Breakup.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "20 May 2024, 01:45 PM", user: "Vikram Joshi (Tech Lead)" },
      { event: "Offer Sent", date: "20 May 2024, 02:00 PM", user: "Vikram Joshi (Tech Lead)" }
    ]
  },
  {
    candidateName: "Amit Verma",
    candidateEmail: "amit.verma@email.com",
    candidatePhone: "9812340001",
    jobTitle: "Java Developer",
    client: "TCS Technologies",
    offerId: "OFF-2024-00034",
    sentOn: "21 May 2024, 11:00 AM",
    validTill: "30 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 4,00,000 PA",
    location: "Noida",
    status: "Accepted",
    responseOn: "21 May 2024, 03:20 PM",
    assignedTo: { name: "Neha Gupta", role: "HR Manager", avatar: "NG" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" },
      { name: "Compensation Breakup.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "21 May 2024, 10:45 AM", user: "Neha Gupta (HR Manager)" },
      { event: "Offer Sent", date: "21 May 2024, 11:00 AM", user: "Neha Gupta (HR Manager)" },
      { event: "Offer Accepted", date: "21 May 2024, 03:20 PM", user: "Amit Verma (Candidate)" }
    ]
  },
  {
    candidateName: "Sneha Yadav",
    candidateEmail: "sneha.yadav@email.com",
    candidatePhone: "9898767676",
    jobTitle: "React Developer",
    client: "Mindtree",
    offerId: "OFF-2024-00035",
    sentOn: "21 May 2024, 01:30 PM",
    validTill: "24 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 4,20,000 PA",
    location: "Pune",
    status: "Pending",
    assignedTo: { name: "Sanjay Kushwaha", role: "Super Admin", avatar: "SK" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "21 May 2024, 01:15 PM", user: "Sanjay Kushwaha (Super Admin)" },
      { event: "Offer Sent", date: "21 May 2024, 01:30 PM", user: "Sanjay Kushwaha (Super Admin)" }
    ]
  },
  {
    candidateName: "Rohit Patel",
    candidateEmail: "rohit.patel@email.com",
    candidatePhone: "9899000002",
    jobTitle: "UI/UX Designer",
    client: "Capgemini",
    offerId: "OFF-2024-00036",
    sentOn: "22 May 2024, 10:00 AM",
    validTill: "29 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 7,00,000 PA",
    location: "Mumbai",
    status: "Declined",
    responseOn: "23 May 2024, 09:10 AM",
    assignedTo: { name: "Anjali Desai", role: "HR Manager", avatar: "AD" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" },
      { name: "Compensation Breakup.pdf", url: "#" },
      { name: "Employment Terms.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "22 May 2024, 09:45 AM", user: "Anjali Desai (HR Manager)" },
      { event: "Offer Sent", date: "22 May 2024, 10:00 AM", user: "Anjali Desai (HR Manager)" },
      { event: "Offer Declined", date: "23 May 2024, 09:10 AM", user: "Rohit Patel (Candidate)" }
    ]
  },
  {
    candidateName: "Karan Mehta",
    candidateEmail: "karan.mehta@email.com",
    candidatePhone: "9876543211",
    jobTitle: "Full Stack Developer",
    client: "Reliance Retail",
    offerId: "OFF-2024-00037",
    sentOn: "22 May 2024, 04:00 PM",
    validTill: "27 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 5,00,000 PA",
    location: "Mumbai",
    status: "Pending",
    assignedTo: { name: "Vikram Joshi", role: "Tech Lead", avatar: "VJ" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "22 May 2024, 03:30 PM", user: "Vikram Joshi (Tech Lead)" },
      { event: "Offer Sent", date: "22 May 2024, 04:00 PM", user: "Vikram Joshi (Tech Lead)" }
    ]
  },
  {
    candidateName: "Deepak Yadav",
    candidateEmail: "deepak.yadav@email.com",
    candidatePhone: "9877000003",
    jobTitle: "MERN Stack Developer",
    client: "TCS Technologies",
    offerId: "OFF-2024-00038",
    sentOn: "23 May 2024, 11:30 AM",
    validTill: "20 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 7,50,000 PA",
    location: "Noida",
    status: "Accepted",
    responseOn: "23 May 2024, 02:30 PM",
    assignedTo: { name: "Neha Gupta", role: "HR Manager", avatar: "NG" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" },
      { name: "Compensation Breakup.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "23 May 2024, 11:00 AM", user: "Neha Gupta (HR Manager)" },
      { event: "Offer Sent", date: "23 May 2024, 11:30 AM", user: "Neha Gupta (HR Manager)" },
      { event: "Offer Accepted", date: "23 May 2024, 02:30 PM", user: "Deepak Yadav (Candidate)" }
    ]
  },
  {
    candidateName: "Pooja Mehta",
    candidateEmail: "pooja.mehta@email.com",
    candidatePhone: "9900001235",
    jobTitle: "QA Engineer",
    client: "Accenture",
    offerId: "OFF-2024-00039",
    sentOn: "23 May 2024, 03:30 PM",
    validTill: "25 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 5,00,000 PA",
    location: "Chennai",
    status: "Pending",
    assignedTo: { name: "Sanjay Kushwaha", role: "Super Admin", avatar: "SK" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "23 May 2024, 03:15 PM", user: "Sanjay Kushwaha (Super Admin)" },
      { event: "Offer Sent", date: "23 May 2024, 03:30 PM", user: "Sanjay Kushwaha (Super Admin)" }
    ]
  },
  {
    candidateName: "Megha Jain",
    candidateEmail: "megha.jain@email.com",
    candidatePhone: "9871234561",
    jobTitle: "Business Analyst",
    client: "Deloitte",
    offerId: "OFF-2024-00040",
    sentOn: "24 May 2024, 10:00 AM",
    validTill: "28 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 6,50,000 PA",
    location: "Delhi",
    status: "Accepted",
    responseOn: "25 May 2024, 11:20 AM",
    assignedTo: { name: "Anjali Desai", role: "HR Manager", avatar: "AD" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" },
      { name: "Compensation Breakup.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "24 May 2024, 09:45 AM", user: "Anjali Desai (HR Manager)" },
      { event: "Offer Sent", date: "24 May 2024, 10:00 AM", user: "Anjali Desai (HR Manager)" },
      { event: "Offer Accepted", date: "25 May 2024, 11:20 AM", user: "Megha Jain (Candidate)" }
    ]
  },
  {
    candidateName: "Neha Gupta",
    candidateEmail: "neha.gupta@email.com",
    candidatePhone: "9823456780",
    jobTitle: "Business Analyst",
    client: "Deloitte Limited",
    offerId: "OFF-2024-00041",
    sentOn: "24 May 2024, 11:30 AM",
    validTill: "29 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 3,00,000 PA",
    location: "Bangalore",
    status: "Declined",
    responseOn: "24 May 2024, 05:00 PM",
    assignedTo: { name: "Sanjay Kushwaha", role: "Super Admin", avatar: "SK" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "24 May 2024, 11:15 AM", user: "Sanjay Kushwaha (Super Admin)" },
      { event: "Offer Sent", date: "24 May 2024, 11:30 AM", user: "Sanjay Kushwaha (Super Admin)" },
      { event: "Offer Declined", date: "24 May 2024, 05:00 PM", user: "Neha Gupta (Candidate)" }
    ]
  },
  {
    candidateName: "Abhishek Verma",
    candidateEmail: "abhishek.v@email.com",
    candidatePhone: "9812340002",
    jobTitle: "Java Developer",
    client: "Capgemini",
    offerId: "OFF-2024-00042",
    sentOn: "25 May 2024, 09:00 AM",
    validTill: "30 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 7,00,000 PA",
    location: "Noida",
    status: "Accepted",
    responseOn: "26 May 2024, 10:15 AM",
    assignedTo: { name: "Neha Gupta", role: "HR Manager", avatar: "NG" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" },
      { name: "Compensation Breakup.pdf", url: "#" },
      { name: "Employment Terms.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "25 May 2024, 08:45 AM", user: "Neha Gupta (HR Manager)" },
      { event: "Offer Sent", date: "25 May 2024, 09:00 AM", user: "Neha Gupta (HR Manager)" },
      { event: "Offer Accepted", date: "26 May 2024, 10:15 AM", user: "Abhishek Verma (Candidate)" }
    ]
  },
  {
    candidateName: "Pallavi Joshi",
    candidateEmail: "pallavi.joshi@email.com",
    candidatePhone: "9898767677",
    jobTitle: "HR Executive",
    client: "TCS Technologies",
    offerId: "OFF-2024-00043",
    sentOn: "25 May 2024, 02:30 PM",
    validTill: "28 Jun 2024",
    template: "Standard Offer Template",
    offerType: "New",
    ctc: "₹ 3,50,000 PA",
    location: "Chennai",
    status: "Accepted",
    responseOn: "26 May 2024, 12:45 PM",
    assignedTo: { name: "Anjali Desai", role: "HR Manager", avatar: "AD" },
    documents: [
      { name: "Offer Letter.pdf", url: "#" },
      { name: "Compensation Breakup.pdf", url: "#" }
    ],
    history: [
      { event: "Offer Created", date: "25 May 2024, 02:15 PM", user: "Anjali Desai (HR Manager)" },
      { event: "Offer Sent", date: "25 May 2024, 02:30 PM", user: "Anjali Desai (HR Manager)" },
      { event: "Offer Accepted", date: "26 May 2024, 12:45 PM", user: "Pallavi Joshi (Candidate)" }
    ]
  }
];

const seedDatabase = async () => {
  try {
    const jobCount = await Job.countDocuments();
    if (jobCount === 0) {
      console.log("No jobs found in DB. Seeding initial job mock data...");
      await Job.insertMany(seedJobs);
      console.log("Database successfully seeded with mock jobs!");
    }

    const candCount = await Candidate.countDocuments();
    if (candCount === 0) {
      console.log("No candidates found in DB. Seeding initial candidate mock data...");
      await Candidate.insertMany(seedCandidates);
      console.log("Database successfully seeded with mock candidates!");
    }

    const offerCount = await Offer.countDocuments();
    if (offerCount === 0) {
      console.log("No offers found in DB. Seeding initial offer mock data...");
      await Offer.insertMany(seedOffers);
      console.log("Database successfully seeded with mock offers!");
    }
  } catch (error) {
    console.error("Seeding Error:", error);
  }
};

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("MongoDB successfully connected to Atlas cluster.");
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Express server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  });
