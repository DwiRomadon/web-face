const express = require("express");
const path = require("path");
const { get } = require("request");

const app = express();
const fs = require("fs");
const https = require("https");
const privateKey = fs.readFileSync("./cert/privkey-api.pem");
const certificate = fs.readFileSync("./cert/cert-api.pem");

const credential = { key: privateKey, cert: certificate };
const httpsServer = https.createServer(credential, app);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const viewsDir = path.join(__dirname, "views");
app.use(express.static(viewsDir));
app.use(express.static(path.join(__dirname, "./public")));
app.use(express.static(path.join(__dirname, "./images")));
app.use(express.static(path.join(__dirname, "./weights")));
app.use(express.static(path.join(__dirname, "./dist")));

app.get("/", (req, res) => res.redirect("/webcam_face_recognition"));
app.get("/webcam_face_recognition", (req, res) =>
  res.sendFile(path.join(viewsDir, "webcamFaceRecognition.html"))
);

app.post("/fetch_external_image", async (req, res) => {
  const { imageUrl } = req.body;
  console.log(imageUrl)
  if (!imageUrl) {
    return res.status(400).send("imageUrl param required");
  }
  try {
    const externalResponse = await request(imageUrl);
    res.set("content-type", externalResponse.headers["content-type"]);
    return res.status(202).send(Buffer.from(externalResponse.body));
  } catch (err) {
    return res.status(404).send(err.toString());
  }
});

// httpsServer.listen(5023, () => console.log("Listening on port 5023!"));
app.listen(5023, () => console.log("Listening on port 5023!"));

function request(url, returnBuffer = true, timeout = 10000) {
  return new Promise(function (resolve, reject) {
    const options = Object.assign(
      {},
      {
        url,
        isBuffer: true,
        timeout,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36"
        }
      },
      returnBuffer ? { encoding: null } : {}
    );

    get(options, function (err, res) {
      if (err) return reject(err);
      return resolve(res);
    });
  });
}
