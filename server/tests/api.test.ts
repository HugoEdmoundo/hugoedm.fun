import { MongoMemoryServer } from "mongodb-memory-server";
import type { Model } from "mongoose";
import type { Express } from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";

const ADMIN_CODE = "rahasia-admin-code";

let mongo: MongoMemoryServer;
let app: Express;
let token: string;
let SiteConfigModel: Model<any>;
let ProjectModel: Model<any>;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  // env.ts membaca process.env saat import, jadi env harus diset sebelum import modul app.
  process.env.MONGODB_URI = mongo.getUri("hugoedm_test");
  process.env.JWT_SECRET = "test-secret-yang-cukup-panjang-untuk-jwt";
  process.env.PUBLIC_URL = "http://localhost:4000";
  process.env.CLIENT_ORIGIN = "http://localhost:8990";
  process.env.LOGIN_RATE_LIMIT = "3";

  const { connectDb, disconnectDb } = await import("../src/db.js");
  await connectDb();

  const models = await import("../src/models/index.js");
  SiteConfigModel = models.SiteConfigModel;
  ProjectModel = models.ProjectModel;

  const { hashAccessCode } = await import("../src/utils/access-code.js");
  await SiteConfigModel.create({ site_name: "Test Site", admin_code: await hashAccessCode(ADMIN_CODE) });

  ({ app } = await import("../src/index.js"));

  const login = await request(app).post("/api/auth/login").send({ code: ADMIN_CODE });
  expect(login.status).toBe(200);
  token = login.body.token;
});

afterAll(async () => {
  const { disconnectDb } = await import("../src/db.js");
  await disconnectDb();
  await mongo.stop();
});

const auth = () => ({ Authorization: `Bearer ${token}` });

describe("health & header keamanan", () => {
  it("health check ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ ok: true, service: "hugoedm-api" });
  });

  it("helmet memasang header keamanan", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("SAMEORIGIN");
    expect(res.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });

  it("route tidak dikenal -> 404 JSON", async () => {
    const res = await request(app).get("/api/tidak-ada");
    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Not found");
  });
});

describe("auth", () => {
  it("menolak login dengan code salah", async () => {
    const res = await request(app).post("/api/auth/login").send({ code: "salah-total" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Invalid access code");
  });

  it("menolak body tanpa code", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect(res.status).toBe(400);
  });

  it("rate limit setelah 3 kegagalan (LOGIN_RATE_LIMIT=3)", async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 5; i++) {
      const res = await request(app).post("/api/auth/login").send({ code: `salah-${i}` });
      statuses.push(res.status);
    }
    expect(statuses).toContain(429);
  });

  it("/auth/me butuh token valid", async () => {
    expect((await request(app).get("/api/auth/me")).status).toBe(401);
    expect((await request(app).get("/api/auth/me").set("Authorization", "Bearer TOKENngawur")).status).toBe(401);
    const res = await request(app).get("/api/auth/me").set(auth());
    expect(res.status).toBe(200);
    expect(res.body.user.role).toBe("admin");
  });

  it("/auth/code hanya melaporkan status, tidak pernah plaintext", async () => {
    const res = await request(app).get("/api/auth/code").set(auth());
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ configured: true, hashed: true });
    expect(JSON.stringify(res.body)).not.toContain(ADMIN_CODE);
  });

  it("ganti access code: tolak <8 karakter, terima >=8 dan hash", async () => {
    const pendek = await request(app).put("/api/auth/code").set(auth()).send({ code: "pendek" });
    expect(pendek.status).toBe(400);

    const ok = await request(app).put("/api/auth/code").set(auth()).send({ code: "kode-baru-yang-panjang" });
    expect(ok.status).toBe(200);

    const doc = await SiteConfigModel.findOne().sort({ updated_at: -1 });
    expect(doc?.admin_code).toMatch(/^\$2[aby]\$\d{2}\$/);
    expect(doc?.admin_code).not.toBe("kode-baru-yang-panjang");

    // kembalikan agar test lain tidak terpengaruh
    const { hashAccessCode } = await import("../src/utils/access-code.js");
    await SiteConfigModel.findByIdAndUpdate(doc?._id, { admin_code: await hashAccessCode(ADMIN_CODE) });
  });
});

