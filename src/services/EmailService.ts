import nodemailer from 'nodemailer'

async function sendEmail(to: string, subject: string, text: string, html?: string) {
  // Make sure environment variables are set (avoid storing passwords in code)
  if (!process.env.googleUserMail || !process.env.googleUserMail_Password) {
    throw new Error('Missing Gmail credentials in environment variables')
  }

  const transporter = nodemailer.createTransport({
    service: process.env.nodeMailer_Service,
    host: process.env.nodeMailer_Service_Host,
    port: parseInt(process.env.nodeMailer_Service_Port),
    secure: false,
    auth: {
        user: process.env.googleUserMail,
        pass: process.env.googleUserMail_Password
    }
  })

  const mailOptions = {
    from: {
      name: process.env.appName,
      address: process.env.googleUserMail,
    },
    to,
    subject,
    text,
    ...(html ? { html } : {}), // Include html only if provided
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending email:', error)
    throw error // Re-throw the error for handling in your app
  }
}

//  Code for token Only
// const sendEmail = async (email: string, token: string) => {
//   const transporter = nodemailer.createTransport({
//     // Configure your email service details here
//     service: 'gmail', // Replace with your email service
//     auth: {
//       user: 'your_email@gmail.com', // Replace with your email
//       pass: 'your_password', // Replace with your password (consider env variables)
//     },
//   });

//   const mailOptions = {
//     from: 'your_email@gmail.com', // Replace with your email
//     to: email,
//     subject: 'Password Reset Link',
//     html: `
//       <p>Click on the following link to reset your password:</p>
//       <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
//     `,
//   };

//   await transporter.sendMail(mailOptions);
// }

export default sendEmail
