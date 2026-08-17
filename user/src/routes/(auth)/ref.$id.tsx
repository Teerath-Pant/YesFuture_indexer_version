import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)/ref/$id')({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/sign-up",
      search: {
        ref: params.id,
      },
      replace: true,
    });
  },
})
