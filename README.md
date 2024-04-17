# rank-highlight-webpage

Exploration of using PostgreSQL and Redis to do vector searches to rank and highlight search results

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

This project was deployed as a hobby project on [Vercel](https://vercel.com/). Check it out at the link [https://vercel.com/](https://rank-highlight-webpage.vercel.app/)

## Getting Started

First, run the backend:

```bash
docker compose up --build --detach
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Cleanup the Running

`Ctrl + C` will end the development server. But to end the backend databases, we have to send a custom Docker command:

```bash
docker kill docker-redis-1 docker-postgres-1
docker rm $(docker ps -aq) # remove the container images from local machine
```

The names might be slightly different if you don't clean up often.

## Code

NextJS App router using a `src/` folder.

### Styled Components

-   [ShadCN/ui](https://ui.shadcn.com/)
-   [TailwindCSS](https://tailwindcss.com/)

### Quality

Using [Husky](https://typicode.github.io/husky/) this project enforces code quality and stylizations.

Linting with [ESLint](https://typescript-eslint.io/getting-started) and code styles from [Prettier](https://prettier.io/docs/en/).

### Testing

TODO

Use [Cypress](https://www.cypress.io/) for E2E and component testing with snapshots.

## Learn More

To learn more about Next.js, take a look at the following resources:

-   [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
-   [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
