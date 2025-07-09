import { RecordID } from "./main";

export interface User {
  id: RecordID;
  name: string;
  external_id: string;
  created_at: string;
  extra: Record<string, any>;
}

export type CreateOrUpdateUserArgs = Omit<User, "id" | "created_at">;
