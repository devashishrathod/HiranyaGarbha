import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { useApiMutation } from "../../api/apiCall";
import API_ENDPOINTS from "../../api/apiEndpoint";
import {
  BLOOD_GROUPS,
  PROFESSIONS,
  TRIMESTERS,
  YES_NO,
} from "../../constants/appointment";
import { buildQuery } from "../../utils/ids";
import { Button, Input, Modal, Select, Textarea } from "../../components/UI/kit";

const EMPTY_MEDICATION = { name: "", dosage: "", frequency: "" };
const EMPTY_DELIVERY = {
  year: "",
  type: "",
  babyWeight: "",
  complications: "",
};

const asNumber = (value) =>
  value === "" || value === null || value === undefined
    ? undefined
    : Number(value);

/** "Other" keeps the profession free-text while the dropdown covers the usual answers. */
const OTHER_PROFESSION = "__other";

const buildInitialState = (patient) => ({
  fullName: patient?.fullName || "",
  husbandOrParentName: patient?.husbandOrParentName || "",
  profession: patient?.profession || "",
  email: patient?.email || "",
  mobile: patient?.userId?.mobile ? String(patient.userId.mobile) : "",
  password: "",
  dateOfBirth: patient?.dateOfBirth || "",
  age: patient?.age ?? "",
  bloodGroup: patient?.bloodGroup || "",
  height: patient?.height || "",
  weight: patient?.weight || "",
  phone: patient?.phone || "",
  whatsappNumber: patient?.whatsappNumber || "",
  address: patient?.address || "",

  heardAboutGarbhsanskar: patient?.heardAboutGarbhsanskar || "",
  expectationsFromHiranyagarbha: patient?.expectationsFromHiranyagarbha || "",

  lmp: patient?.lmp || "",
  edd: patient?.edd || "",
  currentTrimester: patient?.currentTrimester || "",
  gravida: patient?.gravida ?? "",
  para: patient?.para ?? "",
  abortions: patient?.abortions ?? "",

  medicalConditions: (patient?.medicalConditions || []).join(", "),
  preferredLanguage: patient?.preferredLanguage || "",

  emergencyName: patient?.emergencyContact?.name || "",
  emergencyRelationship: patient?.emergencyContact?.relationship || "",
  emergencyPhone: patient?.emergencyContact?.phone || "",
  emergencyAddress: patient?.emergencyContact?.address || "",
});

const SubHeading = ({ children }) => (
  <h3 className="col-span-full mt-2 border-b border-gray-100 pb-2 text-sm font-semibold text-gray-800">
    {children}
  </h3>
);

