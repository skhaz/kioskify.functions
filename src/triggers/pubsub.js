import { get } from "request";
import { lookup } from "mime-types";

export function onPubSub({ json: { container, url, group, video } }, bucket) {
  return new Promise((resolve, reject) => {
    const request = get(url);
    request.pause();
    request.on("response", response => {
      const { statusCode } = response;
      if (statusCode !== 200) {
        return reject(new Error(statusCode));
      }

      const filename = `${group}/${video}.${container}`;
      const blob = bucket.file(filename);
      const contentType = lookup(filename);
      const stream = blob.createWriteStream({ public: true, contentType });

      request
        .pipe(stream)
        .on("finish", resolve)
        .on("error", error => {
          stream.close();
          reject(error);
        });

      request.resume();
    });

    request.on("error", error => {
      reject(error);
    });
  });
}
