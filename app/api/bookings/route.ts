import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email");
  if (!email) return Response.json({ error: "email is required" }, { status: 400 });
  const bookings = await prisma.booking.findMany({
    where: { user: { email } }, orderBy: { date: "desc" },
    include: { restaurant: true, table: true, items: { include: { menuItem: true } } }
  });
  return Response.json(bookings);
}

export async function POST(request: Request) {
  const { email, restaurantId, tableNumber, date, time, guests, items } = await request.json();
  if (!email || !restaurantId || !tableNumber || !date || !time || !items?.length) return Response.json({ error: "Не заполнены данные бронирования" }, { status: 400 });
  try {
    const booking = await prisma.$transaction(async (tx) => {
      const [user, table] = await Promise.all([
        tx.user.findUnique({ where: { email } }),
        tx.table.findFirst({ where: { restaurantId, number: tableNumber } })
      ]);
      if (!user || !table) throw new Error("NOT_FOUND");
      const occupied = await tx.booking.findFirst({ where: { tableId: table.id, date, time, status: "CONFIRMED" } });
      if (occupied) throw new Error("OCCUPIED");
      const menuItems = await Promise.all(items.map((item: { name: string }) => tx.menuItem.findFirst({ where: { name: item.name, category: { restaurantId } } })));
      if (menuItems.some(item => !item)) throw new Error("MENU_ITEM_NOT_FOUND");
      const totalPrice = items.reduce((sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity, 0);
      return tx.booking.create({
        data: { userId: user.id, restaurantId, tableId: table.id, date, time, guests, totalPrice, status: "CONFIRMED", items: { create: items.map((item: { name: string; quantity: number; comment?: string }, index: number) => ({ menuItemId: menuItems[index]!.id, quantity: item.quantity, comment: item.comment || null })) } },
        include: { restaurant: true, table: true, items: { include: { menuItem: true } } }
      });
    });
    return Response.json(booking, { status: 201 });
  } catch (error) {
    const code = error instanceof Error ? error.message : "UNKNOWN";
    const message = code === "OCCUPIED" ? "Этот столик уже занят на выбранное время" : code === "NOT_FOUND" ? "Не найден пользователь или столик" : "Не удалось создать бронь";
    return Response.json({ error: message }, { status: code === "OCCUPIED" ? 409 : 400 });
  }
}

export async function PATCH(request: Request) {
  const { id, email } = await request.json();
  const booking = await prisma.booking.findFirst({ where: { id, user: { email } } });
  if (!booking) return Response.json({ error: "Бронь не найдена" }, { status: 404 });
  return Response.json(await prisma.booking.update({ where: { id }, data: { status: "CANCELLED" } }));
}
