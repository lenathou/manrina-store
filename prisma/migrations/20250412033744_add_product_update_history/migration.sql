-- CreateTable
CREATE TABLE "ProductUpdateHistory" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductUpdateHistory_pkey" PRIMARY KEY ("id")
);
