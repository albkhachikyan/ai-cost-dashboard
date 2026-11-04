import { DashboardView } from '@/views/dashboard';

const ALLOWED_DAYS = [1, 7, 30, 90];
const DEFAULT_DAYS = 1;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function parseDays({ days }: Record<string, string | string[] | undefined>): number {
  const parsed = Number(Array.isArray(days) ? days[0] : days);
  return ALLOWED_DAYS.includes(parsed) ? parsed : DEFAULT_DAYS;
}

// The shell (h1, layout) prerenders; only the sections that await `days` stream in.
export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return <DashboardView days={searchParams.then(parseDays)} />;
}
