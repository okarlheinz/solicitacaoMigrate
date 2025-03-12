import { useState } from "react";

function UploadComponent({ onUpload }) {
  const uploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "/api/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();
      if (response.ok && onUpload) {
        onUpload(result.fileUrl);
      } else {
        alert("Erro no upload: " + result.message);
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao conectar com o servidor.");
    }
  };

  return (
    <input
      type="file"
      id="certificado"
      onChange={uploadFile}
      className="form-control"
      accept=".cer,.pfx"
    />
  );
}

export default UploadComponent;
