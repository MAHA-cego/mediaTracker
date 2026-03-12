import Link from "next/link";

export default async function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      <ul>
        <li>
          <Link href="/media">Your Media</Link>
        </li>

        <li>
          <Link href="/groups">Groups</Link>
        </li>

        <li>
          <Link href="/friends">Friends</Link>
        </li>
      </ul>
    </div>
  );
}
