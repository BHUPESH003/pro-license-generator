import AWS from "aws-sdk";

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL;

interface SendEmailParams {
  email: string;
  template: string;
  data?: Record<string, any>;
  from?: string;
}

export async function sendEmailToSQS({
  email,
  template,
  data,
  from = "MY Clean One <support@mycleanone.com>",
}: SendEmailParams): Promise<AWS.SQS.SendMessageResult> {
  if (!QUEUE_URL) throw new Error("AWS_SQS_QUEUE_URL not configured");
  const message = {
    from,
    email,
    template,
    data,
  };
  const params = {
    QueueUrl: QUEUE_URL,
    MessageBody: JSON.stringify(message),
  };
  return sqs.sendMessage(params).promise();
}

// Example usage:
// (async () => {
//   await sendEmailToSQS({email: "test@example.com", template: "otp_email", data: { otp: "123456" }});
// })();
