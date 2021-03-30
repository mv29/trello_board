import Dexie from 'dexie'

const db = new Dexie('DashboardDb');

export function initialize() {
    db.version(4).stores({ 
        lists: "++id,title",
        cards: "++id,title,description,listId"
    });
}
export default db;