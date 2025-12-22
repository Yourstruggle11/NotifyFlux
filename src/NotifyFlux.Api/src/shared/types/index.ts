export type Role = "admin" | "user" | "service";

export type AuthContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly roles: ReadonlyArray<Role>;
};

export type NotificationDto = {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly type: string;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, string | number | boolean | null>>;
  readonly seen: boolean;
  readonly createdAt: string;
};

export type SystemEventDto = {
  readonly tenantId: string;
  readonly code: string;
  readonly message: string;
  readonly timestamp: string;
};
