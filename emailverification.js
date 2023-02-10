var nodemailer = require('nodemailer');

sendMail = {
    sendVerificationEmail: function(to, token) {
        var transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'bayalkotiimmanuel@gmail.com',
                pass: '21centurybreakdown'
            }
        });
        const mailOptions = {
            from: 'sender@email.com',
            to: to,
            subject: 'Verify Your Email',
            html: `<p>Click on this link to verify your email http://localhost:1337/verification?token=${token}&email=${to}</p>`
        };
        transporter.sendMail(mailOptions, function(err, info) {
            console.log('Sending Mail');
            if(err)
                console.log(err)
            else
                console.log(info)
        });
        transporter.close();
    }
}

exports.data = sendMail;