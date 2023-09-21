const ics = require('ics');
import { saveAs } from "file-saver";

export default class iCalendarService {

    /**
     * Generates the ics string from the given events
     *
     * @param events to generate ics file from
     */
    generateICalFile(events) {
        const icalEvents = events.map(event => {
            const endDate = event.date;
            endDate.setDate(endDate.getDate() + 1)

            return {
            start: [event.date.getFullYear(), event.date.getMonth() + 1, event.date.getDate()],
            end: [endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate()],
            title: event.event_name,
            location: event.location,
            // url: event.event_link? event.event_link: null

            // Organizer does not work with Google Calendar
            /*organizer: {
                name: event.club
            }*/
        }});

        ics.createEvents(icalEvents, (error, value) => {
            this.exportICalFile(value)
        })
    }

    /**
     * Export the icsString to an ics file and download it to the users device
     *
     * @param icsString string with events to export
     */
    exportICalFile(icsString) {
        const blob = new Blob([icsString], { type: "text/plain;charset=utf-8" });
        saveAs(blob, "event-schedule.ics");
    }
}
