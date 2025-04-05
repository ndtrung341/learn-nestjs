import {
   Controller,
   Post,
   Body,
   Param,
   Get,
   Put,
   HttpStatus,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { ApiPrivate } from '@common/decorators/http.decorators';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceVisibility } from './entities/workspace.entity';
import { SnowflakeService } from '@shared/services/snowflake.service';

@Controller('workspaces')
export class WorkspacesController {
   constructor(
      private readonly workspacesService: WorkspacesService,
      private sf: SnowflakeService,
   ) {}

   @Get('test')
   test() {
      return Array.from({ length: 1000 }).map(() =>
         this.sf.generate().toString(),
      );
   }

   @Get(':id')
   get(@Param('id') id) {
      return this.workspacesService.findWorkspaceById(id);
   }

   @Post()
   @ApiPrivate({
      statusCode: HttpStatus.CREATED,
      message: 'Workspace created successfully',
   })
   create(
      @CurrentUser('sub') userId,
      @Body() createWorkspaceDto: CreateWorkspaceDto,
   ) {
      return this.workspacesService.createWorkspace(userId, createWorkspaceDto);
   }

   @Put(':id')
   @ApiPrivate({
      message: 'Workspace update successfully',
   })
   update(
      @Param('id') workspaceId: string,
      @Body() updateWorkspaceDto: UpdateWorkspaceDto,
   ) {
      return this.workspacesService.updateWorkspace(
         workspaceId,
         updateWorkspaceDto,
      );
   }
}
