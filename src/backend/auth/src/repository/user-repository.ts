import { PrismaClient, Prisma, registered_users as UserEntity } from "@prisma/client";

class ReadUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async get_user_password(email: string): Promise<string> {
    let user = await this.prisma.registered_users.findUnique({
      where: {
        email: email,
      },
    });
    if (user) {
      return user.password;
    }
    return "";
  }

  async check_existance(email: string): Promise<boolean> {
    let user = await this.prisma.registered_users.findUnique({
      where: {
        email: email,
      },
    });
    if (user) {
      return true;
    }
    return false;
  }

  async getRow_byColumn(
    column: keyof Prisma.registered_usersWhereInput,
    value: string | number
  ): Promise<UserEntity | null> {
    if (!column) throw new Error("Column is required");

    try {
      return await this.prisma.registered_users.findFirst({
        where: {
          [column]: value,
        } as Prisma.registered_usersWhereInput, // Type cast for dynamic filtering
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

class WriteUserRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async addRow(data: { email: string; password: string }): Promise<UserEntity> {
    try {
      return await this.prisma.registered_users.create({
        data: {
          password: data.password,
          email: data.email,
        },
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

class UserRepository {
  public read: ReadUserRepository;
  public write: WriteUserRepository;

  constructor(prisma: PrismaClient) {
    this.read = new ReadUserRepository();
    this.write = new WriteUserRepository();
  }
}

const prisma = new PrismaClient();
export const userRepository = new UserRepository(prisma);
