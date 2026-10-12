import { useEffect, useState } from "react";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import TextArea from "../../components/form/input/TextArea";
import Button from "../../components/ui/button/Button";
import type { ReportModel } from "../../model/report";

export interface ReportFormValues {
  name: string;
  description: string;
  location: string;
}

interface ReportFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: ReportFormValues) => void;
  isSubmitting?: boolean;
  error?: string | null;
  /** When provided, the modal is in edit mode. */
  initialReport?: ReportModel | null;
}

export default function ReportFormModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
  initialReport,
}: ReportFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const isEdit = !!initialReport;

  useEffect(() => {
    if (isOpen) {
      setName(initialReport?.name ?? "");
      setDescription(initialReport?.description ?? "");
      setLocation(initialReport?.location ?? "");
      setLocalError(null);
    }
  }, [isOpen, initialReport]);

  const handleSubmit = () => {
    if (!name.trim() || !description.trim()) {
      setLocalError("Nama dan deskripsi laporan wajib diisi.");
      return;
    }
    setLocalError(null);
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] m-4 p-6">
      <h4 className="mb-1 text-xl font-semibold text-gray-800 dark:text-white/90">
        {isEdit ? "Ubah Laporan" : "Buat Laporan"}
      </h4>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        {isEdit
          ? "Perbarui informasi laporan lapangan."
          : "Isi detail laporan lapangan yang ingin Anda ajukan."}
      </p>

      {(localError || error) && (
        <div className="p-3 mb-4 text-sm rounded-lg bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400">
          {localError || error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <Label>
            Nama Laporan <span className="text-error-500">*</span>
          </Label>
          <Input
            placeholder="Contoh: Kerusakan AC Lantai 2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <Label>
            Deskripsi <span className="text-error-500">*</span>
          </Label>
          <TextArea
            rows={4}
            placeholder="Jelaskan detail laporan..."
            value={description}
            onChange={setDescription}
          />
        </div>
        <div>
          <Label>Lokasi</Label>
          <Input
            placeholder="Contoh: Gedung A, Lantai 2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 mt-8">
        <Button size="sm" variant="outline" onClick={onClose}>
          Batal
        </Button>
        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : isEdit ? "Simpan" : "Buat Laporan"}
        </Button>
      </div>
    </Modal>
  );
}
