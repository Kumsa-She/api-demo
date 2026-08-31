import { Collection, Db, ObjectId } from 'mongodb';

export type UserRole = 'admin' | 'user';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export const UserCollection = 'users';

export const getUserCollection = (db: Db): Collection<User> =>
  db.collection<User>(UserCollection);
