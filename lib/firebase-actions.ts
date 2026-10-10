/**
 * All data access for SharpBill lives here. Every document is scoped under
 * `users/{uid}` so the Firestore rules in `firestore.rules` can lock each
 * account to its owner.
 *
 *   users/{uid}                      -> UserProfile
 *   users/{uid}/clients/{clientId}   -> Client
 *   users/{uid}/invoices/{invoiceId} -> Invoice
 */
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type DocumentData,
  type Timestamp,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref as storageRef, uploadBytes } from "firebase/storage";
import { firebaseAuth, firebaseStorage, firestore, googleProvider } from "./firebase";
import { EMPTY_BANK, EMPTY_BUSINESS } from "./constants";
import { computeTotals, formatInvoiceNumber } from "./invoice-utils";
import type {
  BusinessProfile,
  Client,
  ClientInput,
  EmailJsSettings,
  Invoice,
  InvoiceDraft,
  PaymentSettings,
  StoredStatus,
  UserProfile,
} from "./types";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

const userRef = (uid: string) => doc(firestore(), "users", uid);
const clientsCol = (uid: string) => collection(firestore(), "users", uid, "clients");
const invoicesCol = (uid: string) => collection(firestore(), "users", uid, "invoices");

/** In live listeners, a server timestamp that hasn't been confirmed yet reads as an estimate instead of null. */
const LIVE = { serverTimestamps: "estimate" } as const;

/** Converts Firestore Timestamps to epoch millis so components only deal with numbers. */
function normalize<T>(id: string, data: DocumentData): T {
  const out: DocumentData = { id, ...data };
  for (const key of Object.keys(out)) {
    const v = out[key] as Timestamp | unknown;
    if (v && typeof v === "object" && "toMillis" in (v as Timestamp)) out[key] = (v as Timestamp).toMillis();
  }
  return out as T;
}

function requireUid() {
  const uid = firebaseAuth().currentUser?.uid;
  if (!uid) throw new Error("You need to be signed in.");
  return uid;
}

/* ------------------------------------------------------------------ */
/* auth                                                                */
/* ------------------------------------------------------------------ */

function defaultProfile(user: User, username?: string): Omit<UserProfile, "createdAt"> {
  return {
    uid: user.uid,
    username: username || user.displayName || user.email?.split("@")[0] || "",
    email: user.email || "",
    business: { ...EMPTY_BUSINESS, email: user.email || "" },
    payment: { default: "link", link: "", bank: EMPTY_BANK },
    emailjs: { serviceId: "", templateId: "", publicKey: "" },
    invoicePrefix: "INV-",
    invoiceCounter: 0,
    defaultDueDays: 14,
    setupComplete: false,
  };
}

/** Creates the profile document on first sign-in; returns the stored profile. */
async function ensureProfile(user: User, username?: string) {
  const ref = userRef(user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return normalize<UserProfile>(user.uid, snap.data());
  const profile = defaultProfile(user, username);
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() });
  return profile as UserProfile;
}

export async function signInWithGoogle() {
  const cred = await signInWithPopup(firebaseAuth(), googleProvider);
  return ensureProfile(cred.user);
}

export async function registerWithEmail(username: string, email: string, password: string) {
  const cred = await createUserWithEmailAndPassword(firebaseAuth(), email, password);
  await updateProfile(cred.user, { displayName: username });
  return ensureProfile(cred.user, username);
}

export async function loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(firebaseAuth(), email, password);
  return ensureProfile(cred.user);
}

export function resetPassword(email: string) {
  return sendPasswordResetEmail(firebaseAuth(), email);
}

export function logout() {
  return signOut(firebaseAuth());
}

export function watchAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth(), cb);
}

/** Human-readable messages for common Firebase auth errors. */
export function authErrorMessage(err: unknown) {
  const code = (err as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-credential": "That email and password don’t match.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "That email and password don’t match.",
    "auth/email-already-in-use": "An account already exists with that email.",
    "auth/weak-password": "Use at least 8 characters for your password.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/too-many-requests": "Too many attempts. Try again in a moment.",
  };
  return map[code] || (err as Error)?.message || "Something went wrong.";
}

/* ------------------------------------------------------------------ */
/* profile & settings                                                  */
/* ------------------------------------------------------------------ */

/**
 * A listener that fails (offline for too long, signed out mid-session, rules not deployed) reports
 * `fallback` instead of leaving the page on its loading spinner forever.
 */
const onListenError = <T,>(what: string, cb: (value: T) => void, fallback: T) => (err: Error) => {
  console.error(`SharpBill: could not load ${what}.`, err);
  cb(fallback);
};

