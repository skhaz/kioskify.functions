import * as ytdl from "ytdl-core";

export default async (snapshot, { params: { video } }, topic) => {
  const { group, yid } = snapshot.data();
  const { formats, title, length_seconds } = await ytdl.getInfo(yid);
  const durationInSec = parseInt(length_seconds, 10);
  const filter = format =>
    format.container === "mp4" && format.resolution === "1080p";
  const format = ytdl.chooseFormat(formats, { filter });
  const url = format && format.url;
  const error = url === undefined || url === null;
  const promises = [];

  if (!error) {
    const data = JSON.stringify({ group: group.id, url, video });
    const dataBuffer = Buffer.from(data);
    promises.push(topic.publish(dataBuffer));
  }

  promises.push(snapshot.ref.update({ title, durationInSec, error }));

  return Promise.all(promises);
};
