import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const userData = Array(5)
    .fill(null)
    .map(() => {
      return {
        name: faker.internet.userName().toLowerCase(),
        email: faker.internet.email().toLocaleLowerCase(),
        image: faker.image.avatar()
      };
    });

  const createUsers = userData.map((user) => prisma.user.create({ data: user }));

  await prisma.$transaction(createUsers);

  await prisma.$disconnect();
}

run();
