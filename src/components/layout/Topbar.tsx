import Link from "next/link";
import ScopeChooser from "./ScopeChooser";
import LogoutButton from "./LogoutButton";

type Group = { id: string; name: string };

type Props = {
  user: { id: string; username: string };
  groups: Group[];
};

export default function Topbar({ user, groups }: Props) {
  return (
    <header>
      <Link href="/">Keepsake</Link>
      <ScopeChooser groups={groups} />
      <span>{user.username}</span>
      <LogoutButton />
    </header>
  );
}
