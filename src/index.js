import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
const { PubSub } = require("@google-cloud/pubsub");
import * as triggers from "./triggers";

admin.initializeApp();
const firestore = admin.firestore();
const messaging = admin.messaging();
const storage = admin.storage();
const settings = functions.config().self;
const pubsub = new PubSub();

exports.onCreate = functions.firestore
  .document("videos/{video}")
  .onCreate((snapshot, context) =>
    triggers.onCreate(snapshot, context, pubsub.topic(settings.topic))
  );

exports.onPubSub = functions
  .runWith({ timeoutSeconds: 540, memory: "2GB" })
  .pubsub.topic(settings.topic)
  .onPublish(payload =>
    triggers.onPubSub(payload, storage.bucket(settings.bucket))
  );

exports.onStorage = functions.storage
  .bucket(settings.bucket)
  .object()
  .onFinalize(object => triggers.onStorage(object, firestore, messaging));

exports.onUserSignup = functions.auth
  .user()
  .onCreate(user => triggers.onUser(user, firestore));
