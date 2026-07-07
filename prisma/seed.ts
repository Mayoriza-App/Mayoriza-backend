import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient, RolUsuario, TipoCuenta } from '../generated/prisma';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const PLAN_9_PYMES = [
  { codigo: '1', nombre: 'ACTIVOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '11', nombre: 'ACTIVO CIRCULANTE', tipo: TipoCuenta.ACTIVO },
  { codigo: '1101', nombre: 'CAJAS Y BANCOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110101', nombre: 'CAJA', tipo: TipoCuenta.ACTIVO },
  { codigo: '110102', nombre: 'CLIENTES', tipo: TipoCuenta.ACTIVO },
  { codigo: '110103', nombre: 'BANCO SANTANDER', tipo: TipoCuenta.ACTIVO },
  { codigo: '1102', nombre: 'DEPOSITO A PLAZO', tipo: TipoCuenta.ACTIVO },
  { codigo: '110201', nombre: 'DEPOSITO A PLAZO', tipo: TipoCuenta.ACTIVO },
  { codigo: '1103', nombre: 'VALORES NEGOCIABLES', tipo: TipoCuenta.ACTIVO },
  { codigo: '110301', nombre: 'ACCIONES INDISA', tipo: TipoCuenta.ACTIVO },
  { codigo: '110302', nombre: 'FONDOS MUTUOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '1104', nombre: 'DEUDORES POR VENTAS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110401', nombre: 'DOCTOS POR COBRAR', tipo: TipoCuenta.ACTIVO },
  { codigo: '1105', nombre: 'DOCTOS POR COBRAR', tipo: TipoCuenta.ACTIVO },
  { codigo: '110501', nombre: 'LETRAS EN CARTERA', tipo: TipoCuenta.ACTIVO },
  { codigo: '110510', nombre: 'CHEQUES POR COBRAR', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '110517',
    nombre: 'DOCUMENTOS PROTESTADOS',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '110518', nombre: 'LETRAS EN COBRANZA', tipo: TipoCuenta.ACTIVO },
  { codigo: '1106', nombre: 'DEUDORES VARIOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110601', nombre: 'CUENTAS POR COBRAR', tipo: TipoCuenta.ACTIVO },
  { codigo: '110602', nombre: 'DEUDORES VARIOS', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '110603',
    nombre: 'PRESTAMOS TRABAJADORES',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '110605', nombre: 'ANTICIPO PROVEEDORES', tipo: TipoCuenta.ACTIVO },
  { codigo: '110606', nombre: 'ANTICIPO VARIOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110607', nombre: 'FONDOS A RENDIR', tipo: TipoCuenta.ACTIVO },
  { codigo: '1107', nombre: 'DEUDORES INCOBRABLES', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '110701',
    nombre: 'CTA POR COBRAR DIALECTIKA',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '1108', nombre: 'IMP. POR RECUPERAR', tipo: TipoCuenta.ACTIVO },
  { codigo: '110801', nombre: 'PPM', tipo: TipoCuenta.ACTIVO },
  { codigo: '110802', nombre: 'IVA CREDITO FISCAL', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '110803',
    nombre: 'PPV CREDITO LEY 18775',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '110804', nombre: 'CREDITO ART 33 BIS', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '110805',
    nombre: 'CONTRIBUCIONES PAGADAS',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '110807', nombre: 'REMANENTE', tipo: TipoCuenta.ACTIVO },
  { codigo: '110808', nombre: 'IMPUESTO 2 CATEGORIA', tipo: TipoCuenta.ACTIVO },
  { codigo: '110809', nombre: 'RETENCION CRED 3%', tipo: TipoCuenta.ACTIVO },
  { codigo: '110810', nombre: 'CREDITO ARTIC 36', tipo: TipoCuenta.ACTIVO },
  { codigo: '110811', nombre: 'ANTICIPO IVA 5%', tipo: TipoCuenta.ACTIVO },
  { codigo: '110812', nombre: 'ADICIONAL LEY 18566', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '110813',
    nombre: 'SALDOS FAVOR POR COBRAR',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '1109', nombre: 'EXISTENCIAS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110901', nombre: 'MERCADERIAS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110902', nombre: 'MATERIAS PRIMAS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110903', nombre: 'MATERIALES E INSUMOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110904', nombre: 'PRODUCTOS FABRICADOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110905', nombre: 'PRODUCTOS EN PROCESO', tipo: TipoCuenta.ACTIVO },
  { codigo: '110906', nombre: 'ENVASES', tipo: TipoCuenta.ACTIVO },
  { codigo: '110907', nombre: 'COMPRAS EXENTAS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110908', nombre: 'REPUESTOS Y OTROS', tipo: TipoCuenta.ACTIVO },
  { codigo: '110909', nombre: 'ARIDOS', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '110913',
    nombre: 'PROD. DESMINERALIZADOS',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '110914', nombre: 'ARTICULOS TERMINADOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '1110', nombre: 'GASTOS ANTICIPADOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '111001', nombre: 'COMERCIO EXTERIOR', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '111002',
    nombre: 'OTROS GASTOS ANTICIPADOS',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '111003', nombre: 'SEGUROS', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '111005',
    nombre: 'FLUCT CREDITOS LARGO PLAZO',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '111006', nombre: 'REMODELACION LOCALES', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '111007',
    nombre: 'ORG Y PUESTA EN MARCHA',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '111010', nombre: 'ANTICIPO PROVEEDORES', tipo: TipoCuenta.ACTIVO },
  { codigo: '111011', nombre: 'BOLETAS DE GARANTIA', tipo: TipoCuenta.ACTIVO },
  { codigo: '111012', nombre: 'LEASING', tipo: TipoCuenta.ACTIVO },
  { codigo: '1111', nombre: 'CTA CTES SOCIOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '111101', nombre: 'CTA OSCAR ORTEGA', tipo: TipoCuenta.ACTIVO },
  { codigo: '111102', nombre: 'CTA JAVIERA AGUIRRE', tipo: TipoCuenta.ACTIVO },
  { codigo: '111103', nombre: 'CTA SONIA ABARCA', tipo: TipoCuenta.ACTIVO },
  { codigo: '111104', nombre: 'CTA PILAR ACUÑA', tipo: TipoCuenta.ACTIVO },
  { codigo: '111105', nombre: 'CTAS PARTICULARES', tipo: TipoCuenta.ACTIVO },
  { codigo: '111106', nombre: 'CTA ALEJANDRO FORERO', tipo: TipoCuenta.ACTIVO },
  { codigo: '111107', nombre: 'CTA ALEX FORERO', tipo: TipoCuenta.ACTIVO },
  { codigo: '111108', nombre: 'CTA ESPERANZA FORERO', tipo: TipoCuenta.ACTIVO },
  { codigo: '111109', nombre: 'CTA EMILIANA FORERO', tipo: TipoCuenta.ACTIVO },
  { codigo: '111110', nombre: 'CTA ELOISA FORERO', tipo: TipoCuenta.ACTIVO },
  { codigo: '111111', nombre: 'CTA GEMMA AVILA', tipo: TipoCuenta.ACTIVO },
  { codigo: '111112', nombre: 'CTA DANIEL DALLER', tipo: TipoCuenta.ACTIVO },
  { codigo: '111113', nombre: 'CTA LUIS QUIROZ', tipo: TipoCuenta.ACTIVO },
  { codigo: '1112', nombre: 'GASTOS DIFERIDOS', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '111201',
    nombre: 'CONTRATO ARRIENDO LOCAL',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '111202', nombre: 'GARANTIA ARRIENDOS', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '111203',
    nombre: 'CUENTAS OBLIGADAS SOCIOS',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '1115', nombre: 'GASTOS TRIBUTARIOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '111501', nombre: 'GASTOS TRIBUTARIOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '111502', nombre: 'IMPUESTO 1 CATEGORIA', tipo: TipoCuenta.ACTIVO },
  { codigo: '111503', nombre: 'MULTAS E INTERESES', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '1117',
    nombre: 'IMPORTACIONES EN TRANSITO',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '111701', nombre: 'CTA IMPORTACIONES', tipo: TipoCuenta.ACTIVO },
  { codigo: '1118', nombre: 'GASTOS RECHAZADOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '111801', nombre: 'GASTOS RECHAZADOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '12', nombre: 'ACTIVO FIJO', tipo: TipoCuenta.ACTIVO },
  { codigo: '1202', nombre: 'BIENES RAICES', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '120201',
    nombre: 'INMOBILIARIA MEDITECNO',
    tipo: TipoCuenta.ACTIVO,
  },
  {
    codigo: '120202',
    nombre: 'AMPLIACION Y CONSTRUCCION',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '1204', nombre: 'VEHICULOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '120401', nombre: 'VEHICULOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '1205', nombre: 'MAQUINARIAS Y EQUIPOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '120501', nombre: 'MAQUINARIAS', tipo: TipoCuenta.ACTIVO },
  { codigo: '1207', nombre: 'DEPECIACION ACUMULADA', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '120701',
    nombre: 'DEPREC ACUM VEHICULOS',
    tipo: TipoCuenta.ACTIVO,
  },
  {
    codigo: '120703',
    nombre: 'DEPREC ACUM HERRAMIENTAS',
    tipo: TipoCuenta.ACTIVO,
  },
  {
    codigo: '120704',
    nombre: 'DEPREC ACUM MUEBLES Y UTILES',
    tipo: TipoCuenta.ACTIVO,
  },
  {
    codigo: '120705',
    nombre: 'DEPREC ACUM INSTALACIONES',
    tipo: TipoCuenta.ACTIVO,
  },
  {
    codigo: '120706',
    nombre: 'DEPREC ACUM EDIFICIOS',
    tipo: TipoCuenta.ACTIVO,
  },
  {
    codigo: '120707',
    nombre: 'DEPREC ACUM MUEBLES Y UTILES',
    tipo: TipoCuenta.ACTIVO,
  },
  {
    codigo: '120708',
    nombre: 'DEPREC ACUM MAQUINARIAS',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '1208', nombre: 'DEPRECIACION', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '120801',
    nombre: 'DEPRECIACION EJERCICIO',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '1209', nombre: 'OTROS ACTIVOS FIJOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '120901', nombre: 'MUEBLES Y UTILES', tipo: TipoCuenta.ACTIVO },
  { codigo: '120902', nombre: 'HERRAMIENTAS', tipo: TipoCuenta.ACTIVO },
  { codigo: '120903', nombre: 'EQUIPOS', tipo: TipoCuenta.ACTIVO },
  { codigo: '120904', nombre: 'MUEBLES Y UTILES', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '120905',
    nombre: 'SOC. INMOBILIARIA A Y S',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '13', nombre: 'OTROS ACTIVOS', tipo: TipoCuenta.ACTIVO },
  {
    codigo: '1301',
    nombre: 'DERECHOS OTRAS EMPRESAS',
    tipo: TipoCuenta.ACTIVO,
  },
  {
    codigo: '130101',
    nombre: 'DERECHOS OTRAS EMPERSAS',
    tipo: TipoCuenta.ACTIVO,
  },
  { codigo: '2', nombre: 'PASIVOS', tipo: TipoCuenta.PASIVO },
  { codigo: '21', nombre: 'PASIVO CIRCULANTE', tipo: TipoCuenta.PASIVO },
  { codigo: '2101', nombre: 'BANCOS ACREEDORES', tipo: TipoCuenta.PASIVO },
  { codigo: '210103', nombre: 'CREDITOS BANCOS', tipo: TipoCuenta.PASIVO },
  { codigo: '2104', nombre: 'DIVIDENDOS POR PAGAR', tipo: TipoCuenta.PASIVO },
  { codigo: '210401', nombre: 'DIVIDENDOS POR PAGAR', tipo: TipoCuenta.PASIVO },
  { codigo: '2105', nombre: 'CUENTAS POR PAGAR', tipo: TipoCuenta.PASIVO },
  { codigo: '210501', nombre: 'PROVEEDORES', tipo: TipoCuenta.PASIVO },
  { codigo: '210502', nombre: 'SUELDOS POR PAGAR', tipo: TipoCuenta.PASIVO },
  {
    codigo: '210503',
    nombre: 'GRATIFICACIONES POR PAGAR',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '210504', nombre: 'CUENTAS POR PAGAR', tipo: TipoCuenta.PASIVO },
  { codigo: '210505', nombre: 'HONORARIOS POR PAGAR', tipo: TipoCuenta.PASIVO },
  {
    codigo: '210506',
    nombre: 'HONORARIOS COMPROMETIDOS',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '2106', nombre: 'DOCUMENTOS POR PAGAR', tipo: TipoCuenta.PASIVO },
  { codigo: '210601', nombre: 'LETRAS POR PAGAR', tipo: TipoCuenta.PASIVO },
  {
    codigo: '210603',
    nombre: 'CREDITOS DOCUMENTARIOS',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '210604', nombre: 'PRESTAMO BANCARIO', tipo: TipoCuenta.PASIVO },
  { codigo: '210605', nombre: 'PRESTAMOS', tipo: TipoCuenta.PASIVO },
  { codigo: '2107', nombre: 'ACREEDORES VARIOS', tipo: TipoCuenta.PASIVO },
  {
    codigo: '210704',
    nombre: 'OTROS ACREEDORES VARIOS',
    tipo: TipoCuenta.PASIVO,
  },
  {
    codigo: '210706',
    nombre: 'CTAS CTES ACCIONISTAS',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '210707', nombre: 'CHEQUES DEVUELTOS', tipo: TipoCuenta.PASIVO },
  { codigo: '210708', nombre: 'ACREEDORES', tipo: TipoCuenta.PASIVO },
  {
    codigo: '2108',
    nombre: 'PROVISIONES Y RETENCIONES',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '210801', nombre: 'RETENCIONES SOCIALES', tipo: TipoCuenta.PASIVO },
  { codigo: '210802', nombre: 'IVA', tipo: TipoCuenta.PASIVO },
  { codigo: '210803', nombre: 'IMPUESTO UNICO', tipo: TipoCuenta.PASIVO },
  { codigo: '210804', nombre: 'IMPUESTOS POR PAGAR', tipo: TipoCuenta.PASIVO },
  { codigo: '210805', nombre: 'PPM POR PAGAR', tipo: TipoCuenta.PASIVO },
  { codigo: '210806', nombre: 'OTRAS RETENCIONES', tipo: TipoCuenta.PASIVO },
  { codigo: '210807', nombre: 'PROVIDA', tipo: TipoCuenta.PASIVO },
  { codigo: '210808', nombre: 'MODELO', tipo: TipoCuenta.PASIVO },
  { codigo: '210809', nombre: 'HABITAT', tipo: TipoCuenta.PASIVO },
  { codigo: '210810', nombre: 'CUPRUM', tipo: TipoCuenta.PASIVO },
  { codigo: '210811', nombre: 'PLANVITAL', tipo: TipoCuenta.PASIVO },
  { codigo: '2109', nombre: 'PROV IMPUESTO RENTA', tipo: TipoCuenta.PASIVO },
  {
    codigo: '210901',
    nombre: 'PROVISION IMPUESTO RENTA',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '2110', nombre: 'INGRESOS ADELANTADOS', tipo: TipoCuenta.PASIVO },
  {
    codigo: '211002',
    nombre: 'OTROS INGR ADELANTADOS',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '211004', nombre: 'ANTICIPO CLIENTES', tipo: TipoCuenta.PASIVO },
  { codigo: '2111', nombre: 'CUENTAS TRASPASOS', tipo: TipoCuenta.PASIVO },
  {
    codigo: '211155',
    nombre: 'TRASPASOS ENTRE BANCOS',
    tipo: TipoCuenta.PASIVO,
  },
  {
    codigo: '211157',
    nombre: 'TRASPASOS REAPERTURAS',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '211158', nombre: 'TRASPASOS CAJAS', tipo: TipoCuenta.PASIVO },
  {
    codigo: '211159',
    nombre: 'TRASPASOS POR DISTRIBUIR',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '211180', nombre: 'CANJE', tipo: TipoCuenta.PASIVO },
  { codigo: '211190', nombre: 'TRASPASOS VARIOS', tipo: TipoCuenta.PASIVO },
  { codigo: '2112', nombre: 'CTAS CTES SOCIOS', tipo: TipoCuenta.PASIVO },
  { codigo: '211201', nombre: 'APORTES SOCIOS', tipo: TipoCuenta.PASIVO },
  {
    codigo: '211202',
    nombre: 'DIST UTILIDADES SOCIOS',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '211203', nombre: 'CTAS CTES SOCIOS', tipo: TipoCuenta.PASIVO },
  { codigo: '211204', nombre: 'CTA PERSONAL', tipo: TipoCuenta.PASIVO },
  { codigo: '211205', nombre: 'APORTE INDUSTRIAL', tipo: TipoCuenta.PASIVO },
  { codigo: '211206', nombre: 'MUTUO C LEONARD', tipo: TipoCuenta.PASIVO },
  { codigo: '2116', nombre: 'CUENTAS PROVEEDORES', tipo: TipoCuenta.PASIVO },
  { codigo: '211601', nombre: 'FACTURAS POR PAGAR', tipo: TipoCuenta.PASIVO },
  { codigo: '211602', nombre: 'VARIOS ACREEDORES', tipo: TipoCuenta.PASIVO },
  { codigo: '22', nombre: 'PASIVO LARGO PLAZO', tipo: TipoCuenta.PASIVO },
  { codigo: '2201', nombre: 'CREDITOS LARGO PLAZO', tipo: TipoCuenta.PASIVO },
  { codigo: '220101', nombre: 'CREDITOS LARGO PLAZO', tipo: TipoCuenta.PASIVO },
  { codigo: '2202', nombre: 'ADUANA DIFERIDOS', tipo: TipoCuenta.PASIVO },
  { codigo: '220201', nombre: 'IMPUESTO RENTA', tipo: TipoCuenta.PASIVO },
  {
    codigo: '2203',
    nombre: 'DOC POR PAGAR LARGO PLAZO',
    tipo: TipoCuenta.PASIVO,
  },
  {
    codigo: '220301',
    nombre: 'DOC POR PAGAR LARGO PLAZO',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '2206', nombre: 'PROVISIONES', tipo: TipoCuenta.PASIVO },
  {
    codigo: '220601',
    nombre: 'INDEMNOZ AÑOS SERVICIOS',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '2207', nombre: 'CREDITPS REAJUSTABLES', tipo: TipoCuenta.PASIVO },
  { codigo: '220701', nombre: 'MUTUOS REAJUSTABLES', tipo: TipoCuenta.PASIVO },
  {
    codigo: '220702',
    nombre: 'PRESTAMOS HIPOTECARIOS',
    tipo: TipoCuenta.PASIVO,
  },
  { codigo: '23', nombre: 'PATRIMONIO', tipo: TipoCuenta.PATRIMONIO },
  { codigo: '2301', nombre: 'CAPITAL PAGADO', tipo: TipoCuenta.PATRIMONIO },
  {
    codigo: '230101',
    nombre: 'CAPITAL POR ENTERAR',
    tipo: TipoCuenta.PATRIMONIO,
  },
  {
    codigo: '2302',
    nombre: 'RESERVAS DE REVALORIZACION',
    tipo: TipoCuenta.PATRIMONIO,
  },
  { codigo: '230202', nombre: 'CAPITAL', tipo: TipoCuenta.PATRIMONIO },
  {
    codigo: '230203',
    nombre: 'REV. CAPITAL PROPIO',
    tipo: TipoCuenta.PATRIMONIO,
  },
  {
    codigo: '2304',
    nombre: 'FLUCTUACION DE VALORES',
    tipo: TipoCuenta.PATRIMONIO,
  },
  {
    codigo: '230401',
    nombre: 'FLUCTUACION DE VALORES',
    tipo: TipoCuenta.PATRIMONIO,
  },
  {
    codigo: '2305',
    nombre: 'UTILIDAD (PERDIDA) RET',
    tipo: TipoCuenta.PATRIMONIO,
  },
  {
    codigo: '230502',
    nombre: 'OTRAS RESERVAS DE UTILIDAD',
    tipo: TipoCuenta.PATRIMONIO,
  },
  {
    codigo: '230503',
    nombre: 'PERDIDAS Y GANANCIAS',
    tipo: TipoCuenta.PATRIMONIO,
  },
  {
    codigo: '230504',
    nombre: 'PERDIDAS Y GANANCIAS',
    tipo: TipoCuenta.PATRIMONIO,
  },
  { codigo: '4', nombre: 'PERDIDAS', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '41',
    nombre: 'COSTO DE EXPLOTACION',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '4101',
    nombre: 'COSTO DE EXPLOTYACION',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410101',
    nombre: 'COSTO DE VENTA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410102',
    nombre: 'COSTO MATERIAS PRIMAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410103',
    nombre: 'COMBUSTIBLES Y LUBRICANTES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410104',
    nombre: 'LUZ Y FUERZA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410105',
    nombre: 'ETIQUETAS Y ENVASES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '410106', nombre: 'SUELDOS', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '410107',
    nombre: 'LEYES SOCIALES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '410108', nombre: 'FLETES', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '410109',
    nombre: 'GASTOS GENERALES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410110',
    nombre: 'MANTENCION MAQUINARIAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '410112', nombre: 'SEGUROS', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '410113',
    nombre: 'BIENESTAR SOCIAL',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410114',
    nombre: 'MERCADERIA IMPORTADA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410115',
    nombre: 'GASTOS BODEGA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410116',
    nombre: 'GASTOS FABRICAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410117',
    nombre: 'GASTOS LABORATORIO',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410118',
    nombre: 'GASTOS COMERCIO EXTERIOR',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410119',
    nombre: 'RECURSOS COMPUTACIONALES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410120',
    nombre: 'MOVILIZACION Y COLACION',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410122',
    nombre: 'MERMAS Y EXCEDENTES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410123',
    nombre: 'REPARACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '410124',
    nombre: 'ARRIENDOS Y MANTENCION EXPLOT',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '42',
    nombre: 'GASTOS DE ADMINISTRACION',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '4201',
    nombre: 'GASTOS DE ADMINISTRACION',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '420101', nombre: 'SUELDOS', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '420102',
    nombre: 'HONORARIOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420103',
    nombre: 'LEYES SOCIALES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420104',
    nombre: 'GASTOS DE OFICINA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420105',
    nombre: 'IMPUESTO RENTA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420106',
    nombre: 'MANTENCION VEHICULO',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420107',
    nombre: 'MANTENCION EQUIPOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420108',
    nombre: 'OTROS GASTOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420109',
    nombre: 'REPRESENTACION Y VIATICOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420110',
    nombre: 'GASTOS BANCARIOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420111',
    nombre: 'INTERESES Y MULTAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420112',
    nombre: 'LEGALES Y NOTARIALES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420113',
    nombre: 'BIENESTAR SOCIAL',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420114',
    nombre: 'GRATIFICACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420115',
    nombre: 'INDEMNIZACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '420116', nombre: 'LEASING', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '420117',
    nombre: 'GASTOS PROPUESTAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '420118', nombre: 'SEGUROS', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '420119',
    nombre: 'GASTOS CAPACITACION',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420120',
    nombre: 'REMUNERACIONES L SOCIALES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420121',
    nombre: 'PUBLICIDAD',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420122',
    nombre: 'GASTOS GENERALES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '420123', nombre: 'SALA CUNA', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '420124',
    nombre: 'GASTOS FINANCIEROS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420125',
    nombre: 'GASTOS COMUNES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420126',
    nombre: 'LOCOMOCION Y COLACION',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420127',
    nombre: 'ASESORIAS PROFESIONALES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420128',
    nombre: 'SINIESTROS IMPORTACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420129',
    nombre: 'DESCUENTOS COMPRAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '420130', nombre: 'ARRIENDOS', tipo: TipoCuenta.RESULTADO_PERDIDA },
  { codigo: '420131', nombre: 'TELEFONO', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '420132',
    nombre: 'SUSCRIPCIONES Y PUBLICACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420134',
    nombre: 'NC DESCUENTOS OTORGADOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420137',
    nombre: 'SERVICIO COMPUTACIONAL',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420139',
    nombre: 'GASTOS RECHAZADOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420140',
    nombre: 'INTERESES PAGADOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420141',
    nombre: 'DONACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '4204',
    nombre: 'FLUCTUACION DE CAMBIOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420401',
    nombre: 'FLUCTUACION DE CAMBIOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '4205',
    nombre: 'GASTOS FINANCIEROS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420501',
    nombre: 'INTERESES BANCARIOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '420502',
    nombre: 'INTS PRORROGA PROVEEDORES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '420504', nombre: 'REAJUSTES', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '4291',
    nombre: 'CASTIGOS Y AMORTIZACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '429101',
    nombre: 'CASTIGOS Y AMORTIZACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '429102',
    nombre: 'DEPRECIACIONES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '429103',
    nombre: 'DEP MUEBLES Y VAJILLA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '429104',
    nombre: 'DEPRECIACION VEHICULO',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '43',
    nombre: 'GASTOS DE VENTAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '4301',
    nombre: 'GASTOS DE VENTA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '430101',
    nombre: 'COMISIONES VENDEDORES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '430102',
    nombre: 'GASTOS COBRANZA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '430103',
    nombre: 'PUBLICIDAD',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '430104',
    nombre: 'INTERESES Y DSCTOS VENTAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '430105',
    nombre: 'OTROS GASTOS DE VENTAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '45',
    nombre: 'CORRECCION MONETARIA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '4501',
    nombre: 'CORRECCION MONETARIA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450101',
    nombre: 'CAPITAL PROPIO INICIAL',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450102',
    nombre: 'AUMENTOS DE CAPITAL',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450103',
    nombre: 'DISMINUCIONES DE CAPITAL',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450104',
    nombre: 'IMPUESTO RENTA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450105',
    nombre: 'ACTIVO INMOVILIZADO',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450106',
    nombre: 'EXISTENCIAS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450107',
    nombre: 'DEUDA MONEDA EXTRANJERA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450108',
    nombre: 'GASTOS DIFERIDOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '450109',
    nombre: 'DEUDAS REAJUSTABLES',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '450110', nombre: 'ACCIONES', tipo: TipoCuenta.RESULTADO_PERDIDA },
  {
    codigo: '450111',
    nombre: 'GASTOS RECHAZADOS',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '47',
    nombre: 'IMPUESTO A LA RENTA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '4701',
    nombre: 'PROV. IMPUESTO RENTA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  {
    codigo: '470101',
    nombre: 'PRIMERA CATEGORIA',
    tipo: TipoCuenta.RESULTADO_PERDIDA,
  },
  { codigo: '5', nombre: 'GANANCIAS', tipo: TipoCuenta.RESULTADO_GANANCIA },
  {
    codigo: '51',
    nombre: 'INGRESOS DE EXPLOTACION',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '5101',
    nombre: 'INGRESOS DE EXPLOTACION',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  { codigo: '510101', nombre: 'VENTAS', tipo: TipoCuenta.RESULTADO_GANANCIA },
  {
    codigo: '510102',
    nombre: 'EXPORTACIONES',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '510103',
    nombre: 'COMISIONES PERCIBIDAS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '510104',
    nombre: 'ASESORIAS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '510105',
    nombre: 'BONO MYPES',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '510106',
    nombre: 'ARRIENDOS PERCIBIDOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '510107',
    nombre: 'VENTAS EXENTAS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '510108',
    nombre: 'ASESORIAS Y CONSULTORIAS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '510109',
    nombre: 'CAPACITACIONES',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '510110',
    nombre: 'ESCOLARIDADES',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '52',
    nombre: 'INGRESOS NO OPERACIONALES',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '5201',
    nombre: 'INGRESOS NO OPERACIONALES',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520101',
    nombre: 'FLUCTUACION DE CAMBIOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520102',
    nombre: 'DIVIDENDOS PERCIBIDOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520103',
    nombre: 'OTRAS ENTRADAS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520104',
    nombre: 'INTERESES GANADOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520105',
    nombre: 'VENTAS DE INMOVILIZADO',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520107',
    nombre: 'REAJ. REMANENTE',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520108',
    nombre: 'REAJSUTES IMPUESTOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520109',
    nombre: 'HONORARIOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  { codigo: '5202', nombre: 'REAJUSTES', tipo: TipoCuenta.RESULTADO_GANANCIA },
  {
    codigo: '520201',
    nombre: 'REAJUSTE CREDITO IVA',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '5204',
    nombre: 'REAJ CRED FISCAL',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520401',
    nombre: 'REAJ CREDITO FISCAL',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520402',
    nombre: 'OTROS INGRESOS NO TRIBUTABLES',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '520403',
    nombre: 'CRED IMP 1 CATEGORIA',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '55',
    nombre: 'CORRECCION MONETARIA',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '5501',
    nombre: 'CORRECCION MONETARIA',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550101',
    nombre: 'CAPITAL PROPIO INICIAL',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550102',
    nombre: 'AUMENTOS DE CAPITAL',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550103',
    nombre: 'DISMINUCIONES DE CAPITAL',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550104',
    nombre: 'IMPUESTO PROVISIONAL',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550105',
    nombre: 'ACTIVO INMOVILIZADO',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550106',
    nombre: 'EXISTENCIAS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550107',
    nombre: 'DEUDA MONEDA EXTRANJERA',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550108',
    nombre: 'GASTOS DIFERIDOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550109',
    nombre: 'DEUDAS REAJUSTABLES',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  { codigo: '550110', nombre: 'ACCIONES', tipo: TipoCuenta.RESULTADO_GANANCIA },
  {
    codigo: '550111',
    nombre: 'GASTOS RECHAZADOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550112',
    nombre: 'OTROS ACTIVOS',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
  {
    codigo: '550113',
    nombre: 'CORRECCION MONETARIA',
    tipo: TipoCuenta.RESULTADO_GANANCIA,
  },
];

const PLANTILLAS = [{ nombre: 'Plan Base', cuentas: PLAN_9_PYMES }];

async function main() {
  console.log('Seed: Start loading Plantillas y Cuentas...');

  // Limpiar datos previos si existen (útil en dev)
  await prisma.cuentaPlantilla.deleteMany();
  await prisma.planPlantilla.deleteMany();

  // NOTA: Los usuarios mock (Juan, María, Admin) han sido extraídos al archivo seed-mock-users.ts
  // para evitar que se creen en entornos de producción.
  let insertedTemplates = 0;
  let insertedAccounts = 0;

  for (const plantilla of PLANTILLAS) {
    const planPlan = await prisma.planPlantilla.create({
      data: {
        nombre: plantilla.nombre,
      },
    });
    insertedTemplates++;

    for (const cuenta of plantilla.cuentas) {
      await prisma.cuentaPlantilla.create({
        data: {
          planPlantillaId: planPlan.id,
          codigo: cuenta.codigo,
          nombre: cuenta.nombre,
          tipo: cuenta.tipo,
        },
      });
      insertedAccounts++;
    }
  }

  console.log(
    `Seed: Finished loading ${insertedTemplates} plantillas y ${insertedAccounts} cuentas plantilla.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
