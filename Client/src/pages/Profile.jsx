import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import {
  CalendarDays,
  Camera,
  Lock,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Trash2,
  UserRound,
} from "lucide-react";

import { getApiErrorMessage, usePutMutation } from "../api/apiCall";
import API_ENDPOINTS from "../api/apiEndpoint";
import {
  Button,
  Input,
  Modal,
  PageHeader,
  SectionCard,
  Textarea,
} from "../components/UI/kit";
import { PROFILE_PHOTO } from "../constants/profile";
import useAuth from "../hooks/useAuth";
import { updateProfile } from "../store/auth/authSlice";
import { ageFromDob, formatDate, toDateInputValue, todayInputValue } from "../utils/datetime";

// Names are stored lower-case by the server; show them the way people write them.
const titleCase = (value = "") => value.replace(/\b\w/g, (letter) => letter.toUpperCase());

const isValidDate = (value) => Boolean(value) && !Number.isNaN(new Date(value).getTime());

const toForm = (user) => ({
  name: titleCase(user?.name || ""),
  mobile: user?.mobile ? String(user.mobile) : "",
  // toDateInputValue falls back to today for junk; an unreadable stored DOB
  // must show as empty, not as today's date.
  dob: isValidDate(user?.dob) ? toDateInputValue(user.dob) : "",
  address: user?.address || "",
});

const validate = (form, user) => {
  const errors = {};
  const name = form.name.trim();
  const mobile = form.mobile.trim();

  if (name.length < 2) errors.name = "Enter your full name";
  else if (name.length > 100) errors.name = "Keep the name under 100 characters";

  if (mobile) {
    if (!/^[1-9]\d{9}$/.test(mobile)) errors.mobile = "Enter a 10-digit mobile number";
  } else if (user?.mobile) {
    // The server cannot unset it, and it is a sign-in credential.
    errors.mobile = "Mobile number cannot be removed";
  }

  if (form.dob) {
    const age = ageFromDob(form.dob);
    if (age === null) errors.dob = "Enter a valid date";
    else if (age < 18) errors.dob = "You must be at least 18 years old";
  }

  if (form.address.trim().length > 300) errors.address = "Keep the address under 300 characters";

  return errors;
};

/** Only what changed — the server leaves anything not sent untouched. */
const changesBetween = (form, initial) => {
  const changes = {};
  if (form.name.trim() !== initial.name) changes.name = form.name.trim();
  if (form.mobile.trim() !== initial.mobile) changes.mobile = form.mobile.trim();
  if (form.dob !== initial.dob) changes.dob = form.dob;
  if (form.address.trim() !== initial.address) changes.address = form.address.trim();
  return changes;
};

/*
 * ⚠️ A cleared field comes back missing, not null — `image` and `dob` are
 * unset on the user. The auth slice merges into the stored user, so without
 * these defaults a removed photo would stay on screen until the next login.
 */
const freshUser = (response) => ({ image: null, dob: null, ...response?.data });

const photoProblem = (file) => {
  if (!PROFILE_PHOTO.MIME_TYPES.includes(file.type)) return "Upload a JPG, PNG or WebP image";
  if (file.size > PROFILE_PHOTO.MAX_BYTES) return "The image must be 5 MB or smaller";
  return "";
};

