import multer from "multer";
import FTP from "ftp";
import path from "path";
import cors from "cors";

// Configuração do multer para lidar com upload de arquivos
const upload = multer();

// Configuração do FTP
const ftpConfig = {
  host: "ftp.mariasmello.com.br",
  user: "implantacao@cdsimplantacao.com.br",
  password: "dificil!@#",
};

// Função que será executada na API
export default function handler(req, res) {
  // Habilitando CORS
  cors()(req, res, () => {});

  if (req.method === "POST") {
    // Middleware do multer para processar o arquivo enviado
    upload.single("file")(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: "Erro ao processar o arquivo." });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      const fileName = req.file.originalname;
      const fileExtension = path.extname(fileName);

      const client = new FTP();
      client.on("ready", () => {
        client.put(req.file.buffer, `/migrate/${fileName}`, (err) => {
          if (err) {
            client.end();
            return res.status(500).json({ message: "Erro ao enviar o arquivo." });
          }
          client.end();
          const fileUrl = `https://cdsimplantacao.com.br/migrate/${fileName}`;
          res.status(200).json({ fileUrl });
        });
      });

      client.connect(ftpConfig);
    });
  } else {
    res.status(405).json({ message: "Método não permitido." });
  }
}
