FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci || npm install

FROM base AS builder
ARG NEXT_PUBLIC_API_URL=""
ARG NEXT_PUBLIC_API_ORIGIN=""
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
ARG NEXT_PUBLIC_SUPABASE_URL=""
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ARG NEXT_PUBLIC_TOTAL_DAYS=""

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_API_ORIGIN=${NEXT_PUBLIC_API_ORIGIN}
ENV NEXT_PUBLIC_GOOGLE_CLIENT_ID=${NEXT_PUBLIC_GOOGLE_CLIENT_ID}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
ENV NEXT_PUBLIC_TOTAL_DAYS=${NEXT_PUBLIC_TOTAL_DAYS}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# ✅ fail-fast biar gak ke-deploy pakai env dev/blank
RUN node -e "const u=process.env.NEXT_PUBLIC_API_URL||''; const o=process.env.NEXT_PUBLIC_API_ORIGIN||''; if(!u||!/^https?:\\/\\//.test(u)) throw new Error('Missing/invalid NEXT_PUBLIC_API_URL'); if(o && !/^https?:\\/\\//.test(o)) throw new Error('Invalid NEXT_PUBLIC_API_ORIGIN');"

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
