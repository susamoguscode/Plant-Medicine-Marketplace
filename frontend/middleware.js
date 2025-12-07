import { NextResponse } from "next/server"

export function middleware(request) {
  const token = request.cookies.get("token")?.value

  if (!token) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/seller/products", "/cart", "/history", "/seller/orders", "/topup", "/admin/users", "/admin/products", "/admin/topups", "/chat/:path*", "/admin/payments"],
}