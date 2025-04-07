import { User } from "better-auth/types";
import { TsRestRequest as BaseTsRestRequest } from "@ts-rest/express";
import { AppRouteMutation } from "@ts-rest/core";

declare module "@ts-rest/express" {
  export interface TsRestRequest<T extends AppRouteMutation>
    extends BaseTsRestRequest<T> {
    user: User;
  }
}

// interface RequestWithUser<T extends AppRouteMutation>
//   extends BaseTsRestRequest<T> {
//   user: User;
// }