export const Profile = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const fileInput = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => toForm(user));
  const [showErrors, setShowErrors] = useState(false);
  const [preview, setPreview] = useState("");
  const [progress, setProgress] = useState(0);
  const [confirmRemove, setConfirmRemove] = useState(false);

  // The object URL holds the picked file in memory until it is revoked.
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const initial = toForm(user);
  const errors = validate(form, user);
  const changes = changesBetween(form, initial);
  const dirty = Object.keys(changes).length > 0;
  const visibleErrors = showErrors ? errors : {};

  const saveDetails = usePutMutation(API_ENDPOINTS.USER.UPDATE_PROFILE, {
    onSuccess: (response) => {
      dispatch(updateProfile(freshUser(response)));
      toast.success("Profile updated");
      setEditing(false);
      setShowErrors(false);
    },
  });

  const savePhoto = usePutMutation(API_ENDPOINTS.USER.UPDATE_PROFILE, {
    onUploadProgress: (event) => {
      if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
    },
    onSuccess: (response, variables) => {
      dispatch(updateProfile(freshUser(response)));
      toast.success(variables instanceof FormData ? "Photo updated" : "Photo removed");
      setConfirmRemove(false);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, "The photo could not be saved"));
    },
    onSettled: () => {
      setPreview("");
      setProgress(0);
    },
  });

  const startEditing = () => {
    setForm(toForm(user));
    setShowErrors(false);
    setEditing(true);
  };

  const cancelEditing = () => {
    setForm(toForm(user));
    setShowErrors(false);
    setEditing(false);
  };

  const onField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: name === "mobile" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    setShowErrors(true);
    if (Object.keys(errors).length || !dirty) return;
    saveDetails.mutate(changes);
  };

  const onPhotoPicked = (event) => {
    const file = event.target.files?.[0];
    // Reset so picking the same file again still fires a change.
    event.target.value = "";
    if (!file) return;

    const problem = photoProblem(file);
    if (problem) {
      toast.error(problem);
      return;
    }

    setPreview(URL.createObjectURL(file));
    const body = new FormData();
    body.append("image", file);
    savePhoto.mutate(body);
  };

  const removePhoto = () => savePhoto.mutate({ removeImage: true });

  const photo = preview || user?.image;
  const displayName = titleCase(user?.name || "") || "Your name";
  const uploading = savePhoto.isPending;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="My profile"
        subtitle="Your details as they appear across the admin panel."
      />

      <section className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
        <div className="h-28 bg-gradient-to-r from-blue-600 to-purple-600 sm:h-32" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
              <div className="relative h-24 w-24 shrink-0 sm:h-28 sm:w-28">
                {photo ? (
                  <img
                    src={photo}
                    alt={displayName}
                    className="h-full w-full rounded-full object-cover ring-4 ring-white shadow-md"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-3xl font-bold text-white ring-4 ring-white shadow-md">
                    {displayName.charAt(0)}
                  </div>
                )}

                {uploading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full bg-gray-900/55 text-white">
                    <span className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {preview && progress ? (
                      <span className="mt-1 text-xs font-semibold">{progress}%</span>
                    ) : null}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  disabled={uploading}
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow-md ring-1 ring-gray-200 transition hover:text-blue-600 disabled:opacity-60"
                >
                  <Camera size={17} aria-hidden="true" />
                </button>
              </div>

              <div className="min-w-0 sm:pb-1">
                <h2 className="truncate text-2xl font-bold text-gray-900">{displayName}</h2>
                <p className="truncate text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 sm:pb-1">
              <Button
                variant="secondary"
                icon={Camera}
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                {user?.image ? "Change photo" : "Upload photo"}
              </Button>
              {user?.image ? (
                <Button
                  variant="ghost"
                  icon={Trash2}
                  onClick={() => setConfirmRemove(true)}
                  disabled={uploading}
                >
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-500">{PROFILE_PHOTO.HINT}</p>
          <input
            ref={fileInput}
            type="file"
            accept={PROFILE_PHOTO.ACCEPT}
            onChange={onPhotoPicked}
            className="hidden"
          />
        </div>
      </section>

      <SectionCard
        title="Personal details"
        description={
          editing ? "Changes are saved when you press Save." : "Name, contact and address."
        }
        action={
          editing ? null : (
            <Button variant="soft" icon={Pencil} onClick={startEditing}>
              Edit details
            </Button>
          )
        }
      >
        {editing ? (
          <form onSubmit={onSubmit} noValidate className="space-y-6">
            <fieldset disabled={saveDetails.isPending} className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Full name"
                name="name"
                value={form.name}
                onChange={onField}
                error={visibleErrors.name}
                autoComplete="name"
                autoFocus
              />
              <Input
                label="Mobile number"
                name="mobile"
                value={form.mobile}
                onChange={onField}
                error={visibleErrors.mobile}
                hint="Also used to sign in"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="10-digit number"
              />
              <div>
                <span className="mb-1.5 block text-xs font-medium text-gray-600">Email address</span>
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  <Lock size={14} className="shrink-0 text-gray-400" aria-hidden="true" />
                  <span className="truncate">{user?.email || "—"}</span>
                </div>
                <span className="mt-1 block text-xs text-gray-400">
                  Your sign-in email cannot be changed here
                </span>
              </div>
              <Input
                label="Date of birth"
                name="dob"
                type="date"
                value={form.dob}
                onChange={onField}
                error={visibleErrors.dob}
                max={todayInputValue()}
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Address"
                  name="address"
                  rows={3}
                  value={form.address}
                  onChange={onField}
                  placeholder="House, street, city, PIN code"
                />
                {visibleErrors.address ? (
                  <span className="mt-1 block text-xs text-red-600">{visibleErrors.address}</span>
                ) : null}
              </div>
            </fieldset>

            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="secondary" onClick={cancelEditing} disabled={saveDetails.isPending}>
                Cancel
              </Button>
              <Button type="submit" loading={saveDetails.isPending} disabled={!dirty}>
                Save changes
              </Button>
            </div>
          </form>
        ) : (
          <dl className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <Detail icon={UserRound} label="Full name" value={titleCase(user?.name || "")} />
            <Detail icon={Mail} label="Email address" value={user?.email} />
            <Detail icon={Phone} label="Mobile number" value={user?.mobile ? String(user.mobile) : ""} />
            <Detail
              icon={CalendarDays}
              label="Date of birth"
              value={isValidDate(user?.dob) ? formatDate(user.dob) : ""}
            />
            <div className="md:col-span-2">
              <Detail icon={MapPin} label="Address" value={user?.address} multiline />
            </div>
          </dl>
        )}
      </SectionCard>

      <Modal
        open={confirmRemove}
        size="sm"
        title="Remove profile photo?"
        description="Your initials will be shown instead."
        onClose={() => (uploading ? null : setConfirmRemove(false))}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmRemove(false)} disabled={uploading}>
              Keep photo
            </Button>
            <Button variant="danger" icon={Trash2} onClick={removePhoto} loading={uploading}>
              Remove photo
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">You can upload a new one at any time.</p>
      </Modal>
    </div>
  );
};

const Detail = ({ icon: Icon, label, value, multiline = false }) => (
  <div className="flex gap-3">
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
    </span>
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</dt>
      <dd
        className={`mt-1 text-sm ${value ? "text-gray-900" : "text-gray-400"} ${
          multiline ? "whitespace-pre-line break-words" : "truncate"
        }`}
      >
        {value || "Not added"}
      </dd>
    </div>
  </div>
);
