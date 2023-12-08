export type WatchParty = {
  PK: string;
  SK: string;
  geohash: string;
  eventId: string;
  name: string;
  startDateTime: number;
  placeId: string;
  amenities: string[];
  price: number;
  hostEmail: string;
};

export type Attendence = {
  PK: string;
  SK: string;
  attendeeEmail: string;
  eventId: string;
};

export type User = {
  email: string;
  name: string;
  password: string;
};
