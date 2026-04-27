import { db } from "./index";
import { categories, products } from "./schema";

async function seed() {
  const [food, bedding, toys, cage] = await db
    .insert(categories)
    .values([
      { slug: "food", name: "사료/간식", description: "햄스터 주식 및 간식" },
      { slug: "bedding", name: "베딩", description: "케이지 바닥재" },
      { slug: "toys", name: "장난감", description: "쳇바퀴, 터널 등" },
      { slug: "cage", name: "케이지", description: "사육장 및 액세서리" },
    ])
    .returning();

  await db.insert(products).values([
    {
      slug: "premium-hamster-mix",
      name: "프리미엄 햄스터 믹스 사료 1kg",
      description: "곡물과 견과류가 균형있게 들어간 주식 사료",
      priceKrw: 12900,
      stock: 50,
      categoryId: food.id,
    },
    {
      slug: "paper-bedding-10l",
      name: "종이 베딩 10L",
      description: "흡수력 좋은 무향 종이 베딩",
      priceKrw: 15900,
      stock: 30,
      categoryId: bedding.id,
    },
    {
      slug: "silent-wheel-21cm",
      name: "사일런트 쳇바퀴 21cm",
      description: "조용한 베어링 구조 운동용 쳇바퀴",
      priceKrw: 24900,
      stock: 20,
      categoryId: toys.id,
    },
    {
      slug: "acrylic-cage-60",
      name: "아크릴 사육장 60cm",
      description: "통풍 잘 되는 투명 아크릴 케이지",
      priceKrw: 89000,
      stock: 10,
      categoryId: cage.id,
    },
  ]);

  console.log("✅ Seed complete");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
