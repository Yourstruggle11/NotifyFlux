const baseUrl = import.meta.env.VITE_API_BASE_URL;

export type HealthStatus = { readonly status: string; readonly error?: string };

export const getHealth = async (): Promise<HealthStatus> => {
  const res = await fetch(`${baseUrl}/health`);
  if (!res.ok) {
    throw new Error("Health check failed");
  }
  return res.json() as Promise<HealthStatus>;
};

export const getReadiness = async (): Promise<HealthStatus> => {
  const res = await fetch(`${baseUrl}/ready`);
  if (!res.ok) {
    throw new Error("Readiness check failed");
  }
  return res.json() as Promise<HealthStatus>;
};

export type SeedResult = {
  readonly createdUsers: number;
  readonly createdNotifications: number;
  readonly users: ReadonlyArray<{ readonly email: string; readonly password: string; readonly roles: ReadonlyArray<string> }>;
};

export const seedDemoData = async (tenantId: string, token: string): Promise<SeedResult> => {
  const res = await fetch(`${baseUrl}/api/${tenantId}/demo/seed`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) {
    throw new Error("Failed to seed demo data");
  }
  const data = await res.json() as { readonly seeded: SeedResult };
  return data.seeded;
};
