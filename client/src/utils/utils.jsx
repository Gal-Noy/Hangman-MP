const sortLobbyUsers = (users) =>
  users.sort((a, b) => {
    if (a._id === JSON.parse(localStorage.getItem("user"))._id) return -1;
    if (a.isActive === b.isActive) {
      return a.name < b.name ? -1 : 1;
    }
    return a.isActive ? -1 : 1;
  });

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

export { b64toBlob, sortLobbyUsers };
