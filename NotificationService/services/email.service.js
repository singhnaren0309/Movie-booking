require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL || process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
    }
});

const sendMail = async (to, subject, text, html) => {
    const recipients = Array.isArray(to) ? to.join(", ") : to;
    const mailOptions = {
        from: process.env.EMAIL || process.env.EMAIL_USER,
        to: recipients,
        subject: subject,
        text: text
    };
    if (html) {
        mailOptions.html = html;
    }
    return transporter.sendMail(mailOptions);
};

module.exports = {
    sendMail,
    transporter
};
