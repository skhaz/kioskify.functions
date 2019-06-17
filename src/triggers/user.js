export function onUser({ displayName, email, uid }, firestore) {
  return firestore.doc(`users/${uid}`).set({ displayName, email });
}
