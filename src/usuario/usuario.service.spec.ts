import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RolUsuario } from 'generated/prisma';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UsuarioService } from './usuario.service';

const mockPrismaService = {
  usuario: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  empresa: {
    findUnique: jest.fn(),
  },
  empresaUsuario: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUsuario = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  email: 'test@mayoriza.cl',
  nombre: 'Test Usuario',
  rol: RolUsuario.CONTADOR,
};

describe('UsuarioService', () => {
  let service: UsuarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of mapped UsuarioResponseDtos', async () => {
      mockPrismaService.usuario.findMany.mockResolvedValue([mockUsuario]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockUsuario.id,
        email: mockUsuario.email,
        nombre: mockUsuario.nombre,
        rol: mockUsuario.rol,
      });
    });

    it('should return an empty array when no users exist', async () => {
      mockPrismaService.usuario.findMany.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('should return a mapped UsuarioResponseDto when user is found', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUsuario);
      const result = await service.findOne(mockUsuario.id);
      expect(result.id).toEqual(mockUsuario.id);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto: CreateUsuarioDto = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'nuevo@mayoriza.cl',
      nombre: 'Nuevo Usuario',
      rol: RolUsuario.CONTADOR,
    };

    it('should create and return a new user on happy path', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      mockPrismaService.usuario.create.mockResolvedValue({
        ...createDto,
      });

      const result = await service.create(createDto);
      expect(result.email).toEqual(createDto.email);
      expect(mockPrismaService.usuario.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when ID already exists', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValueOnce(mockUsuario);
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockPrismaService.usuario.findUnique
        .mockResolvedValueOnce(null) // ID check passes
        .mockResolvedValueOnce(mockUsuario); // Email check fails
      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('assignEmpresa', () => {
    const assignDto = {
      usuarioId: '123e4567-e89b-12d3-a456-426614174000',
      empresaRut: '76123456-K',
    };

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(null);
      await expect(service.assignEmpresa(assignDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if company does not exist', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUsuario);
      mockPrismaService.empresa.findUnique.mockResolvedValue(null);
      await expect(service.assignEmpresa(assignDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException if assignment already exists', async () => {
      mockPrismaService.usuario.findUnique.mockResolvedValue(mockUsuario);
      mockPrismaService.empresa.findUnique.mockResolvedValue({ rut: '76123456-K' });
      mockPrismaService.empresaUsuario.findUnique.mockResolvedValue({
        ...assignDto,
      });
      await expect(service.assignEmpresa(assignDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
