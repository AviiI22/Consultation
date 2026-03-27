/**
 * Centralized error logging helper.
 * Provides structured error output that's easy to search in logs.
 * Can be swapped with Sentry or another provider later by updating this file.
 */

interface ErrorContext {
    /** Human-readable label for the error location, e.g. "POST /api/bookings" */
    route: string;
    /** Optional extra data to include in the log */
    meta?: Record<string, unknown>;
}

/**
 * Log an error in a structured format.
 * Returns a generic, safe error message suitable for sending to the client.
 */
export function logError(error: unknown, ctx: ErrorContext): string {
    const timestamp = new Date().toISOString();
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    console.error(JSON.stringify({
        level: "error",
        timestamp,
        route: ctx.route,
        message,
        stack,
        ...ctx.meta,
    }));

    // Return a safe, generic message — never expose internals
    return "Something went wrong. Please try again later.";
}
