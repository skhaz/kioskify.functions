export function onUser({ displayName, email, uid }, firestore) {
  return firestore
    .doc(`users/${uid}`)
    .update({ displayName, email }, { merge: true });
}
