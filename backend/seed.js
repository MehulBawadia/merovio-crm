import mongoose from "mongoose";
import "dotenv/config";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { Lead } from "./models/Lead.js";
import { Contact } from "./models/Contact.js";
import { Note } from "./models/Note.js";
import { Task } from "./models/Task.js";

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (n) => new Date(Date.now() - n * DAY);
const daysAhead = (n) => new Date(Date.now() + n * DAY);
const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickSome = (arr, n) =>
  [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const weighted = (pairs) => {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let r = Math.random() * total;
  for (const [v, w] of pairs) {
    if ((r -= w) <= 0) return v;
  }
  return pairs[0][0];
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const COMPANIES = [
  ["Apple", "apple.com"],
  ["Microsoft", "microsoft.com"],
  ["Google", "google.com"],
  ["Amazon", "amazon.com"],
  ["Meta", "meta.com"],
  ["Netflix", "netflix.com"],
  ["Adobe", "adobe.com"],
  ["Salesforce", "salesforce.com"],
  ["Oracle", "oracle.com"],
  ["IBM", "ibm.com"],
  ["Intel", "intel.com"],
  ["NVIDIA", "nvidia.com"],
  ["AMD", "amd.com"],
  ["Cisco", "cisco.com"],
  ["Dell Technologies", "dell.com"],
  ["HP", "hp.com"],
  ["Samsung", "samsung.com"],
  ["Sony", "sony.com"],
  ["LG", "lg.com"],
  ["Siemens", "siemens.com"],
  ["SAP", "sap.com"],
  ["Shopify", "shopify.com"],
  ["Stripe", "stripe.com"],
  ["PayPal", "paypal.com"],
  ["Uber", "uber.com"],
  ["Airbnb", "airbnb.com"],
  ["Spotify", "spotify.com"],
  ["Dropbox", "dropbox.com"],
  ["Zoom", "zoom.us"],
  ["Slack", "slack.com"],
  ["Atlassian", "atlassian.com"],
  ["Cloudflare", "cloudflare.com"],
  ["Twilio", "twilio.com"],
  ["Snowflake", "snowflake.com"],
  ["Datadog", "datadoghq.com"],
  ["HubSpot", "hubspot.com"],
  ["Canva", "canva.com"],
  ["Figma", "figma.com"],
  ["Notion", "notion.so"],
  ["OpenAI", "openai.com"],
];

const FIRST = [
  "Liam",
  "Noah",
  "Oliver",
  "Elijah",
  "James",
  "William",
  "Benjamin",
  "Lucas",
  "Henry",
  "Alexander",
  "Ethan",
  "Michael",
  "Daniel",
  "Matthew",
  "Jackson",
  "Sebastian",
  "Jack",
  "Aiden",
  "Owen",
  "Samuel",
  "David",
  "Joseph",
  "John",
  "Levi",
  "Wyatt",
  "Luke",
  "Julian",
  "Gabriel",
  "Isaac",
  "Anthony",
  "Grace",
  "Emma",
  "Olivia",
  "Sophia",
  "Charlotte",
  "Amelia",
  "Mia",
  "Ava",
  "Harper",
  "Ella",
];

const LAST = [
  "Smith",
  "Johnson",
  "Williams",
  "Brown",
  "Jones",
  "Garcia",
  "Miller",
  "Davis",
  "Rodriguez",
  "Martinez",
  "Hernandez",
  "Lopez",
  "Gonzalez",
  "Wilson",
  "Anderson",
  "Thomas",
  "Taylor",
  "Moore",
  "Jackson",
  "Martin",
  "Lee",
  "Perez",
  "Thompson",
  "White",
  "Harris",
  "Sanchez",
  "Clark",
  "Lewis",
  "Walker",
  "Young",
];

const TITLES = [
  "Software Engineer",
  "Senior Software Engineer",
  "Engineering Manager",
  "Product Manager",
  "Senior Product Manager",
  "Product Designer",
  "UX Designer",
  "Data Scientist",
  "DevOps Engineer",
  "QA Engineer",
  "Marketing Manager",
  "Sales Manager",
  "Customer Success Manager",
  "HR Manager",
  "Chief Technology Officer",
];

const TAGS = [
  "Engineering",
  "Product",
  "Design",
  "Data",
  "DevOps",
  "Quality Assurance",
  "Marketing",
  "Sales",
  "Customer Success",
  "Human Resources",
];

const SOURCES = [
  "Website",
  "Referral",
  "Cold Outreach",
  "Social",
  "Event",
  "Other",
];

const NOTE_TEMPLATES = [
  (c) =>
    `Discovery call with ${c} went well. Strong interest in the analytics module. Loop in a solution engineer for the technical deep-dive.`,

  (c) =>
    `Followed up with ${c} regarding the proposal shared last week. Awaiting internal approval before moving to the next stage.`,

  (c) =>
    `Product demo completed for ${c}. The team responded positively to the automation workflows and reporting dashboard.`,

  (c) =>
    `${c} requested a pricing breakdown for the Enterprise plan, including implementation and onboarding costs.`,

  (c) =>
    `Connected with the procurement team at ${c}. They expect the vendor evaluation process to conclude by the end of the month.`,

  (c) =>
    `${c} expressed concerns about CRM migration. Shared documentation and offered a dedicated onboarding session.`,

  (c) =>
    `Sent a follow-up email to ${c} with the meeting summary, feature comparison, and relevant case studies.`,

  (c) =>
    `${c} is comparing our solution with two competitors. Key differentiators highlighted were AI capabilities, ease of use, and customer support.`,

  (c) =>
    `Stakeholder meeting with ${c} has been rescheduled to next week. Decision-maker will also be joining the discussion.`,

  (c) =>
    `${c} confirmed interest in moving forward. Next step is to finalize commercial terms and prepare the contract for review.`,
];

const TASK_TEMPLATES = [
  (c) => `Schedule a product demo with ${c}.`,
  (c) => `Follow up with ${c} regarding the proposal sent last week.`,
  (c) => `Prepare a customized pricing quote for ${c}.`,
  (c) => `Send case studies and customer success stories to ${c}.`,
  (c) => `Book a technical deep-dive session with ${c}'s engineering team.`,
  (c) =>
    `Call ${c} to discuss their implementation timeline and onboarding plan.`,
  (c) => `Share the latest product brochure and feature comparison with ${c}.`,
  (c) => `Check in with ${c} to address any objections before contract review.`,
  (c) => `Coordinate with the solutions engineer to support ${c}'s evaluation.`,
  (c) =>
    `Prepare the contract and send it to ${c} for legal and procurement review.`,
];

const personName = () => `${pick(FIRST)} ${pick(LAST)}`;
const emailFor = (name, domain) => `${slug(name.split(" ")[0])}@${domain}`;

const run = async () => {
  await connectDB();

  let user = await User.findOne({ email: "demouser@example.com" });
  if (user) {
    await Promise.all([
      Lead.deleteMany({ owner: user._id }),
      Contact.deleteMany({ owner: user._id }),
      Note.deleteMany({ owner: user._id }),
      Task.deleteMany({ owner: user._id }),
    ]);
  } else {
    user = await User.create({
      name: "Demo User",
      email: "demouser@example.com",
      password: "Password@123$",
      company: "BestIn Co.",
    });
  }
  const owner = user._id;

  const stageOrder = { New: 0, Qualified: 0, Proposal: 0, Won: 0, Lost: 0 };
  const leadDocs = [];
  const usedCompanies = pickSome(COMPANIES, 40);

  for (let i = 0; i < 40; i++) {
    const [company, domain] = usedCompanies[i] || pick(COMPANIES);
    const name = personName();
    const status = weighted([
      ["New", 28],
      ["Qualified", 24],
      ["Proposal", 20],
      ["Won", 16],
      ["Lost", 12],
    ]);

    const ageDays =
      status === "Won" || status === "Lost" ? rand(20, 175) : rand(0, 120);

    leadDocs.push({
      owner,
      name,
      email: emailFor(name, domain),
      phone: `+1 555 0${rand(100, 999)}`,
      company,
      status,
      priority: weighted([
        ["High", 35],
        ["Medium", 45],
        ["Low", 20],
      ]),
      source: pick(SOURCES),
      value: rand(8, 220) * 1000,
      notes: pick([
        "Followed up with Acme Corp. Awaiting feedback.",
        "Product demo scheduled with Globex for Friday.",
        "Sent pricing details to Initech.",
        "Wayne Enterprises requested a security overview.",
        "Umbrella Corporation is reviewing the proposal.",
        "",
      ]),
      tags: pickSome(["saas", "enterprise", "smb", "priority"], rand(0, 2)),
      order: stageOrder[status]++,
      createdAt: daysAgo(ageDays),
      updatedAt: daysAgo(rand(0, Math.min(ageDays, 14))),
    });
  }
  const leads = await Lead.insertMany(leadDocs);

  const contactDocs = [];
  for (let i = 0; i < 26; i++) {
    const [company, domain] = pick(COMPANIES);
    const name = personName();

    contactDocs.push({
      owner,
      name,
      title: pick(TITLES),
      company,
      email: emailFor(name, domain),
      phone: `+1 555 0${rand(100, 999)}`,
      tags: pickSome(TAGS, rand(1, 3)),
      favorite: Math.random() < 0.22,
      note:
        Math.random() < 0.5
          ? pick([
              "Primary point of contact",
              "Prefers email over call",
              "Met at SaaStr 2025",
              "Key Technical Evaluator",
            ])
          : "",
      createdAt: daysAgo(rand(0, 160)),
    });
  }
  await Contact.insertMany(contactDocs);

  const noteDocs = [];
  for (let i = 0; i < 22; i++) {
    const lead = pick(leads);

    noteDocs.push({
      owner,
      content: pick(NOTE_TEMPLATES)(lead.company),
      lead: lead._id,
      pinned: Math.random() < 0.25,
      createdAt: daysAgo(rand(0, 90)),
    });
  }
  await Note.insertMany(noteDocs);

  const taskDocs = [];
  for (let i = 0; i < 28; i++) {
    const lead = pick(leads);
    const bucket = weighted([
      ["overdue", 22],
      ["today", 12],
      ["upcoming", 46],
      ["completed", 20],
    ]);

    let dueDate,
      status,
      completedAt = null;

    if (bucket === "overdue") {
      dueDate = daysAgo(rand(1, 18));
      status = weighted([
        ["Pending", 60],
        ["In Progress", 50],
      ]);
    } else if (bucket === "today") {
      dueDate = new Date();
      status = weighted([
        ["Pending", 50],
        ["In Progress", 50],
      ]);
    } else if (bucket === "upcoming") {
      dueDate = daysAhead(rand(1, 30));
      status = weighted([
        ["Pending", 65],
        ["In Progress", 35],
      ]);
    } else {
      dueDate = daysAgo(rand(1, 30));
      status = "Completed";
      completedAt = daysAgo(0, 10);
    }

    taskDocs.push({
      owner,
      title: pick(TASK_TEMPLATES)(lead.company),
      description:
        Math.random() < 0.5
          ? pick([
              "Reference the latest proposal and pricing.",
              "Coordinate with the solutions engineering team.",
              "Confirm the next steps and decision timeline.",
              "",
            ])
          : "",
      dueDate,
      status,
      priority: weighted([
        ["High", 35],
        ["Medium", 45],
        ["Low", 20],
      ]),
      relatedLead: lead._id,
      completedAt,
      createdAt: daysAgo(rand(0, 40)),
    });
  }
  await Task.insertMany(taskDocs);

  console.log("Seed completed for the Demo User workspace:");
  console.log(`${leads.length} leads`);
  console.log(`${contactDocs.length} contacts`);
  console.log(`${noteDocs.length} notes`);
  console.log(`${taskDocs.length} tasks`);
  console.log("Login -> demouser@example.com / Password@123$");

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
