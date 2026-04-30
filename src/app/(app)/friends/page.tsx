import { apiServerFetch } from "@/lib/api-server";
import FriendList from "@/components/friends/FriendList";
import FriendRequests from "@/components/friends/FriendRequests";
import SendFriendRequest from "@/components/friends/SendFriendRequest";

type User = {
  id: string;
  username: string;
};

type FriendRequest = {
  id: string;
  requester: User;
};

export default async function FriendsPage() {
  const friends = await apiServerFetch<User[]>("/api/friends");
  const requests = await apiServerFetch<FriendRequest[]>("/api/friends/requests");

  return (
    <div>
      <h1>My Friends</h1>
      <SendFriendRequest />

      <div style={{ display: "flex", gap: "32px", marginTop: "16px" }}>
        <div style={{ flex: 1 }}>
          <h2>Friends</h2>
          <FriendList friends={friends} />
        </div>

        <div style={{ flex: 1 }}>
          <h2>Requests</h2>
          <FriendRequests requests={requests} />
        </div>
      </div>
    </div>
  );
}
