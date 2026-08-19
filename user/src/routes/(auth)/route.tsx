// src/routes/(auth)/route.tsx

import { createFileRoute, Outlet,  } from '@tanstack/react-router'

export const Route = createFileRoute('/(auth)')({
  component:()=> <Outlet/>,
})

  