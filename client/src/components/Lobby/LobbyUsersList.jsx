import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { useSelector } from "react-redux";

function LobbyUsersList() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const UserBox = ({ user, error, setError }) => {
    const isOnline = user.isActive;
    const roomData = useSelector((state) => state.clientState.roomData);
    const isAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData?.admin;
    const [isUserInvited, setIsUserInvited] = useState(false);

    const inviteUserToRoom = (invitedUser) => {
      if (roomData.numberOfPlayers === roomData.players.length) {
        setError({ user: invitedUser, message: "Room is full." });
        return;
      }
      sendJsonMessage({
        type: "rooms",
        content: {
          action: "invite",
          data: {
            invitedPlayerId: invitedUser._id,
            roomId: roomData.id,
            password: roomData?.password,
          },
        },
      });
      setIsUserInvited(true);
    };

    return (
      <div>
        <div className="rounded bg-gray-400 m-1 d-flex align-items-center p-2">
          <div className="ms-2">{isOnline ? "🟢" : "🔴"}</div>
          <div className="ms-2 mb-1 fs-5">{user.name}</div>
          {isAdmin && !isUserInvited && (
            <div
              className="ms-2 mb-1 fs-5 align-self-end"
              type="button"
              id="invite-user-to-room"
              onClick={() => inviteUserToRoom(user)}
            >
              ➕
            </div>
          )}
          {isAdmin && isUserInvited && <div className="ms-2 mb-1 fs-5 align-self-end">✔️</div>}
        </div>
        {error && error.user._id === user._id && (
          <div className="alert alert-danger m-1" role="alert">
            {error.message}
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    sendJsonMessage({
      type: "users",
      content: {
        action: "list",
        data: {},
      },
    });
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      const { type, content } = lastJsonMessage;
      if (type === "updateLobbyUsersList") {
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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="bg-gray-400 rounded w-30 ms-1 d-flex flex-column h-570">
      <div className="users-list-header rounded bg-light mt-2 mx-2">
        <p className="text-center pt-2 fs-4 fw-bold text-dark">Lobby</p>
      </div>
      <div className="users-list rounded bg-light m-2 flex-fill d-flex flex-column overflow-auto">
        {users.map((user) => (
          <div key={user._id} className="p-1">
            <UserBox user={user} error={error} setError={setError} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LobbyUsersList;
