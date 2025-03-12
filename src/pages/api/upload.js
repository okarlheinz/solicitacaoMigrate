import { IncomingForm } from "formidable";
import fs from "fs";
import FTP from "ftp";

export const config = {
  api: {
    bodyParser: false, // Necessário para processar arquivos manualmente
  },
};

export default function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const form = new IncomingForm();

    form.parse(req, (err, fields, files) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao processar o upload." });
      }

      if (!files.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado." });
      }

      const filePath = files.file[0].filepath;
      const fileName = files.file[0].originalFilename;

      const ftpConfig = {
        host: "ftp.mariasmello.com.br",
        user: "implantacao@cdsimplantacao.com.br",
        password: "dificil!@#",
      };

      const client = new FTP();

      client.on("ready", () => {
        fs.readFile(filePath, (err, data) => {
          if (err) {
            client.end();
            return res.status(500).json({ message: "Erro ao ler o arquivo." });
          }

          client.put(data, `/migrate/${fileName}`, (err) => {
            client.end();

            if (err) {
              return res.status(500).json({ message: "Erro ao enviar o arquivo para o FTP." });
            }

            const fileUrl = `https://cdsimplantacao.com.br/migrate/${fileName}`;
            res.status(200).json({ fileUrl });
          });
        });
      });

      client.connect(ftpConfig);
    });
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(405).json({ message: "Método não permitido." });
  }
}
