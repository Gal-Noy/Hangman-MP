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


export { convertToBase64, b64toBlob, sortUsersList,  };
