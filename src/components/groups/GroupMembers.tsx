type Member = {
  id: string;
  username: string;
  role: string;
};

type Props = {
  members: Member[];
};

export default function GroupMembers({ members }: Props) {
  if (members.length === 0) {
    return (
      <div>
        <h3>Members</h3>
        <p>No members.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Members</h3>

      <ul>
        {members.map((m) => (
          <li key={m.id}>
            {m.username}

            {m.role === "OWNER" && <strong> (Owner)</strong>}
          </li>
        ))}
      </ul>
    </div>
  );
}
