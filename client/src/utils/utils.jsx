import "../styles/Dropdown.scss";

const sortUsersList = (users) =>
  users.sort((a, b) => {
    // Sort by active status
    if (a.isActive !== b.isActive) {
      return a.isActive ? -1 : 1;
    }

    // Sort by in room status
    if (a.inRoom !== b.inRoom) {
      return a.inRoom ? -1 : 1;
    }

    // Sort by in game status
    if (a.inGame !== b.inGame) {
      return a.inGame ? -1 : 1;
    }

    // Sort by name
    return a.name.localeCompare(b.name);
  });

const sortPlayersList = (players) =>
  players.sort((a, b) => {
    // Sort by admin status
    if (a.isAdmin !== b.isAdmin) {
      return a.isAdmin ? -1 : 1;
    }

    // Sort by ready status
    if (a.isReady !== b.isReady) {
      return a.isReady ? -1 : 1;
    }

    // Sort by name
    return a.name.localeCompare(b.name);
  });

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
};

const DropdownMenu = ({ contentId, values, stateValue, setFunction }) => (
  <div className="dropdown">
    <button className="dropdown-btn" onMouseEnter={() => document.getElementById(contentId)?.classList.remove("hide")}>
      {stateValue}
    </button>
    <div className="dropdown-content" id={contentId}>
      {values.map((value) => (
        <a
          key={value}
          className="dropdown-item"
          type="button"
          onClick={() => {
            setFunction(value);
            document.getElementById(contentId)?.classList.add("hide");
          }}
        >
          {value}
        </a>
      ))}
    </div>
  </div>
);

export { convertToBase64, b64toBlob, sortUsersList, sortPlayersList, DropdownMenu };
