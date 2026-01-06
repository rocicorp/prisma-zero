-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "ScalarTypes" (
    "id" TEXT NOT NULL,
    "str" TEXT NOT NULL,
    "int" INTEGER NOT NULL,
    "float" DOUBLE PRECISION NOT NULL,
    "bool" BOOLEAN NOT NULL,
    "dateTime" TIMESTAMP(3) NOT NULL,
    "json" JSONB NOT NULL,
    "bigInt" BIGINT NOT NULL,
    "decimal" DECIMAL(65,30) NOT NULL,
    "bytes" BYTEA NOT NULL,

    CONSTRAINT "ScalarTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OptionalTypes" (
    "id" TEXT NOT NULL,
    "str" TEXT,
    "int" INTEGER,
    "dateTime" TIMESTAMP(3),
    "json" JSONB,
    "enum" "Status",

    CONSTRAINT "OptionalTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArrayTypes" (
    "id" TEXT NOT NULL,
    "strings" TEXT[],
    "ints" INTEGER[],
    "floats" DOUBLE PRECISION[],
    "bools" BOOLEAN[],
    "dateTimes" TIMESTAMP(3)[],
    "bigInts" BIGINT[],
    "decimals" DECIMAL(65,30)[],
    "enums" "Role"[],
    "jsonArray" JSONB[],

    CONSTRAINT "ArrayTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FieldMapping" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,

    CONSTRAINT "FieldMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "table_mappings" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "table_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "combined_mappings" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "combined_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompositePK" (
    "tenantId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "data" TEXT NOT NULL,

    CONSTRAINT "CompositePK_pkey" PRIMARY KEY ("tenantId","recordId")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "bio" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerSkill" (
    "id" TEXT NOT NULL,
    "proficiency" INTEGER NOT NULL DEFAULT 1,
    "workerId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,

    CONSTRAINT "WorkerSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,

    CONSTRAINT "SocialUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantConfig" (
    "id" TEXT NOT NULL,
    "settings" JSONB NOT NULL,
    "tenantId" TEXT NOT NULL,

    CONSTRAINT "TenantConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "assigneeId" TEXT,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnumFields" (
    "id" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "statuses" "Status"[],

    CONSTRAINT "EnumFields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NativeTypes" (
    "id" UUID NOT NULL,
    "varchar" VARCHAR(255) NOT NULL,
    "text" TEXT NOT NULL,
    "smallInt" SMALLINT NOT NULL,
    "decimal" DECIMAL(10,2) NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL,
    "jsonb" JSONB NOT NULL,

    CONSTRAINT "NativeTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostgresNativeTypes" (
    "id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "varchar255" VARCHAR(255) NOT NULL,
    "char10" CHAR(10) NOT NULL,
    "xml" XML NOT NULL,
    "inet" INET NOT NULL,
    "bit8" BIT(8) NOT NULL,
    "varbit" VARBIT NOT NULL,
    "integer" INTEGER NOT NULL,
    "smallint" SMALLINT NOT NULL,
    "oid" OID NOT NULL,
    "bigint" BIGINT NOT NULL,
    "doublePrecision" DOUBLE PRECISION NOT NULL,
    "real" REAL NOT NULL,
    "decimal102" DECIMAL(10,2) NOT NULL,
    "money" MONEY NOT NULL,
    "timestamp6" TIMESTAMP(6) NOT NULL,
    "timestamptz6" TIMESTAMPTZ(6) NOT NULL,
    "date" DATE NOT NULL,
    "time6" TIME(6) NOT NULL,
    "timetz6" TIMETZ(6) NOT NULL,
    "json" JSON NOT NULL,
    "jsonb" JSONB NOT NULL,
    "boolean" BOOLEAN NOT NULL,

    CONSTRAINT "PostgresNativeTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimestampModel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimestampModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefaultFunctions" (
    "id" TEXT NOT NULL,
    "cuidField" TEXT NOT NULL,
    "nowField" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "intDefault" INTEGER NOT NULL DEFAULT 0,
    "boolDefault" BOOLEAN NOT NULL DEFAULT false,
    "strDefault" TEXT NOT NULL DEFAULT 'default',

    CONSTRAINT "DefaultFunctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExcludedModel" (
    "id" TEXT NOT NULL,
    "secret" TEXT NOT NULL,

    CONSTRAINT "ExcludedModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MinimalModel" (
    "id" TEXT NOT NULL,

    CONSTRAINT "MinimalModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReservedWords" (
    "id" TEXT NOT NULL,
    "select_field" TEXT NOT NULL,
    "from_field" TEXT NOT NULL,
    "where_field" TEXT NOT NULL,

    CONSTRAINT "ReservedWords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ArticleToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ArticleToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_BlockList" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BlockList_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerSkill_workerId_skillId_key" ON "WorkerSkill"("workerId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialUser_username_key" ON "SocialUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "TenantConfig_tenantId_key" ON "TenantConfig"("tenantId");

-- CreateIndex
CREATE INDEX "_ArticleToTag_B_index" ON "_ArticleToTag"("B");

-- CreateIndex
CREATE INDEX "_BlockList_B_index" ON "_BlockList"("B");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSkill" ADD CONSTRAINT "WorkerSkill_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSkill" ADD CONSTRAINT "WorkerSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantConfig" ADD CONSTRAINT "TenantConfig_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArticleToTag" ADD CONSTRAINT "_ArticleToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockList" ADD CONSTRAINT "_BlockList_A_fkey" FOREIGN KEY ("A") REFERENCES "SocialUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BlockList" ADD CONSTRAINT "_BlockList_B_fkey" FOREIGN KEY ("B") REFERENCES "SocialUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

