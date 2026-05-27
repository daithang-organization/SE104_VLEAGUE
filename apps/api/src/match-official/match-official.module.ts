import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MatchOfficialController } from './match-official.controller';
import { MatchOfficialService } from './match-official.service';

@Module({
  imports: [PrismaModule],
  controllers: [MatchOfficialController],
  providers: [MatchOfficialService],
  exports: [MatchOfficialService],
})
export class MatchOfficialModule {}
