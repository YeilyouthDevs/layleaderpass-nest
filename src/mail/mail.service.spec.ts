import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { ConfigService } from '@nestjs/config';
import * as ejs from 'ejs';

jest.mock('ejs');

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn((key: string) => {
        const configs = {
          SMTP_FLATFORM: 'gmail',
          SMTP_USER: 'test@example.com',
          SMTP_PASS: 'password123',
        };
        return configs[key];
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<MailService>(MailService);

    jest.spyOn(ejs, 'renderFile').mockResolvedValue('<p>Mocked Template</p>');
  });

  it('서비스가 정의되어 있어야 함', () => {
    expect(service).toBeDefined();
  });

  test('메일 전송요청이 있어야 함', async () => {
    const sendMailMock = jest
      .spyOn(service['transporter'], 'sendMail')
      .mockResolvedValueOnce(true);

    await service.sendMail('recipient@example.com', 'Test Subject', 'test-template', { name: 'User' });
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(ejs.renderFile).toHaveBeenCalledWith(
      expect.stringContaining('test-template.ejs'),
      expect.objectContaining({ name: 'User' })
    );
  });
});
