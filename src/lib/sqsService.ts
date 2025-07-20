import AWS from "aws-sdk";

const sqs = new AWS.SQS({ region: process.env.AWS_REGION });
const QUEUE_URL = process.env.AWS_SQS_QUEUE_URL!;

interface SendEmailParams {
  email: string;
  template: string;
  data?: Record<string, any>;
}

export async function sendEmailToSQS({
  email,
  template,
  data,
}: SendEmailParams) {
  const message = {
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
