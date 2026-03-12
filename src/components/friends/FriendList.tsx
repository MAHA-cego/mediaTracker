type User = {
  id: string;
  username: string;
};

type Props = {
  friends: User[];
};

export default function FriendList({ friends }: Props) {
  if (friends.length === 0) {
    return (
      <div>
        <h3>Your friends</h3>
        <p>No friends yet.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Your Friends</h3>

      <ul>
        {friends.map((friends) => (
          <li key={friends.id}>{friends.username}</li>
        ))}
      </ul>
    </div>
  );
}
