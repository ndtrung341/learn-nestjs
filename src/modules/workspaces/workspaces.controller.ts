import {
   Controller,
   Post,
   Body,
   Param,
   Get,
   Put,
   Delete,
   UseGuards,
   Req,
   Patch,
   UseInterceptors,
   UploadedFile,
} from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { CurrentUser } from '@decorators/current-user.decorator';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import {
   CancelInvitationDto,
   InvitationDto,
   ResendInvitationDto,
} from './dto/invitation.dto';
import { InvitationGuard } from './guards/invitation.guard';
import { InvitationTokenPayload } from './types/invitation-payload';
import { WorkspaceRole } from '@decorators/workspace-role.decorator';
import { WorkspaceMemberRole } from './entities/workspace-member.entity';
import { ProtectedRoute } from '@decorators/http.decorators';
import { FormDataInterceptor } from '@interceptors/form-data.interceptor';
import { UploadService } from '@modules/upload/upload.service';

@Controller('workspaces')
export class WorkspacesController {
   constructor(
      private readonly workspacesService: WorkspacesService,
      private uploadService: UploadService,
   ) {}

   // --- Workspace CRUD ---
   @Get()
   @ProtectedRoute()
   async getUserWorkspaces(@CurrentUser('id') userId: string) {
      return this.workspacesService.getWorkspacesByUserId(userId);
   }

   @Get(':id')
   @ProtectedRoute()
   getWorkspaceById(@Param('id') id: string) {
      return this.workspacesService.getWorkspaceById(id);
   }

   @Post()
   @ProtectedRoute()
   createWorkspace(
      @CurrentUser('sub') ownerId: string,
      @Body() createWorkspaceDto: CreateWorkspaceDto,
   ) {
      return this.workspacesService.createWorkspace(
         ownerId,
         createWorkspaceDto,
      );
   }

   @Post(':id')
   @ProtectedRoute()
   @UseInterceptors(FormDataInterceptor('logo'))
   async updateLogo(
      @Param('id') workspaceId: string,
      @UploadedFile() file: any,
   ) {
      const logo = await this.uploadService.save(file.buffer, file.filename);
      await this.workspacesService.updateWorkspaceLogo(workspaceId, logo);
      return logo;
   }

   @Put(':id')
   @ProtectedRoute()
   @WorkspaceRole(WorkspaceMemberRole.ADMIN)
   updateWorkspace(
      @Param('id') workspaceId: string,
      @Body() updateWorkspaceDto: UpdateWorkspaceDto,
   ) {
      return this.workspacesService.updateWorkspace(
         workspaceId,
         updateWorkspaceDto,
      );
   }

   @Delete(':id')
   @ProtectedRoute()
   @WorkspaceRole(WorkspaceMemberRole.ADMIN)
   deleteWorkspace(@Param('id') workspaceId: string) {
      return this.workspacesService.deleteWorkspace(workspaceId);
   }

   // --- Invitations ---
   @Post(':id/members')
   @ProtectedRoute()
   @WorkspaceRole(WorkspaceMemberRole.ADMIN)
   inviteMembers(
      @CurrentUser('sub') currentUserId: string,
      @Param('id') workspaceId: string,
      @Body() dto: InvitationDto,
   ) {
      return this.workspacesService.inviteUsers(
         currentUserId,
         workspaceId,
         dto.emails,
         dto.role,
      );
   }

   @Post('invitations/resend')
   @ProtectedRoute()
   @WorkspaceRole(WorkspaceMemberRole.ADMIN)
   resendInvite(
      @CurrentUser('sub') currentUserId: string,
      @Body() dto: ResendInvitationDto,
   ) {
      return this.workspacesService.resendInvitation(
         currentUserId,
         dto.userId,
         dto.workspaceId,
      );
   }

   @Post('invitations/cancel')
   @ProtectedRoute()
   @WorkspaceRole(WorkspaceMemberRole.ADMIN)
   cancelInvite(@Body() dto: CancelInvitationDto) {
      return this.workspacesService.cancelInvitation(
         dto.userId,
         dto.workspaceId,
      );
   }

   @Patch('invitations/respond')
   @UseGuards(InvitationGuard)
   respondInvitation(@Req() request, @Body('accept') isAccepted: boolean) {
      const payload: InvitationTokenPayload = request.invitation;
      return this.workspacesService.respondInvitation(
         payload.userId,
         payload.workspaceId,
         isAccepted,
      );
   }
}
