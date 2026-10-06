const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});

const sendMail = async (to, subject, text, html) => {
    const recipients = Array.isArray(to) ? to.join(", ") : to;
    const mailOptions = {
        from: process.env.EMAIL,
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
