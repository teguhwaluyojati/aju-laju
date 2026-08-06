declare module "nodemailer" {
  type MailOptions = {
    from: string;
    to: string;
    subject: string;
    html: string;
    text: string;
  };

  type Transporter = {
    sendMail(options: MailOptions): Promise<unknown>;
  };

  type TransportOptions = {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  };

  const nodemailer: {
    createTransport(options: TransportOptions): Transporter;
  };

  export default nodemailer;
}