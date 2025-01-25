export interface TextFile {
  value: string | ArrayBuffer | null;
  file_input?: File;
}

export const downloadAsFile = (
  name: string = Math.floor(new Date().getTime() / 360000) + '.json',
  body: string = '',
  fileType = 'text/plain'
) => {
  try {
    const textToSaveAsBlob = new Blob([body], {type: fileType});
    const textToSaveAsURL = URL.createObjectURL(textToSaveAsBlob);
    const fileNameToSaveAs = name;

    const downloadLink = document.createElement('a');
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = 'Download As File';
    downloadLink.href = textToSaveAsURL;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);

    downloadLink.click();
    downloadLink.outerHTML = '';
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error(e.message);
    }
  }
};

export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    if (file) {
      const reader = new FileReader();

      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };

      // Convert the file to a data URL
      reader.readAsDataURL(file);
    }
  });
};

export const uploadFileInputAsText = (
  file: Blob
): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = function (e: ProgressEvent<FileReader>): void {
      if (e?.target) {
        return resolve(e.target.result);
      }
      resolve(reader.result);
    };
    reader.readAsText(file);
    reader.onerror = function (error): void {
      console.log('Error: ', error);
    };
  });
};

export const readTextFile = (
  accept = 'application/json'
): Promise<TextFile> => {
  return new Promise((resolve) => {
    const fileInput = document.createElement('input');
    fileInput.classList.add('readTextFile');
    fileInput.setAttribute('type', 'file');
    if (accept) {
      fileInput.setAttribute('accept', accept);
    }
    fileInput.onchange = async function (): Promise<void> {
      const formData: TextFile = {
        value: '',
      };
      const files = fileInput.files as FileList;
      if (files?.length) {
        formData.value = await uploadFileInputAsText(files[0]);
        formData.file_input = files[0];
      }
      fileInput.outerHTML = '';
      resolve(formData);
    };
    document.body.appendChild(fileInput);
    fileInput.click();
  });
};

export const readJSONFile = async (): Promise<object | null> => {
  const file = await readTextFile();
  if (!file?.value || typeof file.value !== 'string') {
    return null;
  }

  let json: object | null = null;

  try {
    json = JSON.parse(file.value);
  } catch (err) {
    console.error(err);
  }

  if (!json) {
    return null;
  }

  return json;
};
