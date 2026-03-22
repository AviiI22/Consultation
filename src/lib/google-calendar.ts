import { google } from "googleapis";
import { prisma } from "@/lib/prisma";

/** Resolves the refresh token: DB AppSettings first, then env var as fallback. */
async function getRefreshToken(): Promise<string | null> {
    // Prefer the database token — it is written by the Admin Dashboard OAuth flow
    // and is always the freshest. The env var is only a fallback for initial setup.
    try {
        const row = await prisma.appSettings.findUnique({
            where: { key: "GOOGLE_REFRESH_TOKEN" },
        });
        if (row?.value) return row.value;
    } catch {
        // DB lookup failed — fall through to env var
    }
    return process.env.GOOGLE_REFRESH_TOKEN ?? null;
}

async function getOAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    const refreshToken = await getRefreshToken();
    if (refreshToken) {
        oauth2Client.setCredentials({ refresh_token: refreshToken });
    }

    return oauth2Client;
}

export interface CalendarEventDetails {
    summary: string;
    description: string;
    /** Local datetime string in the format "YYYY-MM-DDTHH:mm:ss" (no Z / no offset).
     *  Google Calendar interprets this as being in `timezone`. */
    startTime: string;
    durationMinutes: number;
    attendeeEmail: string;
    timezone: string;
}

export async function createConsultationEvent(details: CalendarEventDetails): Promise<{
    eventId: string | null | undefined;
    htmlLink: string | null | undefined;
    hangoutLink: string | null | undefined;
} | null> {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
        console.warn("Google Calendar integration skipped: Missing refresh token. Please connect Google Calendar in the Admin Dashboard.");
        return null;
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn("Google Calendar integration skipped: Missing OAuth credentials.");
        return null;
    }

    const oauth2Client = await getOAuthClient();
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Compute end time by adding durationMinutes to the local start time string.
    // We parse the local string as a UTC Date purely for arithmetic, then
    // format it back as a local string — the `timeZone` field on the API call
    // tells Google Calendar how to interpret both strings.
    const startMs = new Date(details.startTime + "Z").getTime();
    const endMs = startMs + details.durationMinutes * 60000;
    const endTime = new Date(endMs).toISOString().replace("Z", "").split(".")[0];
    const hostEmail = process.env.GOOGLE_HOST_EMAIL;

    const attendees: { email: string; organizer?: boolean }[] = [
        { email: details.attendeeEmail },
    ];

    // Add the host/admin as an attendee so they get a calendar invite too
    if (hostEmail && hostEmail !== details.attendeeEmail) {
        attendees.push({ email: hostEmail, organizer: true });
    }

    try {
        const event = await calendar.events.insert({
            calendarId: "primary",
            conferenceDataVersion: 1,
            sendUpdates: "all", // Sends email invites to all attendees
            requestBody: {
                summary: details.summary,
                description: details.description,
                start: {
                    // Local datetime string (no Z) — Google interprets it in `timeZone`
                    dateTime: details.startTime,
                    timeZone: details.timezone,
                },
                end: {
                    dateTime: endTime,
                    timeZone: details.timezone,
                },
                attendees,
                conferenceData: {
                    createRequest: {
                        requestId: `astro_meeting_${Date.now()}`,
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: "email", minutes: 24 * 60 }, // 24 hours before
                        { method: "email", minutes: 60 },       // 1 hour before
                        { method: "popup", minutes: 30 },       // 30 min before
                    ],
                },
            },
        });

        const hangoutLink =
            event.data.hangoutLink ||
            event.data.conferenceData?.entryPoints?.find(
                (ep) => ep.entryPointType === "video"
            )?.uri ||
            null;

        console.log(`✅ Google Meet created: ${hangoutLink}`);

        return {
            eventId: event.data.id,
            htmlLink: event.data.htmlLink,
            hangoutLink,
        };
    } catch (error) {
        console.error("Error creating Google Calendar event:", error);
        throw error;
    }
}

/**
 * Parses a booking's date + time slot into a local datetime string
 * in the format "YYYY-MM-DDTHH:mm:ss" — no timezone offset, no Z.
 *
 * Google Calendar interprets this string as being in the `timezone`
 * field of the event, so passing it directly (without converting to
 * UTC) ensures the meeting is created at exactly the slot the user
 * chose, regardless of the server's own timezone.
 *
 * @param bookingDate  e.g. "2026-03-10"
 * @param bookingTime  e.g. "7:00 PM - 8:00 PM"
 * @returns  e.g. "2026-03-10T19:00:00"  or null if unparseable
 */
export function parseBookingDateTime(
    bookingDate: string,
    bookingTime: string
): string | null {
    // Take the start part of the range, e.g. "7:00 PM"
    const timePart = bookingTime.split(" - ")[0].trim();

    // Parse using a simple regex so we are NOT subject to the server's locale/TZ
    const match = timePart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();

    if (period === "AM") {
        if (hours === 12) hours = 0;          // 12:xx AM → 00:xx
    } else {
        if (hours !== 12) hours += 12;        // 1–11 PM → 13–23
    }

    const hh = String(hours).padStart(2, "0");
    const mm = String(minutes).padStart(2, "0");

    // Return a local time string — intentionally NO "Z" / offset
    return `${bookingDate}T${hh}:${mm}:00`;
}

export async function isGoogleCalendarConfigured(): Promise<boolean> {
    if (
        !process.env.GOOGLE_CLIENT_ID ||
        !process.env.GOOGLE_CLIENT_SECRET
    ) {
        return false;
    }
    const token = await getRefreshToken();
    return !!token;
}
