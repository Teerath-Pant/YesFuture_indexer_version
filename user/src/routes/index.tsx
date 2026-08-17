import ComingSoon from "@/components/comings-soon";
import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/")({
  // beforeLoad: () => {
  //   const isAuth = true
  //   if (!isAuth) {
  //     throw redirect({
  //       to: "/sign-in",
  //     });
  //   }
  //   throw redirect({
  //     to:"/dashboard"
  //   })
  // },
  component: () => <ComingSoon />
});
