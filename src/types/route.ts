import { z } from "zod"

export const routeSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(), // Kolor w formacie hex
  createdAt: z.string(),
  updatedAt: z.string()
})

export type Route = z.infer<typeof routeSchema>