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
import { WorkspacePermission } from '@decorators/workspace-permission.decorator';
import { WorkspaceMemberRole } from './entities/workspace-member.entity';
import { WorkspacePermissionGuard } from './guards/workspace-permission.guard';

@Controller('workspaces')
export class WorkspacesController {
   constructor(private readonly workspacesService: WorkspacesService) {}

   // --- Workspace CRUD ---
   @Get()
   async getUserWorkspaces(@CurrentUser('id') userId: string) {
      return this.workspacesService.getWorkspacesByUserId(userId);
   }

   @Get(':id')
   getWorkspaceById(@Param('id') id: string) {
      return this.workspacesService.getWorkspaceById(id);
   }

   @Post()
   createWorkspace(
      @CurrentUser('sub') ownerId: string,
      @Body() createWorkspaceDto: CreateWorkspaceDto,
   ) {
      return this.workspacesService.createWorkspace(
         ownerId,
         createWorkspaceDto,
      );
   }

   @Put(':id')
   @UseGuards(WorkspacePermissionGuard)
   @WorkspacePermission(WorkspaceMemberRole.ADMIN)
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
   deleteWorkspace(@Param('id') workspaceId: string) {
      return this.workspacesService.deleteWorkspace(workspaceId);
   }

   // --- Invitations ---
   @Post(':id/members')
   @UseGuards(WorkspacePermissionGuard)
   @WorkspacePermission(WorkspaceMemberRole.ADMIN)
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
   @UseGuards(WorkspacePermissionGuard)
   @WorkspacePermission(WorkspaceMemberRole.ADMIN)
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
   @UseGuards(WorkspacePermissionGuard)
   @WorkspacePermission(WorkspaceMemberRole.ADMIN)
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
