import { Role } from "../../shared/types";

export type AuthTokenPayload = {
  readonly tenantId: string;
  readonly userId: string;
  readonly roles: ReadonlyArray<Role>;
  readonly iat: number;
  readonly exp: number;
};
