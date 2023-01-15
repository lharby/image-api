const fs = require('fs');
const fsExtra = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const fetch = require('node-fetch');

const errorFile = path.join(process.cwd(), 'src', 'log', 'errors.txt');
const errorStream = fs.createWriteStream(errorFile, { flags: 'a' });

let images = [];
const iterations = 4;

const getImages = () => {
  for (let i = 0; i <= iterations; i++) {
    axios
      .get('https://dog.ceo/api/breeds/image/random')
      .then((result) => {
        images.push(result.data.message);
        if (i === iterations) {
          cleanDirectory();
          callback();
        }
      })
      .then((res) => {})
      .catch((err) => {
        if (err) {
          console.log(err);
          errorStream.write(`${today}. Error reading from getImages, error: ${err} \n`);
          errorStream.end();
        }
        if (i === iterations) {
          getRandomSavedImage();
        }
      });
  }
};

const callback = () => {
  const rndNum = Math.floor(Math.random() * images.length);
  const singleImage = images[rndNum];
  downloadFile(singleImage, './img/output.jpg');
  images.splice(rndNum, 1);
  downLoadimages();
};

const downloadFile = async (url, path) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  fs.writeFile(path, buffer, (err) => {
    if (err) {
      console.log(err);
      errorStream.write(`${today}. Error reading from downloadFile, error: ${err} \n`);
      errorStream.end();
    }
    console.log('Success');
  });
}

const fileCallback = () => {
  console.log(`files downloaded`);
};

const downLoadimages = () => {
  const allImages = images.map((item) => {
    const fileName = uuidv4() + '.jpg';
    return downloadFile(item, './img-archive/' + fileName);
  });
  Promise.all(allImages).then(() => {
    fileCallback();
  })
};

const getRandomSavedImage = () => {
  cleanDirectory();
  fs.readdir('./img-archive/', (err, files) => {
    if (err) {
      console.log(`Error reading random image from archive: ${err}`);
      errorStream.write(`${today}. Error reading from getRandomSavedImage, error: ${err} \n`);
      errorStream.end();
    } else {
      const rndNum = Math.floor(Math.random() * files.length);
      const singleImage = files[rndNum];
      errorStream.write(`${today}. Success! file saved \n`);
      errorStream.end();
      fsExtra.move(
        './img-archive/' + singleImage,
        './img/' + singleImage,
        function (err) {
          if (err) {
            console.error('err: ', err);
          } else {
            console.log(`src files copied`);
          }
        }
      );
    }
  });
};

const cleanDirectory = () => {
  fsExtra.emptyDirSync('./img/');
};

getImages();
