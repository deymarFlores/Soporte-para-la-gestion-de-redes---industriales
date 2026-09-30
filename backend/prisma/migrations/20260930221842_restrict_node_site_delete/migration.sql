-- DropForeignKey
ALTER TABLE "Node" DROP CONSTRAINT "Node_siteId_fkey";

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
