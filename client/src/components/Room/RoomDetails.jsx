function RoomDetails(props) {
  const {
    roomData,
    isRoomAdmin,
    modifyRoom,
    modifyRoomData,
    setModifyRoomData,
    showChangeName,
    setShowChangeName,
    showChangePassword,
    setShowChangePassword,
    showPasswordLengthError,
    setShowPasswordLengthError,
  } = props;

  return (
    <div className="room-info-room-details">
      {/* Name Section */}
      {!isRoomAdmin ? (
        <div className="room-info-room-name">
          <span className="room-name-value">{roomData.name}</span>
        </div>
      ) : !showChangeName ? (
        <div className="room-info-room-name">
          <span className="room-name-value">{roomData.name}</span>
          <span
            className="material-symbols-outlined room-info-room-name-edit-button"
            onClick={() => setShowChangeName(true)}
          >
            edit
          </span>
        </div>
      ) : (
        <div className="room-info-room-name">
          <input
            className="room-info-room-name-change-name-input"
            type="text"
            value={modifyRoomData.newName || roomData.name}
            onChange={(e) => {
              setModifyRoomData({ ...modifyRoomData, newName: e.target.value });
            }}
          />
          <span
            className="material-symbols-outlined room-info-room-name-accept-button"
            onClick={() => {
              setShowChangeName(false);
              modifyRoom();
            }}
          >
            done
          </span>
        </div>
      )}

      {/* Password Section */}
      {!isRoomAdmin ? (
        <div className="room-info-room-privacy-container">
          {!roomData.isPrivate && <span className="room-privacy-title">PUBLIC</span>}
          {roomData.isPrivate && (
            <div className="room-info-room-privacy">
              <span className="room-privacy-title">PASSWORD:</span>
              <span className="room-password-value">{roomData.password}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="room-info-room-privacy-container">
          {!showChangePassword && (
            <div className="room-info-room-privacy">
              <span className="room-privacy-title">{roomData.isPrivate ? "PASSWORD: " : "PUBLIC "}</span>
              <span className="room-password-value">{roomData.isPrivate ? roomData.password : ""}</span>
              <span
                className="material-symbols-outlined room-info-room-password-edit-button"
                onClick={() => {
                  setShowChangePassword(true);
                  setShowPasswordLengthError(false);
                }}
              >
                edit
              </span>
              {roomData.isPrivate && (
                <span
                  className="material-symbols-outlined room-info-room-public-button"
                  onClick={() => {
                    setModifyRoomData({
                      ...modifyRoomData,
                      newPassword: "",
                      isPrivate: false,
                    });
                    modifyRoom();
                  }}
                >
                  close
                </span>
              )}
              {showPasswordLengthError && <span className="room-password-length-error">Min 4 letters.</span>}
            </div>
          )}
          {showChangePassword && (
            <div className="room-info-room-privacy">
              <span className="room-privacy-title">PASSWORD:</span>
              <input
                className="room-info-room-password-change-password-input"
                type="text"
                value={modifyRoomData.newPassword || roomData.password}
                onChange={(e) => {
                  setModifyRoomData({
                    ...modifyRoomData,
                    newPassword: e.target.value,
                    isPrivate: true,
                  });
                }}
              />
              <span
                className="material-symbols-outlined room-info-room-password-accept-button"
                onClick={() => {
                  setShowChangePassword(false);
                  modifyRoom();
                }}
              >
                done
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default RoomDetails;
