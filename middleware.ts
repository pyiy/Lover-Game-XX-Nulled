import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/lobby/:path*",
    "/themes/:path*",
    "/profile/:path*",
    "/game/:path*",
  ],
};
