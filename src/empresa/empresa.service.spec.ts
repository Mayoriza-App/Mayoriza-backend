import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CuentaContableService } from '../cuenta-contable/cuenta-contable.service';
import { EmpresaService } from './empresa.service';

const mockPrismaService = {
  empresa: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  planPlantilla: {
    findMany: jest.fn(),
  },
  historialTransferencia: {
    create: jest.fn(),
  }
};

const mockCuentaContableService = {};

describe('EmpresaService', () => {
  let service: EmpresaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmpresaService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CuentaContableService, useValue: mockCuentaContableService },
      ],
    }).compile();

    service = module.get<EmpresaService>(EmpresaService);
    jest.clearAllMocks();
  });

  const mockEmpresa = {
    rut: '76123456-K',
    razonSocial: 'Test SpA',
    giro: 'Ventas',
    direccion: 'Calle 1',
    comuna: 'Santiago',
    ciudad: 'Santiago',
    telefono: '+56912345678',
    correo: 'test@spa.cl',
    activa: true,
    transferenciaHabilitada: false,
    transferenciaDestinoEmail: null,
    usuarioId: 'user-1'
  };

  describe('findAll', () => {
    it('should return all companies for a user', async () => {
      mockPrismaService.empresa.findMany.mockResolvedValue([mockEmpresa]);
      const result = await service.findAll('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].rut).toEqual(mockEmpresa.rut);
    });
  });

  describe('getOpcionesPlan', () => {
    it('should return plantillas and empresas', async () => {
      mockPrismaService.planPlantilla.findMany.mockResolvedValue([{ id: 1, nombre: 'Plan 1' }]);
      mockPrismaService.empresa.findMany.mockResolvedValue([{ rut: '123', razonSocial: 'Empresa 1' }]);
      
      const result = await service.getOpcionesPlan('user-1');
      expect(result.plantillas).toHaveLength(1);
      expect(result.empresas).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a company if found', async () => {
      mockPrismaService.empresa.findFirst.mockResolvedValue(mockEmpresa);
      const result = await service.findOne('user-1', mockEmpresa.rut);
      expect(result.rut).toEqual(mockEmpresa.rut);
    });

    it('should throw NotFoundException if company not found', async () => {
      mockPrismaService.empresa.findFirst.mockResolvedValue(null);
      await expect(service.findOne('user-1', 'invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto = {
      rut: '76123456-K',
      razonSocial: 'Test SpA',
      giro: 'Ventas',
    };

    it('should create a new company', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(null);
      mockPrismaService.empresa.create.mockResolvedValue(mockEmpresa);
      
      const result = await service.create('user-1', createDto);
      expect(result.rut).toEqual(mockEmpresa.rut);
    });

    it('should throw ConflictException if rut already exists', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      await expect(service.create('user-1', createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    const updateDto = { razonSocial: 'Updated SpA' };

    it('should update and return company', async () => {
      mockPrismaService.empresa.findFirst.mockResolvedValue(mockEmpresa);
      mockPrismaService.empresa.update.mockResolvedValue({ ...mockEmpresa, razonSocial: 'Updated SpA' });

      const result = await service.update('user-1', mockEmpresa.rut, updateDto);
      expect(result.razonSocial).toEqual('Updated SpA');
    });
  });

  describe('remove', () => {
    it('should remove company if exists', async () => {
      mockPrismaService.empresa.findFirst.mockResolvedValue(mockEmpresa);
      mockPrismaService.empresa.delete.mockResolvedValue(mockEmpresa);
      
      await expect(service.remove('user-1', mockEmpresa.rut)).resolves.toBeUndefined();
    });
  });

  describe('habilitarTransferencia', () => {
    it('should enable transfer and create history', async () => {
      mockPrismaService.empresa.findFirst.mockResolvedValue(mockEmpresa);
      mockPrismaService.empresa.update.mockResolvedValue({ ...mockEmpresa, transferenciaHabilitada: true });
      mockPrismaService.historialTransferencia.create.mockResolvedValue({});

      const result = await service.habilitarTransferencia('user-1', mockEmpresa.rut, 'destino@test.com');
      expect(result.message).toEqual('Transferencia habilitada');
    });
  });

  describe('cambiarEstado', () => {
    it('should toggle status', async () => {
      mockPrismaService.empresa.findFirst.mockResolvedValue(mockEmpresa);
      mockPrismaService.empresa.update.mockResolvedValue({ ...mockEmpresa, activa: false });

      const result = await service.cambiarEstado('user-1', mockEmpresa.rut, false);
      expect(result.activa).toEqual(false);
      expect(result.message).toContain('deshabilitada');
    });
  });
});
