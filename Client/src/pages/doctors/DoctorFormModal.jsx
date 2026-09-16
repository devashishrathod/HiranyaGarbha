import { useState } from "react";
import { toast } from "react-hot-toast";

import { useApiMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import { BLOOD_GROUPS } from "../../constants/appointment";
import { buildQuery } from "../../utils/ids";
import { Button, Input, Modal, Select, Textarea } from "../../components/UI/kit";

const buildInitialState = (doctor) => ({
  fullName: doctor?.fullName || "",
  email: doctor?.email || "",
  mobile: doctor?.userId?.mobile ? String(doctor.userId.mobile) : "",
  password: "",
  phone: doctor?.phone || "",
  dateOfBirth: doctor?.dateOfBirth || "",
  gender: doctor?.gender || "",
  bloodGroup: doctor?.bloodGroup || "",
  address: doctor?.address || "",

  specialization: doctor?.specialization || "",
  qualifications: doctor?.qualifications || "",
  experience: doctor?.experience || "",
  licenseNumber: doctor?.licenseNumber || "",
  department: doctor?.department || "",
  consultationFee:
    doctor?.consultationFee === undefined || doctor?.consultationFee === null
      ? ""
      : String(doctor.consultationFee),
  availableDays: doctor?.availableDays || "",
  availableTime: doctor?.availableTime || "",

  expertise: (doctor?.expertise || []).join(", "),
  languages: (doctor?.languages || []).join(", "),
});

const SubHeading = ({ children }) => (
  <h3 className="col-span-full mt-2 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-800">
    {children}
  </h3>
);

const toList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Create runs POST /doctors/create (creates the login account too).
 * Edit runs PUT /doctors/update-profile, which is keyed by the linked User._id.
 */
const DoctorFormModal = ({ doctor, onClose, onSaved }) => {
  const isEdit = Boolean(doctor?._id);

  const [form, setForm] = useState(() => buildInitialState(doctor));
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const { mutateAsync } = useApiMutation({ toastOnError: false });

  const set = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const buildProfilePayload = () => ({
    fullName: form.fullName.trim(),
    email: form.email.trim() || undefined,
    phone: form.phone.trim(),
    dateOfBirth: form.dateOfBirth,
    gender: form.gender,
    bloodGroup: form.bloodGroup,
    address: form.address.trim(),

    specialization: form.specialization.trim(),
    qualifications: form.qualifications.trim(),
    experience: form.experience.trim(),
    licenseNumber: form.licenseNumber.trim(),
    department: form.department.trim(),
    consultationFee: form.consultationFee === "" ? "" : String(form.consultationFee),
    availableDays: form.availableDays.trim(),
    availableTime: form.availableTime.trim(),

    expertise: toList(form.expertise),
    languages: toList(form.languages),
  });

  const submit = async () => {
    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!isEdit && !form.email.trim() && !form.mobile.trim()) {
      toast.error("Add an email or a mobile number for the login account");
      return;
    }

    setSaving(true);

    try {
      const profile = buildProfilePayload();
      let userId = doctor?.userId?._id || doctor?.userId;

      if (isEdit) {
        await mutateAsync({
          method: "put",
          url: `${API_ENDPOINTS.DOCTORS.UPDATE_PROFILE}${buildQuery({
            doctorId: userId,
          })}`,
          data: profile,
        });
      } else {
        const response = await mutateAsync({
          method: "post",
          url: API_ENDPOINTS.DOCTORS.CREATE,
          data: {
            ...profile,
            name: form.fullName.trim(),
            mobile: form.mobile.trim() || undefined,
            password: form.password.trim() || undefined,
          },
        });

        userId = response?.data?.user?._id;
      }

      if (imageFile && userId) {
        const body = new FormData();
        body.append("image", imageFile);

        await mutateAsync({
          method: "put",
          url: `${API_ENDPOINTS.DOCTORS.UPDATE_PROFILE}${buildQuery({
            doctorId: userId,
          })}`,
          data: body,
        });
      }

      toast.success(isEdit ? "Doctor updated" : "Doctor created");
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          `Could not ${isEdit ? "update" : "create"} the doctor`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      title={isEdit ? "Edit doctor" : "Add new doctor"}
      description={
        isEdit
          ? doctor?.fullName
          : "Creates the doctor's login account along with the profile."
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            {isEdit ? "Save changes" : "Create doctor"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SubHeading>Personal details</SubHeading>

        <Input
          label="Full name *"
          value={form.fullName}
          placeholder="Dr. Anjali Gupta"
          onChange={set("fullName")}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
        />
        <Input label="Phone" value={form.phone} onChange={set("phone")} />

        {!isEdit ? (
          <>
            <Input
              label="Mobile (login)"
              value={form.mobile}
              hint="Email or mobile is required"
              onChange={set("mobile")}
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              hint="Leave blank to auto-generate"
              onChange={set("password")}
            />
          </>
        ) : null}

        <Input
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={set("dateOfBirth")}
        />

        <Select label="Gender" value={form.gender} onChange={set("gender")}>
          <option value="">Not set</option>
          <option value="Female">Female</option>
          <option value="Male">Male</option>
          <option value="Other">Other</option>
        </Select>

        <Select
          label="Blood group"
          value={form.bloodGroup}
          onChange={set("bloodGroup")}
        >
          <option value="">Not set</option>
          {BLOOD_GROUPS.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </Select>

        <Textarea
          label="Address"
          rows={2}
          value={form.address}
          className="col-span-full"
          onChange={set("address")}
        />

        <label className="col-span-full block">
          <span className="mb-1.5 block text-xs font-medium text-gray-600">
            Profile photo
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setImageFile(event.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
          />
        </label>

        <SubHeading>Professional details</SubHeading>

        <Input
          label="Specialization"
          value={form.specialization}
          placeholder="Obstetrician & Gynecologist"
          onChange={set("specialization")}
        />
        <Input
          label="Qualifications"
          value={form.qualifications}
          placeholder="MBBS, MD"
          onChange={set("qualifications")}
        />
        <Input
          label="Experience"
          value={form.experience}
          placeholder="15 years"
          onChange={set("experience")}
        />
        <Input
          label="License number"
          value={form.licenseNumber}
          onChange={set("licenseNumber")}
        />
        <Input
          label="Department"
          value={form.department}
          onChange={set("department")}
        />
        <Input
          label="Consultation fee (₹)"
          type="number"
          min="0"
          value={form.consultationFee}
          onChange={set("consultationFee")}
        />
        <Input
          label="Available days"
          value={form.availableDays}
          placeholder="Mon - Sat"
          hint="Display text only, slots come from the availability tab"
          onChange={set("availableDays")}
        />
        <Input
          label="Available time"
          value={form.availableTime}
          placeholder="9:00 AM - 5:00 PM"
          onChange={set("availableTime")}
        />

        <SubHeading>Expertise & languages</SubHeading>

        <Input
          label="Areas of expertise"
          value={form.expertise}
          className="col-span-full sm:col-span-1 lg:col-span-2"
          hint="Separate with commas"
          placeholder="High-risk pregnancy, C-Section, PCOD"
          onChange={set("expertise")}
        />
        <Input
          label="Languages"
          value={form.languages}
          hint="Separate with commas"
          placeholder="Hindi, English"
          onChange={set("languages")}
        />
      </div>
    </Modal>
  );
};

export default DoctorFormModal;
