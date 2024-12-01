import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as ejs from 'ejs';
import { join } from 'path';
import { NodeEnv } from 'src/enums/node-env.enum';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;

    constructor(private configService: ConfigService) {
        this.transporter = nodemailer.createTransport({
            service: this.configService.get('SMTP_FLATFORM'),
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            }
        });
    }

    async sendMail(to: string, subject: string, template: string, context: Record<string, any>): Promise<void> {
        const templatePath = join(process.cwd(), (process.env.NODE_ENV === NodeEnv.PRODUCTION) ? 'layleaderpass/templates' : 'templates', `${template}.ejs`);
        const html = await ejs.renderFile(templatePath, context);

        const mailOptions = {
            from: `"중직자PASS" <${this.configService.get('SMTP_USER')}>`,
            to,
            subject,
            html,
        };

        try {
            await this.transporter.sendMail(mailOptions);
        } catch (error) {
            console.error('메일 전송 중 오류 발생:', error);
            throw new Error('메일 전송 실패');
        }
    }
}
