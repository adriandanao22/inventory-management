// Set environment variables before any test modules are imported
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-for-ci";
