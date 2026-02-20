import { google } from "googleapis";
import { format } from "date-fns";

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

// Note: To use this in production, the admin needs to have stored their refresh token
// in the database or environment after a one-time OAuth consent flow.
if (process.env.GOOGLE_REFRESH_TOKEN) {
    oauth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
}

const calendar = google.calendar({ version: "v3", auth: oauth2Client });

export interface CalendarEventDetails {
    summary: string;
    description: string;
    startTime: Date;
    durationMinutes: number;
    attendeeEmail: string;
    timezone: string;
}

export async function createConsultationEvent(details: CalendarEventDetails) {
    if (!process.env.GOOGLE_REFRESH_TOKEN) {
        console.warn("Google Calendar integration skipped: Missing refresh token.");
        return null;
    }

    const endTime = new Date(details.startTime.getTime() + details.durationMinutes * 60000);

    try {
        const event = await calendar.events.insert({
            calendarId: "primary",
            conferenceDataVersion: 1,
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
                attendees: [{ email: details.attendeeEmail }],
                conferenceData: {
                    createRequest: {
                        requestId: `meeting_${Date.now()}`,
                        conferenceSolutionKey: { type: "hangoutsMeet" },
                    },
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: "email", minutes: 24 * 60 },
                        { method: "popup", minutes: 30 },
                    ],
                },
            },
        });

        return {
            eventId: event.data.id,
            htmlLink: event.data.htmlLink,
            hangoutLink: event.data.hangoutLink,
        };
    } catch (error) {
        console.error("Error creating Google Calendar event:", error);
        throw error;
    }
}
