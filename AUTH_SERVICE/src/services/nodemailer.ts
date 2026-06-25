import nodemailer from 'nodemailer';

const EMAIL_CONFIG = {
  service: 'gmail',
  auth: {
    user: 'gyikxx2@gmail.com',
    pass: 'xkoo jtqm niaw clna', // Use App Password if using Gmail
  },
};

export async function sendEmail(to: string, code : number) {
  const transporter = nodemailer.createTransport(EMAIL_CONFIG);

  const mailOptions = {
    from: EMAIL_CONFIG.auth.user,
    to,
    subject: 'Email Verification',
    text: `Your verification code is: ${code}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }

}
