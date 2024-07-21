import { router } from "../trpc";
import { trackRouter } from "./track";

export const appRouter = router({
  track: trackRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
