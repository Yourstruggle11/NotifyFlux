import bcrypt from "bcryptjs";
import { InsertOneResult } from "mongodb";
import { getUsersCollection } from "../../infra/db/mongo";
import { CreateUserInput, UserDocument } from "./model";

const hashPassword = async (password: string): Promise<string> => bcrypt.hash(password, 10);

export const createUser = async (input: CreateUserInput): Promise<UserDocument> => {
  const collection = getUsersCollection();
  const user: UserDocument = {
    tenantId: input.tenantId,
    userId: input.userId,
    email: input.email.toLowerCase(),
    passwordHash: await hashPassword(input.password),
    roles: input.roles,
    createdAt: new Date()
  };
  const result: InsertOneResult<UserDocument> = await collection.insertOne(user);
  return { ...user, _id: result.insertedId };
};

export const findUserByEmail = async (tenantId: string, email: string): Promise<UserDocument | null> => {
  const collection = getUsersCollection();
  return collection.findOne({ tenantId, email: email.toLowerCase() });
};

export const findUserByUserId = async (tenantId: string, userId: string): Promise<UserDocument | null> => {
  const collection = getUsersCollection();
  return collection.findOne({ tenantId, userId });
};
