import { handleChat } from '../server/chat'

export const config = { runtime: 'edge' }

export default function handler(request: Request): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  return handleChat(request, ip)
}
