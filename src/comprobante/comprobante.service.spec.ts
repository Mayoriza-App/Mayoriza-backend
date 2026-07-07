import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TipoComprobante } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ComprobanteService } from './comprobante.service';
import { CreateComprobanteDto } from './dto/create-comprobante.dto';
import { FilterComprobanteDto } from './dto/filter-comprobante.dto';

const mockPrismaService = {
  comprobante: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  empresa: {
    findUnique: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockDate = new Date('2026-07-02T12:00:00Z');
const mockComprobanteEntity = {
  id: 1,
  empresaRut: '76123456-K',
  tipo: TipoComprobante.INGRESO,
  fecha: mockDate,
  glosaGeneral: 'Venta con boleta',
  periodoMes: 7,
  periodoAnio: 2026,
  _count: { movimientos: 2 },
};

const mockComprobanteWithLinesEntity = {
  ...mockComprobanteEntity,
  movimientos: [
    {
      id: 10,
      cuentaCodigo: '1.1.01.01',
      terceroRut: null,
      centroCostoId: null,
      debe: 119000n, // DB uses BigInt
      haber: 0n,
      glosaLinea: 'Ingreso a caja',
      siiTipoDte: null,
      siiFolioDoc: null,
    },
    {
      id: 11,
      cuentaCodigo: '4.1.01.01',
      terceroRut: '12345678-9',
      centroCostoId: 1,
      debe: 0n,
      haber: 119000n, // DB uses BigInt
      glosaLinea: 'Ingreso por venta',
      siiTipoDte: 39, // Boleta
      siiFolioDoc: 12345n, // DB uses BigInt?
    },
  ],
};

describe('ComprobanteService', () => {
  let service: ComprobanteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComprobanteService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ComprobanteService>(ComprobanteService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return lean mapped list filtered by empresaRut', async () => {
      mockPrismaService.comprobante.findMany.mockResolvedValue([
        mockComprobanteWithLinesEntity,
      ]);
      const filter: FilterComprobanteDto = { empresaRut: '76123456-K' };
      const result = await service.findAll(filter);

      expect(result).toHaveLength(1);
      expect(result[0].id).toEqual(1);
      expect(result[0].movimientos).toHaveLength(2); // Full DTO check
      expect(mockPrismaService.comprobante.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { empresaRut: '76123456-K' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return mapped ComprobanteResponseDto with totals and converted numbers', async () => {
      mockPrismaService.comprobante.findUnique.mockResolvedValue(
        mockComprobanteWithLinesEntity,
      );
      const result = await service.findOne(1);

      expect(result.id).toEqual(1);
      expect(result.movimientos).toHaveLength(2);

      expect(typeof result.movimientos[0].debe).toBe('number');
      expect(result.movimientos[0].debe).toEqual(119000);
      expect(typeof result.movimientos[1].siiFolioDoc).toBe('number');
      expect(result.movimientos[1].siiFolioDoc).toEqual(12345);

      expect(result.totales.debe).toEqual(119000);
      expect(result.totales.haber).toEqual(119000);
      expect(result.totales.cuadrado).toBe(true);
    });

    it('should throw NotFoundException if comprobante not found', async () => {
      mockPrismaService.comprobante.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create (Partida Doble Engine)', () => {
    const validCreateDto: CreateComprobanteDto = {
      empresaRut: '76123456-K',
      tipo: TipoComprobante.INGRESO,
      fecha: '2026-07-02',
      glosaGeneral: 'Apertura',
      periodoMes: 7,
      periodoAnio: 2026,
      movimientos: [
        { cuentaCodigo: '1.1.01', debe: 1000, haber: 0 },
        { cuentaCodigo: '3.1.01', debe: 0, haber: 1000 },
      ],
    };

    it('should throw BadRequestException if less than 2 lines provided', async () => {
      const dto = { ...validCreateDto, movimientos: [{ cuentaCodigo: '1.1', debe: 100 }] };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if debe !== haber (unbalanced)', async () => {
      const dto = {
        ...validCreateDto,
        movimientos: [
          { cuentaCodigo: '1.1.01', debe: 1000, haber: 0 },
          { cuentaCodigo: '3.1.01', debe: 0, haber: 900 }, // Off by 100
        ],
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Diferencia: 100 CLP');
    });

    it('should throw BadRequestException if total is 0', async () => {
      const dto = {
        ...validCreateDto,
        movimientos: [
          { cuentaCodigo: '1.1.01', debe: 0, haber: 0 },
          { cuentaCodigo: '3.1.01', debe: 0, haber: 0 },
        ],
      };
      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if empresaRut does not exist', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue(null);
      await expect(service.create(validCreateDto)).rejects.toThrow(NotFoundException);
    });

    it('should successfully run transaction and return mapped DTO on balanced entry', async () => {
      mockPrismaService.empresa.findUnique.mockResolvedValue({ rut: '76123456-K' });
      mockPrismaService.$transaction.mockResolvedValue(mockComprobanteWithLinesEntity);

      const result = await service.create(validCreateDto);

      expect(mockPrismaService.$transaction).toHaveBeenCalledTimes(1);
      expect(result.totales.cuadrado).toBe(true);
    });
  });

  describe('remove', () => {
    it('should verify existence and delete comprobante', async () => {
      mockPrismaService.comprobante.findUnique.mockResolvedValue(mockComprobanteEntity);
      mockPrismaService.comprobante.delete.mockResolvedValue(mockComprobanteEntity);

      await expect(service.remove(1)).resolves.toBeUndefined();
      expect(mockPrismaService.comprobante.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockPrismaService.comprobante.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if not found on delete', async () => {
      mockPrismaService.comprobante.findUnique.mockResolvedValue(null);
      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
