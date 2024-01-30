import React, { useState, useEffect } from "react";
import { useWebSocketContext } from "../../WebSocketContext";
import { useSelector } from "react-redux";
import { sortUsersList } from "../../utils/utils";
import defaultAvatar from "../../assets/default-avatar.jpg";
import "../../styles/UsersList.scss";

function UsersList() {
  const { lastJsonMessage, sendJsonMessage } = useWebSocketContext();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  const UserBox = ({ user, error, setError }) => {
    const isMe = JSON.parse(localStorage.getItem("user"))._id === user._id;
    const { roomData } = useSelector((state) => state.clientState);
    const isAdmin = JSON.parse(localStorage.getItem("user"))._id === roomData?.admin;
    const [isUserInvited, setIsUserInvited] = useState(false);
    const userAvatar = !user.avatar ? defaultAvatar : user.avatar;

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
            password: roomData?.password,
          },
        },
      });
      setIsUserInvited(true);
    };

    return (
      <div className="user-box">
        <img className="user-box-avatar" src={userAvatar} alt="user-avatar" />
        <div className="user-box-details">
          <div className="user-box-name">{user.name.toUpperCase()}</div>
          <div className="user-box-status">
            {user.inGame && <span className="user-box-ingame-status">IN-GAME</span>}
            {user.inRoom && !user.inGame && <span className="user-box-inroom-status">IN-ROOM</span>}
            {user.isActive && !user.inRoom && !user.inGame && <span className="user-box-isactive-status">ONLINE</span>}
            {!user.isActive && !user.inRoom && !user.inGame && (
              <span className="user-box-isoffline-status">OFFLINE</span>
            )}
          </div>
          {isAdmin && !isUserInvited && (
            <div
              className="user-box-invite-button"
              type="button"
              id="invite-user-to-room"
              onClick={() => inviteUserToRoom(user)}
            >
              INVITE
            </div>
          )}
        </div>
      </div>

      //     {isAdmin && !isUserInvited && (
      //       <div
      //         className="ms-2 mb-1 fs-5 align-self-end"
      //         type="button"
      //         id="invite-user-to-room"
      //         onClick={() => inviteUserToRoom(user)}
      //       >
      //         ➕
      //       </div>
      //     )}
      //     {isAdmin && isUserInvited && <div className="ms-2 mb-1 fs-5 align-self-end">✔️</div>}
      //   </div>
      //   {error && error.user._id === user._id && (
      //     <div className="alert alert-danger m-1" role="alert">
      //       {error.message}
      //     </div>
      //   )}
      // </div>
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
      if (type === "updateUsersList") {
        const { users } = content.data;

        sortUsersList(users);

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
    <div className="users-list-container">
      <div className="users-list-search-bar">
        <span className="material-symbols-outlined">search</span>
        <input type="text" placeholder="Search" />
      </div>
      <div className="users-list">
        {users.map((user) => (
          <UserBox key={user._id} user={user} error={error} setError={setError} />
        ))}
      </div>
    </div>
  );
}

export default UsersList;