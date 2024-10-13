import Papa from 'papaparse';

export default class EventService {
    getEventsFromJSON() {
        return fetch('data/ol_events_2024.json').then(res => res.json());
    }

    getEventsFromSwissOrienteering() {
        const promises = [];
        const files = ["data/events-2024.csv", "data/events-2025.csv"];

        files.forEach(file => {
            promises.push(new Promise((resolve) => {
                Papa.parse(file, {
                    download: true,
                    skipEmptyLines: true,
                    header: true,
                    complete: function (results) {
                        resolve(results.data)
                    }
                });
            }));
        });
        return Promise.all(promises);
    }
}
