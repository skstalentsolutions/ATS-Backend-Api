// seed/seed.js
// Populates the database with sample data so the dashboard/clients/invoices
// look right the first time you connect the frontend to the real API.
import mongoose from "mongoose";
import dotenv from "dotenv";
import Client from "../models/Client.js";
import Job from "../models/Job.js";
import Candidate from "../models/Candidate.js";
import Interview from "../models/Interview.js";
import Offer from "../models/Offer.js";
import Followup from "../models/Followup.js";
import Recruiter from "../models/Recruiter.js";
import Activity from "../models/Activity.js";
import Joining from "../models/Joining.js";
import DailyActivity from "../models/DailyActivity.js";
import Revenue from "../models/Revenue.js";
import Invoice from "../models/Invoice.js";

dotenv.config();
console.log("Mongo URI:", process.env.MONGO_URI);

function daysFromNow(days, hours = 12, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function fixedDate(year, monthIndex, day) {
  return new Date(year, monthIndex, day, 12, 0, 0);
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Clearing old data...");

  await Promise.all([
    Client.deleteMany(),
    Job.deleteMany(),
    Candidate.deleteMany(),
    Interview.deleteMany(),
    Offer.deleteMany(),
    Followup.deleteMany(),
    Recruiter.deleteMany(),
    Activity.deleteMany(),
    DailyActivity.deleteMany(),
    Revenue.deleteMany(),
    Invoice.deleteMany(),
  ]);

  await Client.insertMany([
    { company: "TCS Technologies", logo: "TCS", contact: "Rohit Sharma", designation: "HR Manager", email: "rohit.sharma@tcs.com", phone: "9876543210", industry: "IT Services", activeJobs: 5, status: "Active", companySize: "10,001+ Employees", website: "www.tcs.com", gst: "27AAACT2727Q1ZJ", address: "TCS House, Raveline Street, Fort, Mumbai - 400001, Maharashtra, India", notes: "Preferred for IT & Non-IT Hiring. Good response and quick turnaround.", agreementFile: "tcs_agreement_2024.pdf", agreementStart: new Date(2024, 0, 1), agreementEnd: new Date(2024, 11, 31), agreementStatus: "Active" },
    { company: "Infosys Limited", logo: "INFY", contact: "Neha Gupta", designation: "Talent Acquisition", email: "neha.gupta@infosys.com", phone: "9123456780", industry: "IT Services", activeJobs: 3, status: "Active" },
    { company: "HCL Technologies", logo: "HCL", contact: "Amit Verma", designation: "HR Business Partner", email: "amit.verma@hcl.com", phone: "9955667788", industry: "IT Services", activeJobs: 4, status: "Active" },
    { company: "Wipro Limited", logo: "WPRO", contact: "Priya Nair", designation: "HR Manager", email: "priya.nair@wipro.com", phone: "9988776655", industry: "IT Services", activeJobs: 2, status: "Active" },
    { company: "Reliance Retail", logo: "REL", contact: "Karan Mehta", designation: "HR Head", email: "karan.mehta@ril.com", phone: "9871234567", industry: "Retail", activeJobs: 3, status: "Active" },
    { company: "L&T Infotech", logo: "L&T", contact: "Saurabh Singh", designation: "Talent Lead", email: "saurabh.singh@lntinfotech.com", phone: "8899001122", industry: "IT Services", activeJobs: 2, status: "Inactive" },
    { company: "Tech Mahindra", logo: "TM", contact: "Anjali Desai", designation: "HR Manager", email: "anjali.desai@techmahindra.com", phone: "7766554433", industry: "IT Services", activeJobs: 2, status: "Active" },
    { company: "Capgemini", logo: "CAP", contact: "Vikram Joshi", designation: "Recruitment Lead", email: "vikram.joshi@capgemini.com", phone: "9988112233", industry: "IT Services", activeJobs: 1, status: "Inactive" },
    { company: "ICICI Bank", logo: "ICICI", contact: "Pooja Agarwal", designation: "HR Manager", email: "pooja.agarwal@icicibank.com", phone: "8877665544", industry: "Banking", activeJobs: 2, status: "Active" },
    { company: "Byju's", logo: "BYJU", contact: "Rahul Kumar", designation: "HR Business Partner", email: "rahul.kumar@byjus.com", phone: "9009988776", industry: "EdTech", activeJobs: 1, status: "Active" },
  ]);

  await Job.insertMany([
    { title: "MERN Developer", client: "TCS", status: "Open" },
    { title: "HR Executive", client: "Infosys", status: "Open" },
    { title: "Java Developer", client: "HCL", status: "Open", closingSoon: true },
    { title: "BDE", client: "Wipro", status: "Open" },
    { title: "React Developer", client: "Capgemini", status: "Closed" },
    { title: "QA Engineer", client: "TCS", status: "On Hold" },
    { title: "DevOps Engineer", client: "HCL", status: "Cancelled" },
  ]);

  await Recruiter.insertMany([
    { name: "Sanjay Kushwaha", avatar: "https://i.pravatar.cc/40?img=12", joinees: 52 },
    { name: "Priya Sharma", avatar: "https://i.pravatar.cc/40?img=5", joinees: 41 },
    { name: "Rahul Verma", avatar: "https://i.pravatar.cc/40?img=15", joinees: 33 },
    { name: "Aman Singh", avatar: "https://i.pravatar.cc/40?img=33", joinees: 28 },
  ]);

  await Candidate.insertMany([
    { name: "Aman Yadav", position: "MERN Dev", client: "TCS", recruiter: "Priya", status: "Screening" },
    { name: "Neha Gupta", position: "HR Executive", client: "Infosys", recruiter: "Sanjay", status: "Interview" },
    { name: "Rohit Patel", position: "React Developer", client: "Capgemini", recruiter: "Rahul", status: "Selected" },
    { name: "Akash Dubey", position: "BDE", client: "HCL", recruiter: "Aman", status: "Offer" },
    { name: "Mohit Verma", position: "Java Developer", client: "HCL", recruiter: "Rahul", status: "Joined", joinedDate: new Date() },
  ]);

  await Interview.insertMany([
    { candidateName: "Rahul Kumar", candidatePhone: "9876543210", company: "TCS", client: "", position: "MERN Stack Developer", round: "Round 1 - HR Interview", interviewerName: "Anjali Desai", interviewerRole: "HR Manager", mode: "Online", meetingLink: "https://meet.google.com/abc-defg-hij", date: daysFromNow(0, 10, 30), time: "10:30 AM", duration: 45, status: "Scheduled", agenda: ["Introduction & Background", "Experience Discussion", "Skills Assessment", "Cultural Fit", "Q&A Session"] },
    { candidateName: "Priya Singh", candidatePhone: "9123456780", company: "Infosys", client: "", position: "HR Executive", round: "Round 2 - Technical", interviewerName: "Vikram Joshi", interviewerRole: "Tech Lead", mode: "Online", date: daysFromNow(0, 14, 0), time: "02:00 PM", duration: 30, status: "In Progress", agenda: ["Technical Round", "Case Study"] },
    { candidateName: "Amit Verma", candidatePhone: "9988776655", company: "HCL", client: "Tech Mahindra", position: "Java Developer", round: "Round 1 - HR Interview", interviewerName: "Neha Gupta", interviewerRole: "HR Manager", mode: "Offline", date: daysFromNow(1, 11, 0), time: "11:00 AM", duration: 30, status: "Scheduled", agenda: ["Introduction", "Experience Discussion"] },
    { candidateName: "Sneha Yadav", candidatePhone: "7894561230", company: "Wipro", client: "", position: "Digital Marketing Executive", round: "Round 2 - Technical", interviewerName: "Rahul Mehta", interviewerRole: "Digital Lead", mode: "Online", date: daysFromNow(1, 15, 30), time: "03:30 PM", duration: 45, status: "Pending Feedback", agenda: ["Portfolio Review", "Campaign Strategy"] },
    { candidateName: "Rohit Patel", candidatePhone: "7766554433", company: "Capgemini", client: "", position: "UI/UX Designer", round: "Round 3 - Managerial", interviewerName: "Pooja Mehta", interviewerRole: "Design Head", mode: "Offline", date: daysFromNow(2, 10, 0), time: "10:00 AM", duration: 60, status: "Completed", agenda: ["Portfolio Walkthrough", "Design Process", "Team Fit"] },
    { candidateName: "Karan Mehta", candidatePhone: "8877665544", company: "Reliance Retail", client: "", position: "Business Analyst", round: "Round 1 - HR Interview", interviewerName: "Anjali Desai", interviewerRole: "HR Manager", mode: "Online", meetingLink: "https://meet.google.com/xyz-uvwx-yz", date: daysFromNow(2, 16, 0), time: "04:00 PM", duration: 30, status: "Scheduled", agenda: ["Introduction", "Resume Walkthrough"] },
    { candidateName: "Deepak Yadav", candidatePhone: "9012345678", company: "Tech Mahindra", client: "", position: "DevOps Engineer", round: "Round 2 - Technical", interviewerName: "Vikram Joshi", interviewerRole: "Tech Lead", mode: "Online", date: daysFromNow(3, 11, 30), time: "11:30 AM", duration: 45, status: "In Progress", agenda: ["CI/CD Discussion", "Infra Design"] },
    { candidateName: "Pooja Sharma", candidatePhone: "9345678901", company: "Byju's", client: "", position: "QA Engineer", round: "Round 1 - HR Interview", interviewerName: "Neha Gupta", interviewerRole: "HR Manager", mode: "Offline", date: daysFromNow(4, 14, 30), time: "02:30 PM", duration: 30, status: "Cancelled", agenda: ["Introduction"] },
  ]);

  await Offer.insertMany([
    { candidateName: "Neha Gupta", client: "Infosys", position: "HR Executive", status: "Released", amount: 45000, releasedDate: new Date() },
    { candidateName: "Akash Dubey", client: "HCL", position: "BDE", status: "Pending", amount: 0 },
    { candidateName: "Mohit Verma", client: "HCL", position: "Java Developer", status: "Released", amount: 200000, releasedDate: new Date() },
  ]);

  await Followup.insertMany([
    { followupFor: "Rahul Sharma", followupForType: "Candidate", company: "TCS Technologies", relatedTo: "MERN Stack Developer", subject: "Feedback for Round 1 Interview", note: "Waiting on interviewer's written feedback before moving to Round 2.", date: daysFromNow(0, 10, 30), time: "10:30 AM", assignedTo: "Anjali Desai", assignedToRole: "HR Manager", status: "Pending", priority: "High" },
    { followupFor: "Infosys Limited", followupForType: "Client", company: "Infosys Limited", relatedTo: "HR Executive", subject: "Requirement Discussion Call", note: "Confirm headcount and budget for the HR Executive opening.", date: daysFromNow(0, 11, 30), time: "11:30 AM", assignedTo: "Vikram Joshi", assignedToRole: "Tech Lead", status: "Pending", priority: "Medium" },
    { followupFor: "Priya Singh", followupForType: "Candidate", company: "Infosys Limited", relatedTo: "HR Executive", subject: "Resume Shortlist Update", note: "Let candidate know shortlist status by EOD.", date: daysFromNow(0, 14, 0), time: "02:00 PM", assignedTo: "Neha Gupta", assignedToRole: "HR Manager", status: "Pending", priority: "Medium" },
    { followupFor: "HCL Technologies", followupForType: "Client", company: "HCL Technologies", relatedTo: "Java Developer", subject: "JD & Budget Discussion", note: "Client wants to revise the JD before we resume sourcing.", date: daysFromNow(0, 15, 30), time: "03:30 PM", assignedTo: "Sanjay Kushwaha", assignedToRole: "Admin", status: "Pending", priority: "High" },
    { followupFor: "Amit Verma", followupForType: "Candidate", company: "HCL Technologies", relatedTo: "Java Developer", subject: "Interview Schedule Confirmation", note: "Candidate confirmed availability for Tuesday.", date: daysFromNow(0, 16, 0), time: "04:00 PM", assignedTo: "Anjali Desai", assignedToRole: "HR Manager", status: "Completed", priority: "Low" },
    { followupFor: "Wipro Limited", followupForType: "Client", company: "Wipro Limited", relatedTo: "Business Analyst", subject: "Status Update Call", note: "Share weekly pipeline status.", date: daysFromNow(1, 16, 30), time: "04:30 PM", assignedTo: "Vikram Joshi", assignedToRole: "Tech Lead", status: "Pending", priority: "Medium" },
    { followupFor: "Sneha Yadav", followupForType: "Candidate", company: "XYZ Solutions", relatedTo: "Digital Marketing Executive", subject: "Offer Discussion Follow-up", note: "Candidate is comparing with another offer - check in.", date: daysFromNow(1, 17, 0), time: "05:00 PM", assignedTo: "Neha Gupta", assignedToRole: "HR Manager", status: "Pending", priority: "High" },
    { followupFor: "Capgemini", followupForType: "Client", company: "Capgemini", relatedTo: "UI/UX Designer", subject: "Onboarding Process Discussion", note: "Walk client through our onboarding checklist for new joinees.", date: daysFromNow(1, 17, 30), time: "05:30 PM", assignedTo: "Sanjay Kushwaha", assignedToRole: "Admin", status: "Pending", priority: "Low" },
    { followupFor: "Rohit Patel", followupForType: "Candidate", company: "Capgemini", relatedTo: "UI/UX Designer", subject: "Portfolio Follow-up", note: "Candidate hasn't responded in 4 days.", date: daysFromNow(-2, 10, 0), time: "10:00 AM", assignedTo: "Anjali Desai", assignedToRole: "HR Manager", status: "Overdue", priority: "High" },
    { followupFor: "Karan Mehta", followupForType: "Candidate", company: "Reliance Retail", relatedTo: "Business Analyst", subject: "Second Interview Follow-up", note: "Overdue - reach out today.", date: daysFromNow(-1, 11, 0), time: "11:00 AM", assignedTo: "Vikram Joshi", assignedToRole: "Tech Lead", status: "Overdue", priority: "Medium" },
  ]);

  await Activity.insertMany([
    { text: "Rahul Kumar added as candidate", type: "add" },
    { text: "Priya Sharma scheduled an interview", type: "schedule" },
    { text: "Offer released to Neha Gupta", type: "offer" },
    { text: "Client ABC Corp added new job", type: "job" },
    { text: "Mohit Verma joined the company", type: "join" },
    { text: "Candidate Akash Dubey rejected", type: "reject" },
  ]);
  
  await Joining.insertMany([
    { candidateName: "Rahul Sharma", candidatePhone: "9876543210", position: "MERN Stack Developer", client: "TCS Technologies", offerAcceptedOn: daysFromNow(-5, 12, 0), doj: daysFromNow(-2, 9, 0), status: "Joined", workLocation: "Mumbai" },
    { candidateName: "Amit Verma", candidatePhone: "9988776655", position: "Java Developer", client: "HCL Technologies", offerAcceptedOn: daysFromNow(-4, 12, 0), doj: daysFromNow(-1, 9, 0), status: "Joined", workLocation: "Noida" },
    { candidateName: "Rohit Patel", candidatePhone: "7766554433", position: "UI/UX Designer", client: "Capgemini", offerAcceptedOn: daysFromNow(-3, 12, 0), doj: daysFromNow(0, 9, 0), status: "Joined", workLocation: "Pune" },
    { candidateName: "Priya Singh", candidatePhone: "9123456780", position: "HR Executive", client: "Infosys Limited", offerAcceptedOn: daysFromNow(-2, 12, 0), doj: daysFromNow(0, 9, 0), status: "Joined", workLocation: "Bangalore" },
    { candidateName: "Sneha Yadav", candidatePhone: "7894561230", position: "Digital Marketing Executive", client: "Wipro Limited", offerAcceptedOn: daysFromNow(-1, 12, 0), doj: daysFromNow(1, 9, 0), status: "Yet to Join", workLocation: "Hyderabad" },
    { candidateName: "Karan Mehta", candidatePhone: "8877665544", position: "Business Analyst", client: "Reliance Retail", offerAcceptedOn: daysFromNow(-1, 12, 0), doj: daysFromNow(3, 9, 0), status: "Yet to Join", workLocation: "Mumbai" },
    { candidateName: "Deepak Yadav", candidatePhone: "9012345678", position: "DevOps Engineer", client: "Tech Mahindra", offerAcceptedOn: daysFromNow(-2, 12, 0), doj: daysFromNow(-1, 9, 0), status: "No Show", workLocation: "Bangalore" },
    { candidateName: "Pooja Sharma", candidatePhone: "9345678901", position: "QA Engineer", client: "Byju's", offerAcceptedOn: daysFromNow(-3, 12, 0), doj: daysFromNow(2, 9, 0), status: "Offer Drop", workLocation: "Chennai" },
    { candidateName: "Anjali Kapoor", candidatePhone: "9223344556", position: "React Developer", client: "L&T Infotech", offerAcceptedOn: daysFromNow(0, 12, 0), doj: daysFromNow(5, 9, 0), status: "Yet to Join", workLocation: "Pune" },
    { candidateName: "Vivek Nair", candidatePhone: "9556677889", position: "Backend Developer", client: "ICICI Bank", offerAcceptedOn: daysFromNow(0, 12, 0), doj: daysFromNow(-4, 9, 0), status: "Yet to Join", workLocation: "Mumbai" },
  ]);

  await DailyActivity.insertMany([
    { activityName: "Client Call", type: "Client Call", relatedTo: "Reliance Retail", details: "Discussed Requirement for Sales Manager - Delhi", ownerName: "Anjali Desai", ownerRole: "HR Manager", date: daysFromNow(0, 10, 30), time: "10:30 AM", priority: "High", status: "Completed" },
    { activityName: "Follow-up", type: "Candidate Follow-up", relatedTo: "Rahul Sharma", details: "Follow-up for RD 1 Interview Feedback", ownerName: "Vikram Joshi", ownerRole: "Tech Lead", date: daysFromNow(0, 11, 15), time: "11:15 AM", priority: "Medium", status: "Completed" },
    { activityName: "Interview Scheduled", type: "Interview", relatedTo: "Priya Singh", details: "Scheduled Technical Interview with Client", ownerName: "Neha Gupta", ownerRole: "HR Executive", date: daysFromNow(0, 13, 0), time: "01:00 PM", priority: "High", status: "In Progress" },
    { activityName: "Networking", type: "Networking", relatedTo: "Dr. Mehta Clinic", details: "Connected for Hiring Lab Technician", ownerName: "Rahul Sharma", ownerRole: "Recruiter", date: daysFromNow(0, 14, 30), time: "02:30 PM", priority: "Medium", status: "In Progress" },
    { activityName: "Job Posting", type: "Other Activity", relatedTo: "Marketing Executive", details: "Posted Job on Naukri & LinkedIn", ownerName: "Priya Singh", ownerRole: "HR Executive", date: daysFromNow(0, 16, 0), time: "04:00 PM", priority: "Low", status: "Completed" },
    { activityName: "Follow-up", type: "Candidate Follow-up", relatedTo: "Amit Verma", details: "Shared Offer Details & Follow-up", ownerName: "Sanjay Kushwaha", ownerRole: "Admin", date: daysFromNow(0, 17, 15), time: "05:15 PM", priority: "Low", status: "Pending" },
  ]);

  await Revenue.insertMany([
    { invoiceNo: "INV-2024-051", client: "TCS Technologies", jobService: "Software Developer", revenueType: "Placement Fees", invoiceDate: daysFromNow(-6), amount: 240000, tax: 0, netAmount: 240000, status: "Paid", paymentDate: daysFromNow(-4), remarks: "Placement fee for MERN developer joining.", poContractNo: "PO-2024-1256", billingCurrency: "INR", paymentMode: "Bank Transfer", paymentReference: "UTR4567891230", candidateName: "Rahul Sharma", candidateStatus: "Joined", source: "Naukri.com", hasAssociate: true, associateName: "Aman Singh", commissionType: "Percentage", commissionPercent: 20, commissionAmount: 48000 },
    { invoiceNo: "INV-2024-050", client: "Infosys Limited", jobService: "HR Executive", revenueType: "Placement Fees", invoiceDate: daysFromNow(-8), amount: 180000, status: "Paid", paymentDate: daysFromNow(-6) },
    { invoiceNo: "INV-2024-049", client: "Reliance Retail", jobService: "Business Analyst", revenueType: "Placement Fees", invoiceDate: daysFromNow(-11), amount: 160000, status: "Pending" },
    { invoiceNo: "INV-2024-048", client: "HCL Technologies", jobService: "Java Developer", revenueType: "Placement Fees", invoiceDate: daysFromNow(-12), amount: 140000, status: "Paid", paymentDate: daysFromNow(-10) },
    { invoiceNo: "INV-2024-047", client: "Wipro Limited", jobService: "Digital Marketing", revenueType: "Consulting Fees", invoiceDate: daysFromNow(-14), amount: 120000, status: "Pending" },
    { invoiceNo: "INV-2024-046", client: "Dr. Mehta Clinic", jobService: "Recruitment Support", revenueType: "Consulting Fees", invoiceDate: daysFromNow(-16), amount: 80000, status: "Paid", paymentDate: daysFromNow(-14) },
    { invoiceNo: "INV-2024-045", client: "Tech Mahindra", jobService: "Training Program", revenueType: "Training Fees", invoiceDate: daysFromNow(-18), amount: 150000, status: "Paid", paymentDate: daysFromNow(-17) },
    { invoiceNo: "INV-2024-044", client: "Capgemini", jobService: "Frontend Developer", revenueType: "Placement Fees", invoiceDate: daysFromNow(-20), amount: 130000, status: "Overdue" },
  ]);

  // ==========================================
  // INVOICES (Matching Screenshot: 64 Invoices, ₹ 26,80,000)
  // ==========================================
  const primaryInvoices = [
    { invoiceNo: "INV-2024-064", client: "TCS Technologies", clientLogo: "TCS", jobService: "Software Developer", invoiceType: "Placement Fees", invoiceDate: fixedDate(2024, 4, 20), dueDate: fixedDate(2024, 4, 30), amount: 240000, status: "Paid", paymentDate: fixedDate(2024, 4, 28), paymentMode: "Bank Transfer", paymentReference: "UTR-89123049", notes: "Full placement fee settled." },
    { invoiceNo: "INV-2024-063", client: "Infosys Limited", clientLogo: "INFY", jobService: "HR Executive", invoiceType: "Placement Fees", invoiceDate: fixedDate(2024, 4, 18), dueDate: fixedDate(2024, 4, 28), amount: 180000, status: "Paid", paymentDate: fixedDate(2024, 4, 25), paymentMode: "Bank Transfer", paymentReference: "UTR-77123982", notes: "HR Executive placement." },
    { invoiceNo: "INV-2024-062", client: "Reliance Retail", clientLogo: "REL", jobService: "Business Analyst", invoiceType: "Placement Fees", invoiceDate: fixedDate(2024, 4, 15), dueDate: fixedDate(2024, 4, 25), amount: 160000, status: "Pending", notes: "Awaiting finance approval." },
    { invoiceNo: "INV-2024-061", client: "HCL Technologies", clientLogo: "HCL", jobService: "Java Developer", invoiceType: "Placement Fees", invoiceDate: fixedDate(2024, 4, 14), dueDate: fixedDate(2024, 4, 24), amount: 140000, status: "Paid", paymentDate: fixedDate(2024, 4, 22), paymentMode: "Bank Transfer", paymentReference: "UTR-66129841", notes: "Payment processed on time." },
    { invoiceNo: "INV-2024-060", client: "Wipro Limited", clientLogo: "WPRO", jobService: "Digital Marketing", invoiceType: "Consulting Fees", invoiceDate: fixedDate(2024, 4, 12), dueDate: fixedDate(2024, 4, 22), amount: 120000, status: "Pending", notes: "Invoice under processing." },
    { invoiceNo: "INV-2024-059", client: "Dr. Mehta Clinic", clientLogo: "DMC", jobService: "Recruitment Support", invoiceType: "Consulting Fees", invoiceDate: fixedDate(2024, 4, 10), dueDate: fixedDate(2024, 4, 20), amount: 80000, status: "Paid", paymentDate: fixedDate(2024, 4, 19), paymentMode: "UPI", paymentReference: "UPI-4910283", notes: "Consulting retainership fee." },
    { invoiceNo: "INV-2024-058", client: "Tech Mahindra", clientLogo: "TM", jobService: "Training Program", invoiceType: "Training Fees", invoiceDate: fixedDate(2024, 4, 8), dueDate: fixedDate(2024, 4, 18), amount: 150000, status: "Overdue", notes: "Follow-up sent 3 times." },
    { invoiceNo: "INV-2024-057", client: "Capgemini", clientLogo: "CAP", jobService: "Frontend Developer", invoiceType: "Placement Fees", invoiceDate: fixedDate(2024, 4, 6), dueDate: fixedDate(2024, 4, 16), amount: 130000, status: "Overdue", notes: "Overdue reminder escalation." },
  ];

  const clientPool = [
    { name: "TCS Technologies", logo: "TCS", job: "Full Stack Engineer", type: "Placement Fees" },
    { name: "Infosys Limited", logo: "INFY", job: "Data Scientist", type: "Placement Fees" },
    { name: "HCL Technologies", logo: "HCL", job: "DevOps Specialist", type: "Placement Fees" },
    { name: "Wipro Limited", logo: "WPRO", job: "Cloud Architect", type: "Consulting Fees" },
    { name: "Reliance Retail", logo: "REL", job: "Supply Chain Manager", type: "Placement Fees" },
    { name: "L&T Infotech", logo: "L&T", job: "Embedded Developer", type: "Placement Fees" },
    { name: "Tech Mahindra", logo: "TM", job: "Corporate Workshop", type: "Training Fees" },
    { name: "Capgemini", logo: "CAP", job: "React Native Lead", type: "Placement Fees" },
    { name: "ICICI Bank", logo: "ICICI", job: "Wealth Manager", type: "Placement Fees" },
    { name: "Byju's", logo: "BYJU", job: "Academic Specialist", type: "Consulting Fees" },
  ];

  const allInvoices = [...primaryInvoices];

  // We need total:
  // 38 Paid (total: 18,40,000). Current 4 paid sum = 6,40,000 -> remaining 34 paid sum = 12,00,000 (~35,294 each)
  // 16 Pending (total: 6,20,000). Current 2 pending sum = 2,80,000 -> remaining 14 pending sum = 3,40,000 (~24,285 each)
  // 10 Overdue (total: 2,20,000). Current 2 overdue sum = 2,80,000. Let's adjust older overdue sums so aging buckets align:
  // Overdue aging: 1-15d (80k), 16-30d (90k), 31-60d (40k), 60+d (10k) = 2,20,000 total

  let invCounter = 56;

  // Add remaining Paid invoices (34 items totaling 12,00,000)
  const paidAmounts = [
    50000, 45000, 40000, 35000, 30000, 40000, 50000, 35000, 45000, 30000,
    35000, 40000, 25000, 30000, 35000, 40000, 35000, 30000, 45000, 50000,
    25000, 35000, 30000, 40000, 35000, 30000, 25000, 35000, 30000, 40000,
    30000, 25000, 30000, 29000
  ];
  paidAmounts.forEach((amt, i) => {
    const c = clientPool[i % clientPool.length];
    const invDate = fixedDate(2024, 3, 1 + (i % 28));
    const dueDate = new Date(invDate.getTime() + 10 * 24 * 60 * 60 * 1000);
    allInvoices.push({
      invoiceNo: `INV-2024-${String(invCounter--).padStart(3, "0")}`,
      client: c.name,
      clientLogo: c.logo,
      jobService: c.job,
      invoiceType: c.type,
      invoiceDate: invDate,
      dueDate: dueDate,
      amount: amt,
      status: "Paid",
      paymentDate: new Date(dueDate.getTime() - 2 * 24 * 60 * 60 * 1000),
      paymentMode: "Bank Transfer",
      paymentReference: `UTR-20240${i}`,
      notes: "Settled upon milestone completion.",
    });
  });

  // Add remaining Pending invoices (14 items totaling 3,40,000)
  const pendingAmounts = [
    30000, 25000, 25000, 20000, 30000, 25000, 20000, 30000, 25000, 20000,
    25000, 20000, 25000, 20000
  ];
  pendingAmounts.forEach((amt, i) => {
    const c = clientPool[(i + 3) % clientPool.length];
    const invDate = fixedDate(2024, 4, 1 + (i % 20));
    const dueDate = new Date(invDate.getTime() + 12 * 24 * 60 * 60 * 1000);
    allInvoices.push({
      invoiceNo: `INV-2024-${String(invCounter--).padStart(3, "0")}`,
      client: c.name,
      clientLogo: c.logo,
      jobService: c.job,
      invoiceType: c.type,
      invoiceDate: invDate,
      dueDate: dueDate,
      amount: amt,
      status: "Pending",
      notes: "Invoice sent to client AP.",
    });
  });

  // Add remaining Overdue invoices (8 items matching aging buckets totaling remaining amount)
  const overdueItems = [
    { amt: 40000, daysAgo: 5, note: "1-15 days overdue" },
    { amt: 40000, daysAgo: 10, note: "1-15 days overdue" },
    { amt: 50000, daysAgo: 20, note: "16-30 days overdue" },
    { amt: 40000, daysAgo: 25, note: "16-30 days overdue" },
    { amt: 20000, daysAgo: 40, note: "31-60 days overdue" },
    { amt: 20000, daysAgo: 50, note: "31-60 days overdue" },
    { amt: 5000, daysAgo: 70, note: "60+ days overdue" },
    { amt: 5000, daysAgo: 85, note: "60+ days overdue" },
  ];
  overdueItems.forEach((item, i) => {
    const c = clientPool[(i + 5) % clientPool.length];
    const dueDate = daysFromNow(-item.daysAgo);
    const invDate = new Date(dueDate.getTime() - 10 * 24 * 60 * 60 * 1000);
    allInvoices.push({
      invoiceNo: `INV-2024-${String(invCounter--).padStart(3, "0")}`,
      client: c.name,
      clientLogo: c.logo,
      jobService: c.job,
      invoiceType: c.type,
      invoiceDate: invDate,
      dueDate: dueDate,
      amount: item.amt,
      status: "Overdue",
      notes: item.note,
    });
  });

  await Invoice.insertMany(allInvoices);

  console.log(`Seed complete! Seeded ${allInvoices.length} invoices.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
