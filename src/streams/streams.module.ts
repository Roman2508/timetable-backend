import { Module } from '@nestjs/common';
import { StreamsService } from './streams.service';
import { StreamsController } from './streams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamEntity } from './entities/stream.entity';

@Module({
  controllers: [StreamsController],
  providers: [StreamsService],
  imports: [TypeOrmModule.forFeature([StreamEntity])],
})
export class StreamsModule {}
