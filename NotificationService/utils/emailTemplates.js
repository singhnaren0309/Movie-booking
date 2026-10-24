/**
 * Generates a modern cinema ticket HTML confirmation email
 */
const generateBookingEmailHtml = ({
    customerName = "Moviegoer",
    movieName = "Featured Movie",
    theatreName = "Cinema Hall",
    timing = "19:00",
    seats = [],
    amount = 0,
    bookingId = ""
}) => {
    const seatList = Array.isArray(seats) ? seats : (typeof seats === 'string' ? seats.split(',').map(s => s.trim()) : []);
    const seatBadges = seatList
        .map(seat => `<span style="display:inline-block; background-color:#e50914; color:#ffffff; font-weight:700; padding:5px 12px; border-radius:6px; margin:3px 4px; font-size:13px; letter-spacing:0.5px;">${seat}</span>`)
        .join(" ");

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Booking Confirmation</title>
</head>
<body style="margin:0; padding:0; background-color:#0f1015; font-family:'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color:#e0e0e0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0f1015; padding:30px 10px;">
        <tr>
            <td align="center">
                <!-- Main Container -->
                <table role="presentation" width="100%" style="max-width:560px; background:#181a20; border-radius:16px; overflow:hidden; border:1px solid #282a36; box-shadow:0 12px 35px rgba(0,0,0,0.6);" cellspacing="0" cellpadding="0">
                    
                    <!-- Header Banner -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #e50914 0%, #b20710 100%); padding:28px 24px; text-align:center;">
                            <h1 style="margin:0; font-size:24px; font-weight:800; color:#ffffff; letter-spacing:1px; text-transform:uppercase;">
                                🎬 Ticket Confirmed!
                            </h1>
                            <p style="margin:6px 0 0; color:rgba(255,255,255,0.9); font-size:14px;">
                                Get ready for the ultimate big-screen experience
                            </p>
                        </td>
                    </tr>

                    <!-- Customer Welcome -->
                    <tr>
                        <td style="padding:24px 24px 10px;">
                            <p style="margin:0; font-size:15px; color:#a0a0a0;">
                                Hi <strong style="color:#ffffff;">${customerName}</strong>,
                            </p>
                            <p style="margin:6px 0 0; font-size:14px; color:#888888; line-height:1.5;">
                                Your tickets are booked! Show this digital ticket at the theatre entrance.
                            </p>
                        </td>
                    </tr>

                    <!-- Ticket Card Stub -->
                    <tr>
                        <td style="padding:10px 24px 24px;">
                            <table role="presentation" width="100%" style="background:#20232b; border-radius:12px; border:1px solid #2f3340; overflow:hidden;" cellspacing="0" cellpadding="0">
                                
                                <!-- Movie Title & Theatre -->
                                <tr>
                                    <td style="padding:20px 20px 14px;">
                                        <div style="font-size:12px; font-weight:700; color:#e50914; text-transform:uppercase; letter-spacing:1px;">Movie</div>
                                        <div style="font-size:22px; font-weight:800; color:#ffffff; margin-top:2px;">${movieName}</div>
                                        <div style="font-size:14px; color:#9fa6b2; margin-top:4px;">📍 ${theatreName}</div>
                                    </td>
                                </tr>

                                <!-- Dashed Ticket Divider -->
                                <tr>
                                    <td style="padding:0 20px;">
                                        <div style="border-top:1px dashed #3a3f50; height:1px;"></div>
                                    </td>
                                </tr>

                                <!-- Details Grid -->
                                <tr>
                                    <td style="padding:16px 20px 20px;">
                                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="50%" style="vertical-align:top; padding-bottom:14px;">
                                                    <span style="font-size:11px; text-transform:uppercase; color:#788090; font-weight:600;">Showtime</span>
                                                    <div style="font-size:16px; font-weight:700; color:#ffffff; margin-top:3px;">⏰ ${timing}</div>
                                                </td>
                                                <td width="50%" style="vertical-align:top; padding-bottom:14px;">
                                                    <span style="font-size:11px; text-transform:uppercase; color:#788090; font-weight:600;">Amount Paid</span>
                                                    <div style="font-size:16px; font-weight:700; color:#4ade80; margin-top:3px;">₹ ${amount}</div>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td colspan="2" style="vertical-align:top; padding-top:4px;">
                                                    <span style="font-size:11px; text-transform:uppercase; color:#788090; font-weight:600;">Reserved Seats</span>
                                                    <div style="margin-top:6px;">
                                                        ${seatBadges || '<span style="color:#ffffff;">Standard</span>'}
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <!-- Booking ID Footer Bar -->
                                <tr>
                                    <td style="background:#14161c; padding:12px 20px; border-top:1px solid #282b36; font-size:12px; color:#737a8c; font-family:monospace;">
                                        BOOKING REF: <span style="color:#ffffff; font-weight:700;">${bookingId}</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer Note -->
                    <tr>
                        <td style="padding:0 24px 28px; text-align:center;">
                            <p style="margin:0; font-size:12px; color:#555a68;">
                                Please arrive 15 minutes before the showtime. Enjoy your movie! 🍿
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
};

module.exports = { generateBookingEmailHtml };
