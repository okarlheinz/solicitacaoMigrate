import multer from "multer";
import path from "path";
import cors from "cors";

const upload = multer();

const ftpConfig = {
  host: "ftp.mariasmello.com.br",
  user: "implantacao@cdsimplantacao.com.br",
  password: "dificil!@#",
};

export default async function handler(req, res) {
  // Habilitando CORS
  await cors()(req, res, () => {});

  if (req.method === "POST") {
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: "Erro ao processar o arquivo." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      const fileName = req.file.originalname;
      const fileExtension = path.extname(fileName);

      // Processamento do arquivo (exemplo: upload via FTP ou local)
      res.status(200).json({ message: "Arquivo enviado com sucesso." });
    });
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}
