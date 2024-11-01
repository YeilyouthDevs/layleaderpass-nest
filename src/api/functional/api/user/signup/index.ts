/**
 * @packageDocumentation
 * @module api.functional.api.user.signup
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
//================================================================
import type { IConnection, Resolved, Primitive } from "@nestia/fetcher";
import { PlainFetcher } from "@nestia/fetcher/lib/PlainFetcher";

import type { CreateUserDTO } from "../../../../../features/user/dto/create-user.dto";
import type { __type } from "../../../../../features/user/user.controller";

export * as schema from "./schema";

/**
 * @controller UserController.signup
 * @path POST /api/user/signup
 * @nestia Generated by Nestia - https://github.com/samchon/nestia
 */
export async function signup(
  connection: IConnection,
  createUserDTO: signup.Input,
): Promise<signup.Output> {
  return PlainFetcher.fetch(
    {
      ...connection,
      headers: {
        ...connection.headers,
        "Content-Type": "application/json",
      },
    },
    {
      ...signup.METADATA,
      template: signup.METADATA.path,
      path: signup.path(),
    },
    createUserDTO,
  );
}
export namespace signup {
  export type Input = Resolved<CreateUserDTO>;
  export type Output = Primitive<__type>;

  export const METADATA = {
    method: "POST",
    path: "/api/user/signup",
    request: {
      type: "application/json",
      encrypted: false,
    },
    response: {
      type: "application/json",
      encrypted: false,
    },
    status: 201,
  } as const;

  export const path = () => "/api/user/signup";
}