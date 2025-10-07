const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

async function sendOtp(phone, otp) {
  try {
    await client.messages.create({
      body: `Your OTP for job acceptance is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log(`OTP sent to ${phone}: ${otp}`);
  } catch (err) {
    console.error('Error sending OTP:', err);
    throw new Error('Failed to send OTP');
  }
}

module.exports = sendOtp;
