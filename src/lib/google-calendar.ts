import { google } from "googleapis";
import { parse, isValid } from "date-fns";

function getOAuthClient() {
    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );

    if (process.env.GOOGLE_REFRESH_TOKEN) {
        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });
    }

    return oauth2Client;
}

export interface CalendarEventDetails {
    summary: string;
    description: string;
    startTime: Date;
    durationMinutes: number;
    attendeeEmail: string;
    timezone: string;
}

export async function createConsultationEvent(details: CalendarEventDetails): Promise<{
    eventId: string | null | undefined;
    htmlLink: string | null | undefined;
    hangoutLink: string | null | undefined;
} | null> {
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
        console.warn("Google Calendar integration skipped: Missing refresh token. Please connect Google Calendar in the Admin Dashboard.");
        return null;
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
        console.warn("Google Calendar integration skipped: Missing OAuth credentials.");
        return null;
    }

    const oauth2Client = getOAuthClient();
    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const endTime = new Date(details.startTime.getTime() + details.durationMinutes * 60000);
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
                    dateTime: details.startTime.toISOString(),
                    timeZone: details.timezone,
                },
                end: {
                    dateTime: endTime.toISOString(),
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
 * Helper to parse a booking's date/time string into a Date object.
 * bookingDate: "2026-03-10", bookingTime: "7:00 PM - 8:00 PM"
 */
export function parseBookingDateTime(
    bookingDate: string,
    bookingTime: string
): Date | null {
    const timePart = bookingTime.split(" - ")[0].trim();
    const fullDateStr = `${bookingDate} ${timePart}`;
    const dateObj = parse(fullDateStr, "yyyy-MM-dd h:mm a", new Date());
    return isValid(dateObj) ? dateObj : null;
}

export function isGoogleCalendarConfigured(): boolean {
    return !!(
        process.env.GOOGLE_CLIENT_ID &&
        process.env.GOOGLE_CLIENT_SECRET &&
        process.env.GOOGLE_REFRESH_TOKEN
    );
}
