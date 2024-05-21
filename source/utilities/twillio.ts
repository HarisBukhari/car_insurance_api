require('dotenv').config()
// Download the helper library from https://www.twilio.com/docs/node/install
// Set environment variables for your credentials
// Read more at http://twil.io/secure

const accountSid = process.env.Twilio_ID
const authToken = process.env.Twilio_Token
const verifySid = process.env.verifySid
const client = require("twilio")(accountSid, authToken)

client.verify.v2
  .services(verifySid)
  .verifications.create({ to: "+923136320989", channel: "sms" })
  .then((verification:any) => console.log(verification.status))
  .then(() => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    readline.question("Please enter the OTP:", (otpCode: any) => {
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: "+923136320989", code: otpCode })
        .then((verification_check: { status: any }) => console.log(verification_check.status))
        .then(() => readline.close())
    })
  })