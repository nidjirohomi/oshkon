import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  await prisma.bookingItem.deleteMany(); await prisma.booking.deleteMany(); await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany(); await prisma.table.deleteMany(); await prisma.restaurant.deleteMany(); await prisma.user.deleteMany();
  await prisma.user.create({ data: { name: "Тестовый гость", email: "test@test.com", password: await bcrypt.hash("password", 10), role: "GUEST" } });
  const restaurants = [
    { id: "uyut", name: "Кофейня Уют", cuisine: "Авторская кухня", rating: 4.9, address: "ул. Токтогула, 115", imageUrl: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80", description: "Место для медленных завтраков, хорошего кофе и тёплых встреч." },
    { id: "vostok", name: "Ресторан Восток", cuisine: "Восточная кухня", rating: 4.8, address: "пр. Чуй, 178", imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80", description: "Традиционные вкусы Востока в современной подаче." },
    { id: "sary", name: "Sary-Chelek", cuisine: "Кыргызская кухня", rating: 4.7, address: "ул. Московская, 43", imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80", description: "Сезонные продукты, открытая кухня и спокойная атмосфера." }
  ];
  for (const r of restaurants) {
    const restaurant = await prisma.restaurant.create({ data: r });
    await prisma.table.createMany({ data: Array.from({ length: 12 }, (_, i) => ({ id: `${restaurant.id}-table-${i + 1}`, restaurantId: restaurant.id, number: i + 1, capacity: i % 3 === 0 ? 6 : i % 2 ? 2 : 4, x: 8 + (i % 4) * 28, y: 12 + Math.floor(i / 4) * 30, shape: i % 3 === 0 ? "round" : "square" })) });
    const main = await prisma.menuCategory.create({ data: { id: `${restaurant.id}-main`, restaurantId: restaurant.id, name: "Основное меню" } });
    await prisma.menuItem.createMany({ data: ["Тыквенный крем-суп", "Тёплый салат с курицей", "Паста с грибами", "Куриное филе гриль", "Домашний лимонад", "Капучино"].map((name, i) => ({ id: `${restaurant.id}-item-${i + 1}`, categoryId: main.id, name, description: "Свежие сезонные ингредиенты и внимательная подача.", price: [390, 480, 620, 590, 230, 220][i], imageUrl: r.imageUrl })) });
  }
}
main().finally(() => prisma.$disconnect());
