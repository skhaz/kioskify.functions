import * as request from "request";

export function onPubSub({ json: { url, group, video } }, bucket) {
  return new Promise((resolve, reject) => {
    const req = request.get(url);
    req.pause();
    req.on("response", response => {
      const { statusCode } = response;
      if (statusCode !== 200) {
        return reject(new Error(statusCode));
      }

      const filename = `${group}/${video}.mp4`;
      const contentType = mime.lookup(filename);
      const stream = bucket.file(filename).createWriteStream({ public: true, contentType });

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
