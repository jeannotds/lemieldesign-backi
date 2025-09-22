import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class SendmailsService {

  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,   // ex: smtp.gmail.com
      port: parseInt(process.env.MAIL_PORT) || 587,
      secure: false, // true pour 465, false pour 587
      auth: {
        user: process.env.MAIL_USER, // ton email
        pass: process.env.MAIL_PASS, // mot de passe ou app password
      },
    });
  }
// , to: string, subject: string, text: string, html?: string
  async sendMail(sendMailDtop) {

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h3>Nouveau message reçu</h3>
        <p><strong>De :</strong> ${sendMailDtop.email}</p>
        ${sendMailDtop.phone ? `<p><strong>Téléphone :</strong> ${sendMailDtop.phone}</p>` : ''}
        <p><strong>Objet :</strong> ${sendMailDtop.subject}</p>
        <hr />
        <p>${sendMailDtop.message}</p>
        <p><strong>Nom complet :</strong> ${sendMailDtop.firstname} ${sendMailDtop.name}</p>
      </div>
    `;

    const info = await this.transporter.sendMail({
      from: `"Lemiel Design" <${process.env.MAIL_USER}>`,
      to: sendMailDtop.email,
      subject: sendMailDtop.subject,
      text: sendMailDtop.message,
      html: htmlContent,
    });
    return info;
  }
}
