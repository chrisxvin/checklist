export function toPOJO<T extends MongoDocument>(data: T): T;
export function toPOJO<T extends MongoDocument>(data: T[]): T[];
export function toPOJO<T extends MongoDocument>(data: T | T[]): T | T[] {
    const conv = (o: T) => ({
        ...o,
        _id: o._id.toString(),
    });

    return Array.isArray(data) ? data.map(conv) : conv(data);
}
