import Link from "next/link";
import AddMediaEntry from "@/components/media/AddMediaEntry";

export default async function DashboardPage() {
  return (
    <div>
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
        <li>
          <AddMediaEntry />
        </li>
      </ul>
    </div>
  );
}
