// /pages/api/upload.js

import multer from "multer";
import path from "path";

// Definindo a pasta onde os arquivos serão temporariamente armazenados
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default function handler(req, res) {
  if (req.method === "POST") {
    // Usando o multer para lidar com o arquivo enviado
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(500).json({ error: "Erro ao processar o arquivo" });
      }

      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo foi enviado" });
      }

      // Aqui você pode processar o arquivo ou realizar qualquer outra operação
      // Por exemplo, salvar no FTP ou no sistema de arquivos

      return res.status(200).json({
        message: "Arquivo recebido com sucesso!",
        fileName: req.file.originalname,
      });
    });
  } else {
    return res.status(405).json({ error: "Método não permitido." });
  }
}
