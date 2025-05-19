import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, message } = body

    // Create a transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "medivaultdigihealth@gmail.com",
        pass: process.env.EMAIL_PASS, // This should be set in your environment variables
      },
    })

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER || "medivaultdigihealth@gmail.com",
      to: "medivaultdigihealth@gmail.com",
      subject: `MediVault Contact Form: Message from ${name}`,
      text: `
        Name: ${name}
        Email: ${email}
        Message: ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
          <h2 style="color: #0070f3;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
      `,
    }

    // For development/testing, log the message instead of sending
    if (!process.env.EMAIL_PASS) {
      console.log("Email would be sent with the following content:", mailOptions)
      return NextResponse.json({
        success: true,
        message: "Message logged (email sending disabled without credentials)",
      })
    }

    // Send email
    await transporter.sendMail(mailOptions)

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. Thank you!",
    })
  } catch (error) {
    console.error("Contact form error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send message. Please try again.",
      },
      { status: 500 },
    )
  }
}
