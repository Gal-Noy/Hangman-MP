import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import axios from "axios";

const UserBox = ({ user }) => {
  const isOnline = user.isActive;

  return (
    <div className="rounded bg-gray-400 m-1 d-flex align-items-center p-2">
      <div className="ms-2">{isOnline ? "🟢" : "🔴"}</div>
      <div className="ms-2 mb-1 fs-5">{user.name}</div>
    </div>
  );
};

function UsersList() {
  const { lastJsonMessage } = useWebSocketContext();
  const [users, setUsers] = useState([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_SERVER_URL}/api/users/list`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      })
      .then((res) => {
        if (res.status === 200) {
          const users = res.data;
          users.sort((a, b) => {
            if (a.isActive === b.isActive) {
              return a.name < b.name ? -1 : 1;
            }
            return a.isActive ? -1 : 1;
          });
          setUsers(users);
        } else {
          throw new Error("Could not fetch data");
        }
      })
      .then(() => setIsPending(false))
      .catch((err) => {
        console.error("Error fetching users:", err);
        setIsPending(false);
        setError("Could not fetch data.");
      });
  }, [isPending]);

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateUsersList") {
        const { users } = content.data;
        users.sort((a, b) => {
          if (a.isActive === b.isActive) {
            return a.name < b.name ? -1 : 1;
          }
          return a.isActive ? -1 : 1;
        });
        setUsers(users);
      }
    }
  }, [lastJsonMessage]);

  return (
    <div className="bg-gray-400 rounded w-25 ms-1 d-flex flex-column h-570">
      <div className="users-list-header rounded bg-light mt-2 mx-2">
        <p className="text-center pt-2 fs-4 fw-bold text-dark">Users</p>
      </div>
      <div className="users-list rounded bg-light m-2 flex-fill d-flex flex-column overflow-auto">
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        {!error && isPending && <p>Loading...</p>}
        {!error &&
          users.map((user) => (
            <div key={user._id} className="p-1">
              <UserBox user={user} />
            </div>
          ))}
      </div>
    </div>
  );
}

export default UsersList;
