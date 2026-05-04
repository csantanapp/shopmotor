export async function register() {
  // Validate all required environment variables at server startup.
  // Import triggers the Zod schema check — throws with a clear message if anything is missing.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/env");
  }
}
