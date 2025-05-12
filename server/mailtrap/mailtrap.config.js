import { MailtrapClient } from "mailtrap";

export const mailtrapClient = new MailtrapClient({
  endpoint: process.env.MAILTRAP_ENDPOINT,
  token: process.env.MAILTRAP_TOKEN,
});
export const sender = { email: "openfunds@partin.ch", name: "Michael" };
