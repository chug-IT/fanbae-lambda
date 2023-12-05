export type WatchParty = {
  geohash: string;
  partyId: string;
  name: string;
  startDateTime: number;
  placeId: string;
  amenities: string[];
  price: number;
  hostEmail: string;
};

export type User = {
  email: string;
  name: string;
  password: string;
};
