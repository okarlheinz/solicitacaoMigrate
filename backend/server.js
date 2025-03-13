const express = require("express");
const multer = require("multer");
const FTP = require("ftp");
const path = require("path");
const cors = require("cors"); // Importa o pacote CORS

const app = express();
app.use(cors()); // Adiciona o middleware CORS para permitir todas as origens

const upload = multer();

const ftpConfig = {
  host: "ftp.mariasmello.com.br",
  user: "implantacao@cdsimplantacao.com.br",
  password: "dificil!@#",
};

app.post("/upload", upload.single("file"), (req, res) => {
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
      res.json({ fileUrl });
    });
  });

  client.connect(ftpConfig);
});

// app.listen(3000, () => {
//   console.log("Servidor rodando em http://localhost:3000");
// });

export default app;
