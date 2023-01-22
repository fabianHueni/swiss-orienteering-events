export default class EventService {
    getEventsFromJSON() {
        return fetch('data/ol_events_2023.json').then(res => res.json());
    }
}