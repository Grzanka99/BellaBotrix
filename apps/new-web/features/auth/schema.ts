import { z } from "zod"

/** Port of `apps/web/types/auth.type.ts`. */
export const SDtoUser = z.object({
  username: z.string().min(5).max(20),
  password: z.string().min(5).max(50),
})
export type TDtoUser = z.infer<typeof SDtoUser>

export const SDtoCreateUser = SDtoUser.extend({ regToken: z.string().min(1) })
export type TDtoCreateUser = z.infer<typeof SDtoCreateUser>
