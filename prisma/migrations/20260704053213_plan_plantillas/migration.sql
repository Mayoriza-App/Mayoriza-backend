-- CreateTable
CREATE TABLE "planes_plantilla" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,

    CONSTRAINT "planes_plantilla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cuentas_plantilla" (
    "id" SERIAL NOT NULL,
    "plan_plantilla_id" INTEGER NOT NULL,
    "codigo" VARCHAR(20) NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "tipo" "TipoCuenta" NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cuentas_plantilla_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cuentas_plantilla_plan_plantilla_id_codigo_key" ON "cuentas_plantilla"("plan_plantilla_id", "codigo");

-- AddForeignKey
ALTER TABLE "cuentas_plantilla" ADD CONSTRAINT "cuentas_plantilla_plan_plantilla_id_fkey" FOREIGN KEY ("plan_plantilla_id") REFERENCES "planes_plantilla"("id") ON DELETE CASCADE ON UPDATE CASCADE;
