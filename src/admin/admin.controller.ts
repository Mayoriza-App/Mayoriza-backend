import { Body, Controller, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { AdminService } from './admin.service';
import { InviteUsuarioDto } from './dto/invite-usuario.dto';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('usuarios')
  async findAllUsuarios(@Req() req: any) {
    return this.adminService.findAllUsuarios(req.user);
  }

  @Post('usuarios')
  async inviteUsuario(@Req() req: any, @Body() inviteDto: InviteUsuarioDto) {
    return this.adminService.inviteUsuario(req.user, inviteDto);
  }

  @Post('usuarios/:id/reenviar-invitacion')
  async reenviarInvitacion(@Req() req: any, @Param('id') id: string) {
    return this.adminService.reenviarInvitacion(req.user, id);
  }

  @Get('empresas')
  async findAllEmpresas(@Req() req: any) {
    return this.adminService.findAllEmpresas(req.user);
  }

  @Post('empresas/:rut/transferir')
  async transferirEmpresa(@Req() req: any, @Param('rut') rut: string) {
    return this.adminService.transferirEmpresa(req.user, rut);
  }

  @Patch('usuarios/:id/toggle-status')
  async toggleUserStatus(@Req() req: any, @Param('id') id: string) {
    return this.adminService.toggleUserStatus(req.user, id);
  }
}
