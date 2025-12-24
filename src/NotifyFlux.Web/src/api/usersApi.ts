import { UserProfile } from "../types";

const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const getCurrentUser = async (tenantId: string, token: string): Promise<UserProfile> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data = await res.json() as { readonly user: UserProfile };
  return data.user;
};

export type CreateUserRequest = {
  readonly userId: string;
  readonly email: string;
  readonly password: string;
  readonly roles: ReadonlyArray<"admin" | "user" | "service">;
};

export const createUser = async (tenantId: string, token: string, payload: CreateUserRequest): Promise<UserProfile> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("Failed to create user");
  }

  const data = await res.json() as { readonly user: UserProfile };
  return data.user;
};
