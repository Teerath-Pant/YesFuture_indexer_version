import LeaderboardPage from '@/components/leaderboard/leaderboard-page'
import PageLayout from '@/layouts/page-layout'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/(protected)/leaderboard')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageLayout>
        <LeaderboardPage/>
    </PageLayout>
  )
}
