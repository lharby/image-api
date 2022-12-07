import fs from "fs";
import fsExtra from "fs-extra";
import client from "https";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

let images = [];
const iterations = 4;

const getImages = () => {
  for (let i = 0; i <= iterations; i++) {
    axios
      .get("https://dog.ceo/api/breeds/image/random")
      .then((result) => {
        images.push(result.data.message);
        if (i === iterations) {
          cleanDirectory();
          callback();
        }
      })
      .then((res) => {})
      .catch((err) => {
        console.log(err);
        if (i === iterations) {
          getRandomSavedImage();
        }
      });
  }
};

const callback = () => {
  console.log("images before", images, images.length);
  const rndNum = Math.floor(Math.random() * images.length);
  const singleImage = images[rndNum];
  downloadImage(singleImage, "./img/output.jpg");
  images.splice(rndNum, 1);
  console.log("images after: ", images, images.length);
  downLoadimages();
};

function downloadImage(url, filepath, cb) {
  client.get(url, (res) => {
    res.pipe(fs.createWriteStream(filepath));
    res.on('finish', function() {
      console.log('download images finished call');
      res.close(cb);
    });
    res.on(`error`, (e) => {
      console.log(`Error fetching images ${err}`);
      reject(e);
    });
  });
}

const fileCallback = () => {
  console.log(`files downloaded`);
};

const downLoadimages = () => {
  images.forEach((item) => {
    const fileName = uuidv4() + ".jpg";
    return downloadImage(item, "./img-archive/" + fileName, fileCallback);
  });
};

const getRandomSavedImage = () => {
  cleanDirectory();
  fs.readdir("./img-archive/", (err, files) => {
    if (err) {
      console.log(`Error reading random image from archive: ${err}`);
    } else {
      const rndNum = Math.floor(Math.random() * files.length);
      const singleImage = files[rndNum];
      fsExtra.move(
        "./img-archive/" + singleImage,
        "./img/" + singleImage,
        function (err) {
          if (err) {
            console.error("err: ", err);
          } else {
            console.log(`src files copied`);
          }
        }
      );
    }
  });
};

const cleanDirectory = () => {
  fsExtra.emptyDirSync("./img/");
};

getImages();
