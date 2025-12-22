import { ObjectId } from "mongodb";
import { Role } from "../../shared/types";

export type UserDocument = {
  readonly _id?: ObjectId;
  readonly tenantId: string;
  readonly userId: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly roles: ReadonlyArray<Role>;
  readonly createdAt: Date;
};

export type CreateUserInput = {
  readonly tenantId: string;
  readonly userId: string;
  readonly email: string;
  readonly password: string;
  readonly roles: ReadonlyArray<Role>;
};
