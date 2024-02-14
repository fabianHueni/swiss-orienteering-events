export default class EventService {
    getEventsFromJSON() {
        return fetch('data/ol_events_2024.json').then(res => res.json());
    }
}
