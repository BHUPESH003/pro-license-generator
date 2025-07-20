const AWS = require("aws-sdk");
const nodemailer = require("nodemailer");
require("dotenv").config();

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function renderTemplate(template, data) {
  // Replace with your template engine or logic
  if (template === "password-setup") {
    return `Click here to set your password: ${data.setupUrl}`;
  }
  if (template === "license-key") {
    return `Your license key: ${data.licenseKey}`;
  }
  return "Email content";
}

async function processMessage(message) {
  let parsed;
  try {
    parsed = JSON.parse(message.Body);
  } catch (err) {
    console.warn("Malformed SQS message, skipping:", message.Body);
    return;
  }
  const { email, template, data } = parsed;
  if (!email || typeof email !== "string" || !email.includes("@")) {
    console.warn(
      "No valid recipient email found in message, skipping:",
      message.Body
    );
    return;
  }
  const subjectMap = {
    "password-setup": "Set up your password",
    "license-key": "Your License Key",
    "password-reset": "Reset your password",
    register: "Welcome to the platform",
  };
  const subject = subjectMap[template] || "Notification";
  const html = await renderTemplate(template, data);
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    html,
  });
}

async function pollQueue() {
  while (true) {
    try {
      const result = await sqs
        .receiveMessage({
          QueueUrl: QUEUE_URL,
          MaxNumberOfMessages: 5,
          WaitTimeSeconds: 20,
        })
        .promise();
      console.log("SQS receiveMessage result:", result); // Add this line
      if (result.Messages) {
        for (const message of result.Messages) {
          try {
            // console.log("Processing message:", message); // Add this line
            await processMessage(message);
            await sqs
              .deleteMessage({
                QueueUrl: QUEUE_URL,
                ReceiptHandle: message.ReceiptHandle,
              })
              .promise();
            console.log("Email sent and message deleted");
          } catch (err) {
            console.error("Failed to process message:", err);
          }
        }
      } else {
        console.log("No messages received from SQS."); // Add this line
      }
    } catch (err) {
      console.error("SQS poll error:", err);
    }
  }
}

pollQueue();
