import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TopicsService } from './topics.service';
import { TopicsSwagger } from './topics.swagger';

@ApiTags(TopicsSwagger.tags)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @ApiOperation(TopicsSwagger.getAll.operation)
  @ApiResponse(TopicsSwagger.getAll.response)
  async findAll() {
    return this.topicsService.findAll();
  }
}
