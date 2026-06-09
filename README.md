# JBD Digital Commerce

Production-oriented commerce platform for the JBD powder drink ecosystem.

## Supabase Setup

1. Copy `.env.example` to `.env.local`.
2. Configure the Supabase URL, publishable key, IPv4 Supavisor session-pooler `DATABASE_URL`, server-only `SUPABASE_SECRET_KEY`, and `JBD_AUTH_SECRET`.
3. Apply schema changes with `npm run db:migrate`.
4. Run `npm run build` and `npm run start`.

Images and videos are stored in the public `commerce-media` bucket. Metadata, products, inventory, recipes, and the remaining commerce entities live in PostgreSQL. Upload writes only run through the server-side Admin route; the Supabase secret key must never use a `NEXT_PUBLIC_` prefix.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
