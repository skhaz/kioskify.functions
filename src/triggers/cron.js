export async function onRetry(context, firestore, topic) {
  const query = await store
    .collection("purgatory")
    .where("attempts", "==", 0)
    .get();

  const batch = firestore.batch();
  query.forEach(document => batch.delete(document.ref));
  await batch.commit();

  await firestore.runTransaction(async transaction => {
    const snapshot = await transaction.get(
      firestore
        .collection("purgatory")
        .where("inProgress", "==", false)
        .where("attempts", ">", 0)
    );

    snapshot.forEach(document => {
      const attempts = document.data().attempts - 1;
      const inProgress = !!attempts;
      transaction.update(document.ref, { inProgress, attempts });
    });

    // ...
  });
}
