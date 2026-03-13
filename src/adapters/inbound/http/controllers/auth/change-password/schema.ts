import z from "zod";

export const changePasswordBodySchema = z.object({
  invite_token: z.string().uuid(),
  new_password: z.string(),
})
