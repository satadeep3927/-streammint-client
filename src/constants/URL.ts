import { URLBuilder } from "../types/main";

export const URL: URLBuilder = {
  WS: (base, userID, token) => `${base}/v1/pulse/${userID}/ws?token=${token}`,
};
