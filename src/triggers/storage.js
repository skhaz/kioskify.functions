import { parse } from "path";

export function onStorage({ bucket, contentType, name }, firestore, messaging) {
  if (!contentType.startsWith("video/")) {
    return;
  }

  const { name: video, dir: group } = parse(name);
  const url = `https://${bucket}/${name}`;
  const topic = `/topics/${group}`;
  const videoRef = firestore.doc(`videos/${video}`);

  const p1 = videoRef.update({ ready: true, url });

  const p2 = firestore
    .collection("v1")
    .where("video", "==", videoRef)
    .get()
    .then(documents => {
      const batch = firestore.batch();
      documents.forEach(document =>
        batch.update(document.ref, { enabled: true })
      );
      return batch.commit();
    });

  const p3 = messaging.sendToTopic(topic, { data: { url } });

  return [p1, p2, p3].reduce((p, fn) => p.then(fn), Promise.resolve());
}
