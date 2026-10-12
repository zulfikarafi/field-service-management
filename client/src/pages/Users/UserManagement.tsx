import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import Button from "../../components/ui/button/Button";
import { registerUser } from "../../api/auth";
import { useAuthStore } from "../../store/auth";
import type { UserRole } from "../../model/auth";

const roleOptions = [
  { value: "PELAPOR", label: "Pelapor" },
  { value: "APPROVER", label: "Approver" },
  { value: "ADMIN", label: "Admin" },
];

export default function UserManagement() {
  const token = useAuthStore((s) => s.token) ?? "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("PELAPOR");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      registerUser({ name, email, password, role }, token),
    onSuccess: () => {
      setFeedback({
        type: "success",
        message: `Akun "${name}" (${role}) berhasil dibuat.`,
      });
      setName("");
      setEmail("");
      setPassword("");
      setRole("PELAPOR");
    },
    onError: (err: Error) =>
      setFeedback({ type: "error", message: err.message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!name || !email || !password) {
      setFeedback({
        type: "error",
        message: "Semua field wajib diisi.",
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <>
      <PageMeta
        title="Manajemen Pengguna | Field Service Management"
        description="Buat akun pengguna baru"
      />
      <PageBreadcrumb pageTitle="Manajemen Pengguna" />

      <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
          Buat Akun Baru
        </h3>
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          Hanya Admin yang dapat membuat akun Pelapor, Approver, atau Admin.
        </p>

        {feedback && (
          <div
            className={`p-3 mb-5 text-sm rounded-lg ${
              feedback.type === "success"
                ? "bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-400"
                : "bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-400"
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label>
              Nama <span className="text-error-500">*</span>
            </Label>
            <Input
              placeholder="Nama lengkap"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <Input
              type="email"
              placeholder="nama@contoh.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <Input
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>
              Peran <span className="text-error-500">*</span>
            </Label>
            <Select
              options={roleOptions}
              defaultValue="PELAPOR"
              onChange={(value) => setRole(value as UserRole)}
            />
          </div>
          <div className="pt-2">
            <Button size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? "Menyimpan..." : "Buat Akun"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
