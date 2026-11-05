import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return Response.json({ error: "Неверный email или пароль" }, { status: 401 });
  }
  return Response.json({ user: { id: user.id, name: user.name, email: user.email } });
}
