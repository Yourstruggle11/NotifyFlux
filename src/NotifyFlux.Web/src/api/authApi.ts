import { Role } from "../types";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export type LoginResponse = {
  readonly token: string;
  readonly user: {
    readonly userId: string;
    readonly email: string;
    readonly roles: ReadonlyArray<Role>;
  };
};

export const login = async (tenantId: string, email: string, password: string): Promise<LoginResponse> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  const data = (await res.json()) as LoginResponse | { readonly message?: string };

  if (!res.ok) {
    const errorMessage = "message" in data && typeof data.message === "string" ? data.message : "Login failed";
    throw new Error(errorMessage);
  }

  return data as LoginResponse;
};

export const issueServiceToken = async (tenantId: string, token: string, userId?: string): Promise<{ readonly token: string }> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/auth/service-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(userId ? { userId } : {})
  });

  if (!res.ok) {
    throw new Error("Failed to issue service token");
  }

  const data = (await res.json()) as { readonly token: string };
  return data;
};
