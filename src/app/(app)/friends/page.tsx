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

  const requests = await apiServerFetch<FriendRequest[]>(
    "/api/friends/requests",
  );

  return (
    <div>
      <h1>Friends</h1>

      <SendFriendRequest />

      <FriendRequests requests={requests} />

      <FriendList friends={friends} />
    </div>
  );
}
