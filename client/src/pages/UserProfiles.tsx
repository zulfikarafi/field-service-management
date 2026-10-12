import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";
import Label from "../components/form/Label";
import Input from "../components/form/input/InputField";
import Button from "../components/ui/button/Button";
import { updatePassword } from "../api/auth";
import { useAuthStore } from "../store/auth";

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  PELAPOR: "Pelapor",
  APPROVER: "Approver",
};

export default function UserProfiles() {
  const token = useAuthStore((s) => s.token) ?? "";
  const user = useAuthStore((s) => s.user);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      updatePassword({ newPassword, confirmPassword }, token),
    onSuccess: () => {
      setFeedback({ type: "success", message: "Password berhasil diperbarui." });
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) =>
      setFeedback({ type: "error", message: err.message }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!newPassword || !confirmPassword) {
      setFeedback({ type: "error", message: "Semua field wajib diisi." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "Konfirmasi password tidak cocok." });
      return;
    }
    mutation.mutate();
  };

  return (
    <>
      <PageMeta
        title="Profil | Field Service Management"
        description="Profil pengguna"
      />
      <PageBreadcrumb pageTitle="Profil" />

      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90">
            Informasi Akun
          </h3>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Peran</p>
              <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                {user ? roleLabel[user.role] ?? user.role : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                User ID
              </p>
              <p className="mt-1 font-medium text-gray-800 dark:text-white/90">
                {user?.userId ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-xl rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-white/90">
            Ubah Password
          </h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            Password minimal 8 karakter, mengandung huruf besar, huruf kecil,
            angka, dan karakter spesial (!@#$%^&amp;*).
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
                Password Baru <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Password baru"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div>
              <Label>
                Konfirmasi Password <span className="text-error-500">*</span>
              </Label>
              <Input
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="pt-2">
              <Button size="sm" disabled={mutation.isPending}>
                {mutation.isPending ? "Menyimpan..." : "Perbarui Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
