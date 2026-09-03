import { autoGenerateArticles } from "../src/lib/ai/auto-generate-articles";
import { prisma } from "../src/lib/db";

async function main() {
  const result = await autoGenerateArticles({
    finishedMatchIds: [],
    leagueIds: [],
  });

  console.log("Article generation completed:");
  console.log(JSON.stringify(result, null, 2));

  if (result.errors.length > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });