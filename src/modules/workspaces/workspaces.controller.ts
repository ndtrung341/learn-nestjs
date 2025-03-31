import { Controller, Post, Body, Param, Get, HttpStatus } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiPrivate } from '@common/decorators/http.decorators';

@Controller('workspaces')
export class WorkspacesController {
   constructor(private readonly workspacesService: WorkspacesService) {}

   @Post()
   @ApiPrivate({
      statusCode: HttpStatus.CREATED,
      message: 'Workspace created successfully',
   })
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
