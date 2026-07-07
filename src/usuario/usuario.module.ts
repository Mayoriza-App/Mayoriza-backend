import { Module } from '@nestjs/common';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';

/**
 * Module encapsulating the Usuario domain.
 * Manages user profiles and their many-to-many relationships with companies (EmpresaUsuario).
 */
@Module({
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
