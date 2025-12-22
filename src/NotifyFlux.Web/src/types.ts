export type Role = "admin" | "user" | "service";

export type AuthState = {
  readonly tenantId: string | null;
  readonly userId: string | null;
  readonly roles: ReadonlyArray<Role> | null;
  readonly token: string | null;
};

export type Notification = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly type: string;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly seen: boolean;
  readonly createdAt: string;
};

export type SystemEvent = {
  readonly tenantId: string;
  readonly code: string;
  readonly message: string;
  readonly timestamp: string;
};

export type UserProfile = {
  readonly tenantId: string;
  readonly userId: string;
  readonly email: string;
  readonly roles: ReadonlyArray<Role>;
  readonly createdAt: string;
};
