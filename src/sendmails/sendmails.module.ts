import { Module } from '@nestjs/common';
import { SendmailsController } from './sendmails.controller';
import { SendmailsService } from './sendmails.service';

@Module({
  controllers: [SendmailsController],
  providers: [SendmailsService],
  exports: [SendmailsService],
})
export class SendmailsModule {}
