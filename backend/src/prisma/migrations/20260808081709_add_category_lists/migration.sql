-- CreateTable
CREATE TABLE "category_list" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "category_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subcategory_list" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "subcategory_list_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_list_name_key" ON "category_list"("name");

-- CreateIndex
CREATE UNIQUE INDEX "subcategory_list_name_category_id_key" ON "subcategory_list"("name", "category_id");

-- AddForeignKey
ALTER TABLE "subcategory_list" ADD CONSTRAINT "subcategory_list_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category_list"("id") ON DELETE CASCADE ON UPDATE CASCADE;
