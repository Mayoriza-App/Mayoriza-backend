
CREATE TYPE "TipoCuenta" AS ENUM ('ACTIVO', 'PASIVO', 'PATRIMONIO', 'RESULTADO_PERDIDA', 'RESULTADO_GANANCIA');


CREATE TYPE "TipoComprobante" AS ENUM ('INGRESO', 'EGRESO', 'TRASPASO');


CREATE TABLE "empresas" (
    "rut" VARCHAR(12) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "giro" VARCHAR(255) NOT NULL,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("rut")
);


CREATE TABLE "cuentas_contables" (
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,

    CONSTRAINT "cuentas_contables_pkey" PRIMARY KEY ("codigo")
);


CREATE TABLE "terceros" (
    "rut" VARCHAR(12) NOT NULL,
    "razon_social" VARCHAR(255) NOT NULL,
    "giro" VARCHAR(255),

    CONSTRAINT "terceros_pkey" PRIMARY KEY ("rut")
);


CREATE TABLE "centros_costo" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,

    CONSTRAINT "centros_costo_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "comprobantes" (
    "id" SERIAL NOT NULL,
    "empresa_rut" TEXT NOT NULL,
    "tipo" "TipoComprobante" NOT NULL,
    "fecha" DATE NOT NULL,
    "glosa_general" TEXT NOT NULL,
    "periodo_mes" INTEGER NOT NULL,
    "periodo_anio" INTEGER NOT NULL,

    CONSTRAINT "comprobantes_pkey" PRIMARY KEY ("id")
);


CREATE TABLE "movimientos" (
    "id" SERIAL NOT NULL,
    "comprobante_id" INTEGER NOT NULL,
    "cuenta_codigo" TEXT NOT NULL,
    "tercero_rut" TEXT,
    "centro_costo_id" INTEGER,
    "debe" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "haber" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "glosa_linea" VARCHAR(255),
    "sii_tipo_dte" INTEGER,
    "sii_folio_doc" BIGINT,

    CONSTRAINT "movimientos_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "comprobantes" ADD CONSTRAINT "comprobantes_empresa_rut_fkey" FOREIGN KEY ("empresa_rut") REFERENCES "empresas"("rut") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_comprobante_id_fkey" FOREIGN KEY ("comprobante_id") REFERENCES "comprobantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_cuenta_codigo_fkey" FOREIGN KEY ("cuenta_codigo") REFERENCES "cuentas_contables"("codigo") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_tercero_rut_fkey" FOREIGN KEY ("tercero_rut") REFERENCES "terceros"("rut") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientos" ADD CONSTRAINT "movimientos_centro_costo_id_fkey" FOREIGN KEY ("centro_costo_id") REFERENCES "centros_costo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
