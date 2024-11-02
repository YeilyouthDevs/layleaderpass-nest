import type { Format } from "typia/lib/tags/Format";

export type CreateUserDTO = {
  email: string;
  password: string;
  name: string;
  birthday: string & Format<"date-time">;
};
