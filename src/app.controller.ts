import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { MailService } from './mail/mail.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly mailService: MailService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('send')
  async sendMail(@Body() body: { to: string; name: string; code: string }) {
      const { to, name, code } = body;
      await this.mailService.sendMail(
          to,
          'Welcome to Our Service',
          'email', // EJS 템플릿 이름 (email.ejs)
          { name, code }, // 컨텍스트
      );
      return { message: 'Email sent successfully!' };
  }

}
