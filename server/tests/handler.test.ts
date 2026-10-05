import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import serverless from "serverless-http";

const ADMIN_CODE = "rahasia-admin-code";

type LambdaEvent = Record<string, unknown>;

/**
 * `serverless-http` menerima event berbentuk API Gateway v2, bukan (req, res).
 * Test ini memanggil app persis seperti Vercel memanggil function, jadi regresi
 * pada wiring serverless (mis. koneksi DB belum siap) ketahuan di lokal.
 */
function event(method: string, path: string, body?: unknown, token?: string): LambdaEvent {
  return {
    version: "2.0",
    rawPath: path,
    headers: {
      host: "hugoedm-fun.vercel.app",
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    requestContext: { http: { method, path, sourceIp: "1.2.3.4" } },
    isBase64Encoded: false,
    body: body === undefined ? undefined : JSON.stringify(body),
  };
}

let mongo: MongoMemoryServer;
let handler: (event: LambdaEvent, context: unknown) => Promise<{ statusCode: number; body: string }>;
let token: string;

const call = async (method: string, path: string, body?: unknown, authToken?: string) => {
  const res = await handler(event(method, path, body, authToken), {});
  const parsed = res.body ? (JSON.parse(res.body) as unknown) : null;
  return { status: res.statusCode, body: parsed };
};

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri("hugoedm_handler_test");
  process.env.JWT_SECRET = "test-secret-yang-cukup-panjang-untuk-jwt";
  process.env.PUBLIC_URL = "https://hugoedm-fun.vercel.app";
  process.env.CLIENT_ORIGIN = "https://hugoedm-fun.vercel.app";
  // Sengaja TIDAK set BLOB_READ_WRITE_TOKEN: upload harus fallback ke disk lokal.

  const { connectDb } = await import("../src/db.js");
  await connectDb();

  const { SiteConfigModel } = await import("../src/models/index.js");
  const { hashAccessCode } = await import("../src/utils/access-code.js");
  await SiteConfigModel.create({ site_name: "Handler Site", admin_code: await hashAccessCode(ADMIN_CODE) });

  const { app } = await import("../src/index.js");
  handler = serverless(app) as unknown as typeof handler;

  const login = await call("POST", "/api/auth/login", { code: ADMIN_CODE });
  token = (login.body as { token: string }).token;
});

afterAll(async () => {
  const { disconnectDb } = await import("../src/db.js");
  await disconnectDb();
  await mongo.stop();
});

describe("serverless handler", () => {
  it("melayani health check", async () => {
    const res = await call("GET", "/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true });
  });

  it("melayani seluruh endpoint baca tanpa login", async () => {
    for (const path of ["site-config", "projects", "skills", "gallery", "tasks", "education", "experience", "social-links"]) {
      const res = await call("GET", `/api/${path}`);
      expect(res.status, path).toBe(200);
    }
  });

  it("menolak tulis tanpa token", async () => {
    const res = await call("POST", "/api/projects", { title: "Tanpa token" });
    expect(res.status).toBe(401);
  });

  it("memberi token untuk kode akses yang benar", async () => {
    expect(token).toBeTruthy();
  });

  it("menolak kode akses yang salah", async () => {
    const res = await call("POST", "/api/auth/login", { code: "kode-salah" });
    expect([401, 429]).toContain(res.status);
  });

  it("menjalankan siklus CRUD penuh", async () => {
    const created = await call("POST", "/api/projects", { title: "ZZ Handler Test", sort_order: 997 }, token);
    expect(created.status).toBe(201);
    const id = (created.body as { _id: string })._id;

    const updated = await call("PUT", `/api/projects/${id}`, { title: "ZZ Handler Updated" }, token);
    expect(updated.status).toBe(200);
    expect((updated.body as { title: string }).title).toBe("ZZ Handler Updated");

    const fetched = await call("GET", `/api/projects/${id}`);
    expect((fetched.body as { title: string }).title).toBe("ZZ Handler Updated");

    const removed = await call("DELETE", `/api/projects/${id}`, undefined, token);
    expect(removed.status).toBe(200);

    const gone = await call("GET", `/api/projects/${id}`);
    expect(gone.status).toBe(404);
  });

  it("mengembalikan 404 untuk route tak dikenal", async () => {
    const res = await call("GET", "/api/tidak-ada");
    expect(res.status).toBe(404);
  });
});