const RepeatableRows = ({ label, rows, columns, onChange, emptyRow }) => (
  <div className="col-span-full">
    <div className="mb-2 flex items-center justify-between">
      <span className="text-xs font-medium text-gray-600">{label}</span>
      <button
        type="button"
        onClick={() => onChange([...rows, { ...emptyRow }])}
        className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
      >
        <Plus size={14} /> Add row
      </button>
    </div>

    {rows.length === 0 ? (
      <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-xs text-gray-400">
        No entries yet
      </p>
    ) : (
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div
            key={index}
            className="flex flex-wrap items-end gap-2 rounded-lg border border-gray-200 p-2.5"
          >
            {columns.map((column) => (
              <Input
                key={column.key}
                label={column.label}
                type={column.type || "text"}
                value={row[column.key] ?? ""}
                placeholder={column.placeholder}
                className="min-w-[8rem] flex-1"
                onChange={(event) => {
                  const next = [...rows];
                  next[index] = { ...row, [column.key]: event.target.value };
                  onChange(next);
                }}
              />
            ))}
            <button
              type="button"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="mb-0.5 rounded-lg p-2 text-red-500 hover:bg-red-50"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * Create runs POST /patients/create (creates the login account too).
 * Edit runs PUT /patients/update-profile, which is keyed by the linked User._id.
 * The photo travels in its own multipart request because the profile validator
 * expects real arrays, which multipart form fields cannot express.
 */
const PatientFormModal = ({ patient, onClose, onSaved }) => {
  const isEdit = Boolean(patient?._id);

  const [form, setForm] = useState(() => buildInitialState(patient));
  const [medications, setMedications] = useState(
    () => patient?.medications?.map((item) => ({ ...item })) || [],
  );
  const [deliveries, setDeliveries] = useState(
    () => patient?.previousDeliveries?.map((item) => ({ ...item })) || [],
  );
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [professionIsOther, setProfessionIsOther] = useState(
    () =>
      Boolean(patient?.profession) &&
      !PROFESSIONS.includes(patient.profession),
  );

  const { mutateAsync } = useApiMutation({ toastOnError: false });

  const set = (key) => (event) =>
    setForm((previous) => ({ ...previous, [key]: event.target.value }));

  const buildProfilePayload = () => ({
    fullName: form.fullName.trim(),
    husbandOrParentName: form.husbandOrParentName.trim(),
    profession: form.profession.trim(),
    email: form.email.trim() || undefined,
    dateOfBirth: form.dateOfBirth,
    age: asNumber(form.age),
    bloodGroup: form.bloodGroup,
    height: form.height,
    weight: form.weight,
    phone: form.phone.trim(),
    whatsappNumber: form.whatsappNumber.trim(),
    address: form.address.trim(),

    heardAboutGarbhsanskar: form.heardAboutGarbhsanskar,
    expectationsFromHiranyagarbha: form.expectationsFromHiranyagarbha.trim(),

    lmp: form.lmp,
    edd: form.edd,
    currentTrimester: form.currentTrimester,
    gravida: asNumber(form.gravida),
    para: asNumber(form.para),
    abortions: asNumber(form.abortions),

    previousDeliveries: deliveries
      .filter((row) => row.year || row.type)
      .map((row) => ({
        year: asNumber(row.year),
        type: row.type || "",
        babyWeight: row.babyWeight || "",
        complications: row.complications || "",
      })),

    medicalConditions: form.medicalConditions
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),

    medications: medications
      .filter((row) => row.name?.trim())
      .map((row) => ({
        name: row.name.trim(),
        dosage: row.dosage || "",
        frequency: row.frequency || "",
      })),

    preferredLanguage: form.preferredLanguage,
    emergencyContact: {
      name: form.emergencyName.trim(),
      relationship: form.emergencyRelationship.trim(),
      phone: form.emergencyPhone.trim(),
      address: form.emergencyAddress.trim(),
    },
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
      let userId = patient?.userId?._id || patient?.userId;

      if (isEdit) {
        await mutateAsync({
          method: "put",
          url: `${API_ENDPOINTS.PATIENTS.UPDATE_PROFILE}${buildQuery({
            patientId: userId,
          })}`,
          data: profile,
        });
      } else {
        const response = await mutateAsync({
          method: "post",
          url: API_ENDPOINTS.PATIENTS.CREATE,
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
          url: `${API_ENDPOINTS.PATIENTS.UPDATE_PROFILE}${buildQuery({
            patientId: userId,
          })}`,
          data: body,
        });
      }

      toast.success(isEdit ? "Patient updated" : "Patient created");
      onSaved?.();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          `Could not ${isEdit ? "update" : "create"} the patient`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      size="lg"
      title={isEdit ? "Edit patient" : "Add new patient"}
      description={
        isEdit
          ? patient?.fullName
          : "Creates the patient's login account along with the profile."
      }
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={saving} onClick={submit}>
            {isEdit ? "Save changes" : "Create patient"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SubHeading>Personal details</SubHeading>

        <Input
          label="Full name *"
          value={form.fullName}
          onChange={set("fullName")}
        />
        <Input
          label="Husband / parent name"
          value={form.husbandOrParentName}
          onChange={set("husbandOrParentName")}
        />

        <Select
          label="Profession"
          value={professionIsOther ? OTHER_PROFESSION : form.profession}
          onChange={(event) => {
            const choice = event.target.value;
            const isOther = choice === OTHER_PROFESSION;

            setProfessionIsOther(isOther);
            setForm((previous) => ({
              ...previous,
              profession: isOther ? "" : choice,
            }));
          }}
        >
          <option value="">Not set</option>
          {PROFESSIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
          <option value={OTHER_PROFESSION}>Other</option>
        </Select>

        {professionIsOther ? (
          <Input
            label="Profession (other)"
            value={form.profession}
            placeholder="Type the profession"
            onChange={set("profession")}
          />
        ) : null}

        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={set("email")}
        />

        {isEdit ? (
          <Input label="Phone" value={form.phone} onChange={set("phone")} />
        ) : (
          <Input
            label="Mobile (login)"
            value={form.mobile}
            hint="Email or mobile is required"
            onChange={set("mobile")}
          />
        )}

        {!isEdit ? (
          <Input
            label="Password"
            type="password"
            value={form.password}
            hint="Leave blank to auto-generate"
            onChange={set("password")}
          />
        ) : null}

        {!isEdit ? (
          <Input label="Phone" value={form.phone} onChange={set("phone")} />
        ) : null}

        <Input
          label="WhatsApp number"
          value={form.whatsappNumber}
          hint="Leave blank if same as phone"
          onChange={set("whatsappNumber")}
        />

        <Input
          label="Date of birth"
          type="date"
          value={form.dateOfBirth}
          onChange={set("dateOfBirth")}
        />
        <Input label="Age" type="number" value={form.age} onChange={set("age")} />

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

        <Input
          label="Height"
          value={form.height}
          placeholder="165 cm"
          onChange={set("height")}
        />
        <Input
          label="Weight"
          value={form.weight}
          placeholder="68 kg"
          onChange={set("weight")}
        />

        <Input
          label="Preferred language"
          value={form.preferredLanguage}
          placeholder="Hindi, English"
          onChange={set("preferredLanguage")}
        />

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

        <SubHeading>Obstetric history</SubHeading>

        <Input
          label="LMP (last menstrual period)"
          type="date"
          value={form.lmp}
          onChange={set("lmp")}
        />
        <Input
          label="EDD (expected due date)"
          type="date"
          value={form.edd}
          onChange={set("edd")}
        />
        <Select
          label="Current trimester"
          value={form.currentTrimester}
          onChange={set("currentTrimester")}
        >
          <option value="">Not set</option>
          {TRIMESTERS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Input
          label="Gravida"
          type="number"
          min="0"
          value={form.gravida}
          onChange={set("gravida")}
        />
        <Input
          label="Para"
          type="number"
          min="0"
          value={form.para}
          onChange={set("para")}
        />
        <Input
          label="Abortions"
          type="number"
          min="0"
          value={form.abortions}
          onChange={set("abortions")}
        />

        <RepeatableRows
          label="Previous deliveries"
          rows={deliveries}
          onChange={setDeliveries}
          emptyRow={EMPTY_DELIVERY}
          columns={[
            { key: "year", label: "Year", type: "number", placeholder: "2020" },
            { key: "type", label: "Type", placeholder: "Normal delivery" },
            { key: "babyWeight", label: "Baby weight", placeholder: "3.2 kg" },
            { key: "complications", label: "Complications", placeholder: "None" },
          ]}
        />

        <SubHeading>Medical</SubHeading>

        <Input
          label="Medical conditions"
          value={form.medicalConditions}
          className="col-span-full"
          hint="Separate multiple conditions with commas"
          placeholder="Gestational diabetes, Mild hypothyroidism"
          onChange={set("medicalConditions")}
        />

        <RepeatableRows
          label="Medications"
          rows={medications}
          onChange={setMedications}
          emptyRow={EMPTY_MEDICATION}
          columns={[
            { key: "name", label: "Medicine", placeholder: "Thyroxine 50mcg" },
            { key: "dosage", label: "Dosage", placeholder: "Once daily" },
            { key: "frequency", label: "Frequency", placeholder: "Morning" },
          ]}
        />

        <SubHeading>Garbhsanskar background</SubHeading>

        <Select
          label="Heard about Garbhsanskar before this?"
          value={form.heardAboutGarbhsanskar}
          onChange={set("heardAboutGarbhsanskar")}
        >
          <option value="">Not answered</option>
          {YES_NO.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>

        <Textarea
          label="What do they expect from Hiranyagarbha Garbhsanskar LLP?"
          rows={3}
          value={form.expectationsFromHiranyagarbha}
          className="col-span-full"
          onChange={set("expectationsFromHiranyagarbha")}
        />

        <SubHeading>Emergency contact</SubHeading>

        <Input
          label="Name"
          value={form.emergencyName}
          onChange={set("emergencyName")}
        />
        <Input
          label="Relationship"
          value={form.emergencyRelationship}
          onChange={set("emergencyRelationship")}
        />
        <Input
          label="Phone"
          value={form.emergencyPhone}
          onChange={set("emergencyPhone")}
        />
        <Input
          label="Address"
          value={form.emergencyAddress}
          className="col-span-full"
          onChange={set("emergencyAddress")}
        />
      </div>
    </Modal>
  );
};

export default PatientFormModal;
