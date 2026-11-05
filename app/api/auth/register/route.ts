import bcrypt from "bcryptjs";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  const { name, email, password } = await request.json();
  if (!name || !email?.includes("@") || !password || password.length < 6) {
    return Response.json({ error: "Заполните форму: пароль должен быть не короче 6 символов" }, { status: 400 });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return Response.json({ error: "Пользователь с таким email уже зарегистрирован" }, { status: 409 });
  const user = await prisma.user.create({ data: { name, email, password: await bcrypt.hash(password, 10) } });
  return Response.json({ user: { id: user.id, name: user.name, email: user.email } }, { status: 201 });
}
