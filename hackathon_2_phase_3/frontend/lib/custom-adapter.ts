import { inMemoryDB } from "./in-memory-db";

// Custom adapter for Better Auth
// This provides a simple in-memory database that persists across requests

export const customAdapter = () => {
  return {
    id: "custom-memory",

    async create(data: any) {
      const { model, data: record } = data;

      // Map Better Auth model names to our database keys
      const tableName = model as keyof typeof inMemoryDB;

      if (!inMemoryDB[tableName]) {
        inMemoryDB[tableName] = [] as any;
      }

      const table = inMemoryDB[tableName] as any[];
      table.push(record);

      console.log(`=== [Adapter] Created ${model}:`, record.id || record.email || "unknown");
      return record;
    },

    async findOne(data: any) {
      const { model, where } = data;
      const tableName = model as keyof typeof inMemoryDB;

      if (!inMemoryDB[tableName]) {
        console.log(`=== [Adapter] ${model} not found in database`);
        return null;
      }

      const table = inMemoryDB[tableName] as any[];

      // Handle different where clauses
      if (where?.email) {
        const user = table.find((u: any) => u.email === where.email);
        console.log(`=== [Adapter] Finding ${model} by email:`, where.email, user ? "FOUND" : "NOT FOUND");
        return user || null;
      }

      if (where?.id) {
        const record = table.find((r: any) => r.id === where.id);
        console.log(`=== [Adapter] Finding ${model} by id:`, where.id, record ? "FOUND" : "NOT FOUND");
        return record || null;
      }

      // Handle token-based lookup (for sessions)
      if (where?.token) {
        const record = table.find((r: any) => r.token === where.token || r.id === where.token);
        console.log(`=== [Adapter] Finding ${model} by token:`, where.token, record ? "FOUND" : "NOT FOUND");
        return record || null;
      }

      // Handle accountId/providerId lookup (for accounts)
      if (where?.accountId && where?.providerId) {
        const record = table.find((r: any) =>
          r.accountId === where.accountId && r.providerId === where.providerId
        );
        return record || null;
      }

      console.log(`=== [Adapter] Finding ${model} with where:`, where, "NOT FOUND");
      return null;
    },

    async findMany(data: any) {
      const { model } = data;
      const tableName = model as keyof typeof inMemoryDB;

      if (!inMemoryDB[tableName]) {
        return [];
      }

      const table = inMemoryDB[tableName] as any[];
      console.log(`=== [Adapter] Finding many ${model}s:`, table.length, "records");
      return table;
    },

    async update(data: any) {
      const { model, where, update: updates } = data;
      const tableName = model as keyof typeof inMemoryDB;

      if (!inMemoryDB[tableName]) {
        return null;
      }

      const table = inMemoryDB[tableName] as any[];

      // Find the record
      let record: any = null;

      if (where?.id) {
        record = table.find((r: any) => r.id === where.id);
      } else if (where?.email) {
        record = table.find((r: any) => r.email === where.email);
      } else if (where?.token) {
        record = table.find((r: any) => r.token === where.token || r.id === where.token);
      }

      if (record) {
        Object.assign(record, updates);
        console.log(`=== [Adapter] Updated ${model}:`, record.id || record.email);
        return record;
      }

      return null;
    },

    async delete(data: any) {
      const { model, where } = data;
      const tableName = model as keyof typeof inMemoryDB;

      if (!inMemoryDB[tableName]) {
        return;
      }

      const table = inMemoryDB[tableName] as any[];

      if (where?.id) {
        const index = table.findIndex((r: any) => r.id === where.id);
        if (index >= 0) {
          table.splice(index, 1);
          console.log(`=== [Adapter] Deleted ${model} with id:`, where.id);
        }
      } else if (where?.token) {
        const index = table.findIndex((r: any) => r.token === where.token || r.id === where.token);
        if (index >= 0) {
          table.splice(index, 1);
          console.log(`=== [Adapter] Deleted ${model} with token:`, where.token);
        }
      }
    },

    // Optional methods for full adapter compliance
    async count(data: any) {
      const { model } = data;
      const tableName = model as keyof typeof inMemoryDB;

      if (!inMemoryDB[tableName]) {
        return 0;
      }

      return (inMemoryDB[tableName] as any[]).length;
    },
  };
};
