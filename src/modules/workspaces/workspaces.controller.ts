import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@Controller('workspaces')
export class WorkspacesController {
   constructor(private readonly workspacesService: WorkspacesService) {}

   @Post()
   async create(
      @CurrentUser('sub') userId,
      @Body() createWorkspaceDto: CreateWorkspaceDto,
   ) {
      return this.workspacesService.create(userId, createWorkspaceDto);
   }

   @Get(':id')
   get(@Param('id') id) {
      return this.workspacesService.findOne(id);
   }
}