export function watchProfile(uid: string, cb: (p: UserProfile | null) => void) {
  return onSnapshot(userRef(uid), (snap) => cb(snap.exists() ? normalize<UserProfile>(uid, snap.data(LIVE)) : null), onListenError("your profile", cb, null));
}

export async function saveBusinessProfile(business: BusinessProfile, completeSetup = false) {
  const uid = requireUid();
  await updateDoc(userRef(uid), { business, ...(completeSetup ? { setupComplete: true } : {}) });
}

const logoRef = (uid: string) => storageRef(firebaseStorage(), `users/${uid}/logo.png`);

/** Uploads the business logo to Firebase Storage (users/{uid}/logo.png) and returns its download URL. */
export async function uploadBusinessLogo(blob: Blob) {
  const ref = logoRef(requireUid());
  await uploadBytes(ref, blob, { contentType: "image/png", cacheControl: "public, max-age=3600" });
  return getDownloadURL(ref);
}

/** Removes the logo file from Storage. A missing file is not an error. */
export async function deleteBusinessLogo() {
  try {
    await deleteObject(logoRef(requireUid()));
  } catch (e) {
    if ((e as { code?: string }).code !== "storage/object-not-found") throw e;
  }
}

const invoicePdfRef = (uid: string, invoiceId: string) => storageRef(firebaseStorage(), `users/${uid}/invoices/${invoiceId}.pdf`);

/**
 * Stores an invoice's PDF (users/{uid}/invoices/{id}.pdf) and returns a link that downloads it —
 * used by the "Download invoice" button in the email. Re-sending replaces the file.
 */
export async function uploadInvoicePdf(invoiceId: string, fileName: string, blob: Blob) {
  const ref = invoicePdfRef(requireUid(), invoiceId);
  await uploadBytes(ref, blob, {
    contentType: "application/pdf",
    contentDisposition: `attachment; filename="${fileName.replace(/[^\w.-]+/g, "_")}.pdf"`,
    cacheControl: "private, max-age=0",
  });
  return getDownloadURL(ref);
}

export async function saveInvoiceSettings(settings: Pick<UserProfile, "invoicePrefix" | "defaultDueDays">) {
  await updateDoc(userRef(requireUid()), settings);
}

export async function savePaymentSettings(payment: PaymentSettings) {
  await updateDoc(userRef(requireUid()), { payment });
}

export async function saveEmailJsSettings(emailjs: EmailJsSettings) {
  await updateDoc(userRef(requireUid()), { emailjs });
}

/* ------------------------------------------------------------------ */
/* clients                                                             */
/* ------------------------------------------------------------------ */

export function watchClients(uid: string, cb: (clients: Client[]) => void) {
  const q = query(clientsCol(uid), orderBy("name"));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => normalize<Client>(d.id, d.data(LIVE)))), onListenError("clients", cb, []));
}

export function watchClient(uid: string, id: string, cb: (client: Client | null) => void) {
  return onSnapshot(
    doc(clientsCol(uid), id),
    (snap) => cb(snap.exists() ? normalize<Client>(snap.id, snap.data(LIVE)) : null),
    onListenError("this client", cb, null),
  );
}

export async function createClient(input: ClientInput) {
  const uid = requireUid();
  const ref = doc(clientsCol(uid));
  await setDoc(ref, { ...input, invoiceCount: 0, totalBilled: 0, createdAt: serverTimestamp() });
  return ref.id;
}

export async function updateClient(id: string, input: Partial<ClientInput>) {
  await updateDoc(doc(clientsCol(requireUid()), id), input);
}

/** Removes the client profile. Issued invoices keep their client snapshot. */
export async function deleteClient(id: string) {
  await deleteDoc(doc(clientsCol(requireUid()), id));
}

/* ------------------------------------------------------------------ */
/* invoices                                                            */
/* ------------------------------------------------------------------ */

export function watchInvoices(uid: string, cb: (invoices: Invoice[]) => void, clientId?: string) {
  const base = clientId
    ? query(invoicesCol(uid), where("clientId", "==", clientId))
    : query(invoicesCol(uid), orderBy("seq", "desc"));
  return onSnapshot(base, (snap) => {
    const list = snap.docs.map((d) => normalize<Invoice>(d.id, d.data(LIVE)));
    cb(clientId ? list.sort((a, b) => b.seq - a.seq) : list);
  }, onListenError("invoices", cb, []));
}

export function watchInvoice(uid: string, id: string, cb: (inv: Invoice | null) => void) {
  return onSnapshot(
    doc(invoicesCol(uid), id),
    (snap) => cb(snap.exists() ? normalize<Invoice>(snap.id, snap.data(LIVE)) : null),
    onListenError("this invoice", cb, null),
  );
}

