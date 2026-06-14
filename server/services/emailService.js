const nodemailer = require('nodemailer');







const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const FROM = `"Massar" <${process.env.EMAIL_USER}>`;




const sendVerificationEmail = async (email, name, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Verify your Massar account',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#7494ec;margin-bottom:8px;">Welcome, ${name}!</h2>
        <p style="color:#444;line-height:1.6;">
          Thanks for signing up. Please verify your email address by clicking the button below.
          This link expires in <strong>24 hours</strong>.
        </p>
        <a href="${url}"
           style="display:inline-block;margin-top:20px;padding:13px 30px;background:#7494ec;color:#fff;border-radius:30px;text-decoration:none;font-weight:600;font-size:15px;">
          Verify Email
        </a>
        <p style="color:#888;font-size:13px;margin-top:24px;">
          If you did not create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};



const sendPasswordResetEmail = async (email, name, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password/${token}`;

  await transporter.sendMail({
    from: FROM,
    to: email,
    subject: 'Reset your Jordan Explorer password',
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;border:1px solid #e5e7eb;border-radius:12px;">
        <h2 style="color:#7494ec;margin-bottom:8px;">Password Reset</h2>
        <p style="color:#444;line-height:1.6;">
          Hi ${name}, we received a request to reset your password.
          Click the button below — this link expires in <strong>1 hour</strong>.
        </p>
        <a href="${url}"
           style="display:inline-block;margin-top:20px;padding:13px 30px;background:#7494ec;color:#fff;border-radius:30px;text-decoration:none;font-weight:600;font-size:15px;">
          Reset Password
        </a>
        <p style="color:#888;font-size:13px;margin-top:24px;">
          If you did not request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
  });
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };