import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TipoCuenta } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCuentaContableDto } from './dto/create-cuenta-contable.dto';
import { CuentaContableService } from './cuenta-contable.service';

const mockPrismaService = {
  cuentaEmpresa: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  cuentaPlantilla: {
    findMany: jest.fn(),
  },
  empresa: {
    findUnique: jest.fn(),
  },
};

const mockCuenta = {
  id: 1,
  empresaId: 'empresa-id',
  codigo: '1.1.01',
  nombre: 'Caja',
  tipo: TipoCuenta.ACTIVO,
};

const mockEmpresa = {
  id: 'empresa-id',
  rut: '12345678-9',
  usuarioId: 'user-1',
};

describe('CuentaContableService', () => {
  let service: CuentaContableService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CuentaContableService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CuentaContableService>(CuentaContableService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all accounts ordered by code', async () => {
      mockPrismaService.cuentaEmpresa.findMany.mockResolvedValue([mockCuenta]);
      const result = await service.findAll('user-1', '12345678-9');
      expect(result).toHaveLength(1);
      expect(result[0].codigo).toEqual(mockCuenta.codigo);
      expect(mockPrismaService.cuentaEmpresa.findMany).toHaveBeenCalledWith({
        where: { empresa: { rut: '12345678-9', usuarioId: 'user-1' } },
        orderBy: { codigo: 'asc' },
      });
    });

    it('should apply tipo filter when provided', async () => {
      mockPrismaService.cuentaEmpresa.findMany.mockResolvedValue([mockCuenta]);
      await service.findAll('user-1', '12345678-9', TipoCuenta.ACTIVO);
      expect(mockPrismaService.cuentaEmpresa.findMany).toHaveBeenCalledWith({
        where: { empresa: { rut: '12345678-9', usuarioId: 'user-1' }, tipo: TipoCuenta.ACTIVO },
        orderBy: { codigo: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a mapped DTO when account exists', async () => {
      mockPrismaService.cuentaEmpresa.findFirst.mockResolvedValue(mockCuenta);
      const result = await service.findOne('user-1', '12345678-9', mockCuenta.codigo);
      expect(result).toEqual({
        codigo: mockCuenta.codigo,
        nombre: mockCuenta.nombre,
        tipo: mockCuenta.tipo,
      });
    });

    it('should throw NotFoundException when account does not exist', async () => {
      mockPrismaService.cuentaEmpresa.findFirst.mockResolvedValue(null);
      await expect(service.findOne('user-1', '12345678-9', '9.9.99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createDto: CreateCuentaContableDto = {
      empresaRut: '12345678-9',
      codigo: '1.1.02',
      nombre: 'Banco',
      tipo: TipoCuenta.ACTIVO,
    };

    it('should create and return a new account on happy path', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      mockPrismaService.cuentaEmpresa.findUnique.mockResolvedValue(null);
      mockPrismaService.cuentaEmpresa.create.mockResolvedValue(createDto);
      const result = await service.create('user-1', createDto);
      expect(result.codigo).toEqual(createDto.codigo);
      expect(mockPrismaService.cuentaEmpresa.create).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictException when code already exists', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      mockPrismaService.cuentaEmpresa.findUnique.mockResolvedValue(mockCuenta);
      await expect(service.create('user-1', createDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('should update and return the account on happy path', async () => {
      const updated = { ...mockCuenta, nombre: 'Caja Chica' };
      mockPrismaService.cuentaEmpresa.findFirst.mockResolvedValue(mockCuenta);
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      mockPrismaService.cuentaEmpresa.update.mockResolvedValue(updated);
      const result = await service.update('user-1', '12345678-9', mockCuenta.codigo, {
        nombre: 'Caja Chica',
      });
      expect(result.nombre).toEqual('Caja Chica');
    });

    it('should throw NotFoundException when account does not exist', async () => {
      mockPrismaService.cuentaEmpresa.findFirst.mockResolvedValue(null);
      await expect(
        service.update('user-1', '12345678-9', '9.9.99', { nombre: 'Inexistente' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete the account on happy path', async () => {
      mockPrismaService.cuentaEmpresa.findFirst.mockResolvedValue(mockCuenta);
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      mockPrismaService.cuentaEmpresa.delete.mockResolvedValue(mockCuenta);
      await expect(service.remove('user-1', '12345678-9', mockCuenta.codigo)).resolves.toBeUndefined();
      expect(mockPrismaService.cuentaEmpresa.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when account does not exist', async () => {
      mockPrismaService.cuentaEmpresa.findFirst.mockResolvedValue(null);
      await expect(service.remove('user-1', '12345678-9', '9.9.99')).rejects.toThrow(NotFoundException);
    });
  });
  describe('clonarCuentas', () => {
    it('should clone from a template if origenPlanId is provided', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      mockPrismaService.cuentaPlantilla.findMany.mockResolvedValue([mockCuenta]);
      mockPrismaService.cuentaEmpresa.createMany.mockResolvedValue({ count: 1 });

      await service.clonarCuentas('user-1', '12345678-9', 1);

      expect(mockPrismaService.cuentaPlantilla.findMany).toHaveBeenCalled();
      expect(mockPrismaService.cuentaEmpresa.createMany).toHaveBeenCalled();
    });

    it('should clone from another company if origenEmpresaRut is provided', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      mockPrismaService.cuentaEmpresa.findMany.mockResolvedValue([mockCuenta]);
      mockPrismaService.cuentaEmpresa.createMany.mockResolvedValue({ count: 1 });

      await service.clonarCuentas('user-1', '12345678-9', undefined, 'otra-empresa-rut');

      expect(mockPrismaService.cuentaEmpresa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { empresa: { rut: 'otra-empresa-rut', usuarioId: 'user-1' } } })
      );
      expect(mockPrismaService.cuentaEmpresa.createMany).toHaveBeenCalled();
    });

    it('should throw BadRequestException if no origin provided', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(mockEmpresa);
      await expect(service.clonarCuentas('user-1', '12345678-9')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if company not found', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(null);
      await expect(service.clonarCuentas('user-1', 'invalid', 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getPlantillaCuentas', () => {
    it('should return accounts from a template', async () => {
      mockPrismaService.cuentaPlantilla.findMany.mockResolvedValue([mockCuenta]);
      const result = await service.getPlantillaCuentas(1);
      expect(result).toHaveLength(1);
      expect(result[0].codigo).toEqual(mockCuenta.codigo);
    });
  });
});

