import moment from 'moment'
import nodemailer, { Transporter } from 'nodemailer'

export async function sendBookingConfirmationEmail(
  to: string,
  concertName: string,
  seatType: string,
  concertDate: Date,
  code: string
) {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    }
  })

  const html = `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #ccc; border-radius: 8px; padding: 20px; background: #fdfdfd;">
    <h2 style="color: #2e86de; text-align: center;">🎫 Your Ticket Confirmation</h2>
    <hr />
    <p><strong>Code:</strong> <code>${code}</code></p>
    <p><strong>Concert:</strong> ${concertName}</p>
    <p><strong>Date:</strong> ${moment(concertDate).format('MMMM Do YYYY, h:mm a')}</p>
    <p><strong>Seat Type:</strong> ${seatType}</p>
    <p><strong>Status:</strong> ✅ Confirmed</p>
    <hr />
    <p style="text-align: center; font-size: 12px; color: gray;">Thank you for booking with Concert Booking Inc.</p>
  </div>
  `

  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to,
    subject: `🎫 Booking Confirmation for ${concertName}`,
    text: `You successfully booked a ${seatType} seat for ${concertName}.`,
    html
  }

  await transporter.sendMail(mailOptions)
}
