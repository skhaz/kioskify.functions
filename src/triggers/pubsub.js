import * as request from "request";

export default function onPubSub({ json: { url, group, video } }, bucket) {
  return new Promise((resolve, reject) => {
    const req = request.get(url);
    req.pause();
    req.on("response", response => {
      const { statusCode } = response;
      if (statusCode !== 200) {
        return reject(new Error(statusCode));
      }

      const filename = `${group}/${video}.mp4`;
      const blob = bucket.file(filename);
      const stream = blob.createWriteStream({
        public: true,
        contentType: "video/mp4"
      });

      req
        .pipe(stream)
        .on("finish", resolve)
        .on("error", error => {
          stream.close();
          reject(error);
        });

      req.resume();
    });

    req.on("error", error => {
      reject(error);
    });
  });
}
