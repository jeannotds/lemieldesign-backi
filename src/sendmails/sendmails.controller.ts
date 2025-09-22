import { Body, Controller, Post } from '@nestjs/common';
import { SendmailsService } from './sendmails.service';
import { SendMailDto } from 'src/dto/sendmail.dto';

@Controller('sendmails')
export class SendmailsController {

    constructor(private readonly sendmailsService: SendmailsService) {}

    @Post()
    async sendMail(@Body() sendMailDtop: SendMailDto){
      return this.sendmailsService.sendMail(sendMailDtop);
    }

}
