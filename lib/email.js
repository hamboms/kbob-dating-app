import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: process.env.EMAIL_SERVER_PORT,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendVerificationEmail(email, name, verificationUrl) {
  try {
    await transporter.sendMail({
      from: `"kbob" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '[kbob] 회원가입을 위한 이메일 인증을 완료해주세요.',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4A90E2;">안녕하세요, ${name}님!</h2>
            <p>kbob에 가입해주셔서 감사합니다. 가입을 완료하려면 아래 버튼을 클릭하여 이메일 주소를 인증해주세요.</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #4A90E2; color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 16px;">
              이메일 인증하기
            </a>
            <p>이 링크는 1시간 동안 유효합니다.</p>
            <p style="font-size: 12px; color: #888;">만약 버튼이 작동하지 않으면, 아래 주소를 복사하여 브라우저에 붙여넣어 주세요:<br>${verificationUrl}</p>
          </div>
        </div>
      `,
    });
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email from lib/email.js:', error);
    throw new Error('Email could not be sent.');
  }
}