describe("site-config publik", () => {
  it("tidak pernah membocorkan admin_code", async () => {
    const res = await request(app).get("/api/site-config");
    expect(res.status).toBe(200);
    expect(res.body.admin_code).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain("$2b$");
  });
});

describe("CRUD + pagination", () => {
  beforeAll(async () => {
    for (let i = 0; i < 5; i++) {
      await request(app)
        .post("/api/projects")
        .set(auth())
        .send({ title: `Project ${i}`, description: "desc", sort_order: i });
    }
  });

  it("POST tanpa token ditolak", async () => {
    const res = await request(app).post("/api/projects").send({ title: "Tanpa token" });
    expect(res.status).toBe(401);
  });

  it("GET list mengembalikan array + X-Total-Count", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.headers["x-total-count"]).toBe("5");
    expect(res.body[0]._id).toBeDefined();
  });

  it("GET dengan page/limit mengembalikan envelope", async () => {
    const res = await request(app).get("/api/projects?page=2&limit=2");
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body).toMatchObject({ page: 2, limit: 2, total: 5, totalPages: 3 });
    expect(res.body.items[0].title).toBe("Project 2");
  });

  it("GET dengan limit di luar batas -> 400", async () => {
    const res = await request(app).get("/api/projects?limit=9999");
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/validation failed/i);
  });

  it("CRUD lengkap: create -> read -> update -> delete", async () => {
    const created = await request(app).post("/api/projects").set(auth()).send({ title: " temporary " });
    expect(created.status).toBe(201);
    const id = created.body._id;

    const read = await request(app).get(`/api/projects/${id}`);
    expect(read.status).toBe(200);
    expect(read.body.title).toBe(" temporary ");

    const updated = await request(app).put(`/api/projects/${id}`).set(auth()).send({ title: "Diupdate" });
    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe("Diupdate");

    const deleted = await request(app).delete(`/api/projects/${id}`).set(auth());
    expect(deleted.status).toBe(200);
    expect((await request(app).get(`/api/projects/${id}`)).status).toBe(404);
  });

  it("field di luar schema diabaikan", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set(auth())
      .send({ title: "Sisip", field_nasib: "tidak boleh masuk" });
    expect(res.status).toBe(201);
    expect(res.body.field_nasib).toBeUndefined();
    await request(app).delete(`/api/projects/${res.body._id}`).set(auth());
  });

  it("PUT / DELETE id tidak ada -> 404", async () => {
    const id = "00000000-0000-0000-0000-000000000000";
    expect((await request(app).put(`/api/projects/${id}`).set(auth()).send({ title: "x" })).status).toBe(404);
    expect((await request(app).delete(`/api/projects/${id}`).set(auth())).status).toBe(404);
  });
});

describe("upload", () => {
  const png = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );

  it("tanpa token -> 401", async () => {
    const res = await request(app).post("/api/upload").attach("file", png, "foto.png");
    expect(res.status).toBe(401);
  });

  it("MIME terlarang -> 400 dan tidak ada file tersimpan", async () => {
    const { readdirSync } = await import("node:fs");
    const { uploadsDir } = await import("../src/routes/upload.js");
    const before = readdirSync(uploadsDir).length;

    const res = await request(app)
      .post("/api/upload")
      .set(auth())
      .attach("file", Buffer.from("<?php echo 1; ?>"), "evil.php");

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/tipe file tidak diizinkan/i);
    expect(readdirSync(uploadsDir).length).toBe(before);
  });

  it("PNG valid -> 201 dengan URL /uploads dan ekstensi dari MIME", async () => {
    const res = await request(app).post("/api/upload").set(auth()).attach("file", png, "foto.png");
    expect(res.status).toBe(201);
    expect(res.body.url).toMatch(/\/uploads\/\d+-[0-9a-f]{8}\.png$/);
  });
});

describe("index MongoDB", () => {
  it("index compound terpasang sesuai definisi model", async () => {
    const indexes = await ProjectModel.collection.indexes();
    const names = indexes.map((i: { name?: string }) => i.name);
    expect(names).toContain("sort_order_1_created_at_1");
    expect(names).toContain("featured_1_sort_order_1");
  });
});