/**
 * Creates an invoice inside a transaction so the account-wide serial number
 * (INV-001, INV-002 …) and the per-client order number can never collide.
 */
export async function createInvoice(draft: InvoiceDraft, status: StoredStatus = "SAVED") {
  const uid = requireUid();
  const db = firestore();
  const invRef = doc(invoicesCol(uid));
  const clientRef = doc(clientsCol(uid), draft.clientId);
  const { subtotal, tax, total } = computeTotals(draft.items, draft.taxRate, draft.shipping, draft.template);

  return runTransaction(db, async (tx) => {
    const [userSnap, clientSnap] = await Promise.all([tx.get(userRef(uid)), tx.get(clientRef)]);
    if (!userSnap.exists()) throw new Error("Account profile not found.");
    if (!clientSnap.exists()) throw new Error("Client not found.");

    const profile = userSnap.data() as UserProfile;
    const seq = (profile.invoiceCounter || 0) + 1;
    const clientOrderNumber = ((clientSnap.data() as Client).invoiceCount || 0) + 1;
    const number = formatInvoiceNumber(profile.invoicePrefix, seq);

    const invoice: Omit<Invoice, "id"> = {
      ...draft,
      number,
      seq,
      clientOrderNumber,
      subtotal,
      tax,
      total,
      status,
      sentAt: status === "SENT" ? Date.now() : null,
      paidAt: null,
    };

    // Every stored time comes from Firebase's clock, never the device's.
    tx.set(invRef, { ...invoice, sentAt: status === "SENT" ? serverTimestamp() : null, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    tx.update(userRef(uid), { invoiceCounter: seq });
    tx.update(clientRef, { invoiceCount: increment(1), totalBilled: increment(total) });
    return { id: invRef.id, ...invoice } as Invoice;
  });
}

/**
 * Saves edits to an invoice that hasn't been paid. Its number, order number, client,
 * issue date and status stay as they are; the client's billed total follows the new amount.
 */
export async function updateInvoice(id: string, draft: InvoiceDraft) {
  const uid = requireUid();
  const invRef = doc(invoicesCol(uid), id);
  const { subtotal, tax, total } = computeTotals(draft.items, draft.taxRate, draft.shipping, draft.template);

  return runTransaction(firestore(), async (tx) => {
    const invSnap = await tx.get(invRef);
    if (!invSnap.exists()) throw new Error("Invoice not found.");
    const current = invSnap.data() as Invoice;
    if (current.status === "PAID") throw new Error("Paid invoices can’t be edited. Mark it as unpaid first.");
    const clientRef = doc(clientsCol(uid), current.clientId);
    const clientSnap = await tx.get(clientRef);

    const changes = {
      client: draft.client,
      business: draft.business,
      template: draft.template,
      currency: draft.currency,
      dueDate: draft.dueDate,
      items: draft.items,
      taxRate: draft.taxRate,
      shipping: draft.shipping,
      notes: draft.notes,
      payment: draft.payment,
      extra: draft.extra,
      subtotal,
      tax,
      total,
    };
    tx.update(invRef, { ...changes, updatedAt: serverTimestamp() });
    const delta = total - (current.total || 0);
    if (clientSnap.exists() && delta) tx.update(clientRef, { totalBilled: increment(delta) });
    return normalize<Invoice>(id, { ...current, ...changes });
  });
}

export async function updateInvoiceStatus(id: string, status: StoredStatus) {
  const patch: Record<string, unknown> = { status, updatedAt: serverTimestamp() };
  if (status === "SENT") patch.sentAt = serverTimestamp();
  if (status === "PAID") patch.paidAt = serverTimestamp();
  await updateDoc(doc(invoicesCol(requireUid()), id), patch);
}

/**
 * Deletes an invoice and takes its amount off the client's billed total, atomically.
 * The serial counters are left alone on purpose: invoice numbers (INV-012) and
 * client order numbers (#004) are never reused, so a deletion leaves a gap.
 */
export async function deleteInvoice(id: string) {
  const uid = requireUid();
  const invRef = doc(invoicesCol(uid), id);
  await runTransaction(firestore(), async (tx) => {
    const invSnap = await tx.get(invRef);
    if (!invSnap.exists()) return;
    const inv = invSnap.data() as Invoice;
    const clientRef = doc(clientsCol(uid), inv.clientId);
    const clientSnap = await tx.get(clientRef);
    tx.delete(invRef);
    if (clientSnap.exists()) tx.update(clientRef, { totalBilled: increment(-(inv.total || 0)) });
  });
  // Its emailed PDF (if any) goes too, so the download link stops working. A missing file is fine.
  await deleteObject(invoicePdfRef(uid, id)).catch(() => {});
}
