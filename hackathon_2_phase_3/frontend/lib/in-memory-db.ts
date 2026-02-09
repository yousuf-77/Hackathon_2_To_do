// In-memory database that persists across requests
// This uses a global variable to persist data for the lifetime of the server process

declare global {
  var _betterAuthInMemoryDB: {
    user: any[];
    session: any[];
    account: any[];
    verification: any[];
  } | undefined;
}

// Initialize the global database if it doesn't exist
if (!global._betterAuthInMemoryDB) {
  global._betterAuthInMemoryDB = {
    user: [],
    session: [],
    account: [],
    verification: [],
  };
}

// Export the database reference
export const inMemoryDB = global._betterAuthInMemoryDB;

// Helper functions for debugging
export function debugDB() {
  console.log("=== In-Memory Database State ===");
  console.log("Users:", inMemoryDB.user.length);
  console.log("Sessions:", inMemoryDB.session.length);
  console.log("Accounts:", inMemoryDB.account.length);
  console.log("Verifications:", inMemoryDB.verification.length);
}

export function clearDB() {
  inMemoryDB.user = [];
  inMemoryDB.session = [];
  inMemoryDB.account = [];
  inMemoryDB.verification = [];
  console.log("=== Database cleared ===");
}
