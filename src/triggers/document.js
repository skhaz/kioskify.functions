import * as ytdl from "ytdl-core";

export async function onCreate(snapshot, { params: { video } }, topic) {
  const { group, yid } = snapshot.data();
  const { formats, title, length_seconds } = await ytdl.getInfo(yid);
  const durationInSec = parseInt(length_seconds, 10);
  const filter = format =>
    format.container === "mp4" && format.resolution === "1080p";
  const format = ytdl.chooseFormat(formats, { filter });
  const url = format && format.url;
  const error = url === undefined || url === null;
  const { container, encoding, fps, itag, resolution } = format;
  const promises = [];

  if (!error) {
    const data = JSON.stringify({ container, group: group.id, url, video });
    const dataBuffer = Buffer.from(data);
    promises.push(topic.publish(dataBuffer));
  }

  promises.push(
    snapshot.ref.update({
      title,
      durationInSec,
      error,
      meta: {
        container,
        encoding,
        fps,
        itag,
        resolution
      }
    })
  );

  return Promise.all(promises);
}
