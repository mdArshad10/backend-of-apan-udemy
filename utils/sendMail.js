import {createTransport} from "nodemailer"

export const sendMail = async (to,subject,message) =>{
    
  // create reusable transporter object using the default SMTP transport
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

  // send mail with defined transport object
    const info = await transporter.sendMail({
        to,  // list of receivers
        subject, // Subject line
        text: message, // plain text body
        from:"abcd@gmail.com"
    });
}