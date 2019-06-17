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
  const promises = [];

  promises.push(snapshot.ref.update({ durationInSec, error, title }));

  if (!error) {
    const dataBuffer = Buffer.from(
      JSON.stringify({
        container: format.container || "mp4",
        group: group.id,
        url,
        video
      })
    );

    promises.push(topic.publish(dataBuffer));
  }

  return Promise.all(promises);
}
