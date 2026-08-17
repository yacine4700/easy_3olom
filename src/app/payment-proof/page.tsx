"use client";

import * as React from "react";
import {
  CheckCircle2,
  FileCheck2,
  FileUp,
  Hash,
  Loader2,
  Upload,
  WalletCards,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PaymentProofSession = {
  payment_reference: string;
  amount: number;
  currency: string;
  status: string;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

export default function PaymentProofPage() {
  const [payment, setPayment] =
    React.useState<PaymentProofSession | null>(null);

  const [token, setToken] =
    React.useState<string | null>(null);

  const [file, setFile] =
    React.useState<File | null>(null);

  const [transactionReference, setTransactionReference] =
    React.useState("");

  const [loading, setLoading] =
    React.useState(true);

  const [uploading, setUploading] =
    React.useState(false);

  const [error, setError] =
    React.useState("");

  const [success, setSuccess] =
    React.useState(false);

  React.useEffect(() => {
    const currentToken = new URLSearchParams(
      window.location.search,
    ).get("token");

    if (!currentToken) {
      setError("رابط إثبات الدفع غير صالح.");
      setLoading(false);
      return;
    }

    setToken(currentToken);

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/payment-proofs/${encodeURIComponent(
        currentToken,
      )}`,
      {
        cache: "no-store",
      },
    )
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail ||
              "تعذر تحميل بيانات عملية الدفع.",
          );
        }

        return data;
      })
      .then((data) => {
        setPayment(data);
      })
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "حدث خطأ أثناء تحميل العملية.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setError("");
    setSuccess(false);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setFile(null);
      setError(
        "نوع الملف غير مدعوم. اختر JPG أو PNG أو WEBP أو PDF.",
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError(
        "حجم الملف يتجاوز الحد الأقصى المسموح به وهو 10MB.",
      );
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!token || !payment) {
      return;
    }

    if (!file) {
      setError("يرجى اختيار إثبات الدفع.");
      return;
    }

    setUploading(true);
    setError("");
    setSuccess(false);

    const formData = new FormData();

    formData.append("file", file);

    if (transactionReference.trim()) {
      formData.append(
        "transaction_reference",
        transactionReference.trim(),
      );
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment-proofs/${encodeURIComponent(
          token,
        )}`,
        {
          method: "POST",
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "فشل إرسال إثبات الدفع.",
        );
      }

      setSuccess(true);
      setFile(null);
      setTransactionReference("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "حدث خطأ أثناء إرسال الإثبات.",
      );
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <main
        dir="rtl"
        className="bg-background text-foreground flex min-h-svh items-center justify-center p-4"
      >
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Loader2 className="size-4 animate-spin" />
          جاري تحميل بيانات العملية...
        </div>
      </main>
    );
  }

  if (error && !payment) {
    return (
      <main
        dir="rtl"
        className="bg-background text-foreground flex min-h-svh items-center justify-center p-4"
      >
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>تعذر فتح الطلب</CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <main
      dir="rtl"
      className="bg-muted/30 text-foreground min-h-svh"
    >
      <div className="mx-auto flex min-h-svh w-full max-w-3xl items-center justify-center p-4 sm:p-6">
        <Card className="w-full overflow-hidden shadow-sm">
          <CardHeader className="border-b bg-background px-5 py-6 sm:px-7">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
                <FileCheck2 className="size-5" />
              </div>

              <div className="min-w-0">
                <CardTitle className="text-xl">
                  إثبات الدفع
                </CardTitle>

                <CardDescription className="mt-1">
                  أرسل إثبات عملية الدفع لإتمام مراجعة اشتراكك
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-5 sm:p-7">
            {/* Payment summary */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-background p-4">
                <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
                  <Hash className="size-3.5" />
                  رقم العملية
                </div>

                <div className="font-mono text-sm font-semibold break-all">
                  {payment.payment_reference}
                </div>
              </div>

              <div className="rounded-xl border bg-background p-4">
                <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
                  <WalletCards className="size-3.5" />
                  المبلغ
                </div>

                <div className="text-lg font-semibold tabular-nums">
                  {payment.amount}{" "}
                  {payment.currency}
                </div>
              </div>

              <div className="rounded-xl border bg-background p-4">
                <div className="text-muted-foreground mb-2 text-xs">
                  حالة العملية
                </div>

                <Badge variant="secondary">
                  في انتظار الإثبات
                </Badge>
              </div>
            </div>

            {success ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                      تم إرسال إثبات الدفع بنجاح
                    </p>

                    <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
                      سيتم مراجعة الإثبات وتحديث حالة اشتراكك بعد التحقق من الدفع.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* File upload */}
                <div className="space-y-3">
                  <Label htmlFor="proof-file">
                    إثبات الدفع
                  </Label>

                  <label
                    htmlFor="proof-file"
                    className="border-border bg-background hover:bg-muted/30 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-10 text-center transition-colors"
                  >
                    <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-full">
                      <Upload className="size-5" />
                    </div>

                    <div className="mt-4">
                      <p className="font-medium">
                        اختر صورة أو ملف PDF
                      </p>

                      <p className="text-muted-foreground mt-1 text-sm">
                        JPG، PNG، WEBP أو PDF
                      </p>

                      <p className="text-muted-foreground mt-1 text-xs">
                        الحد الأقصى 10MB
                      </p>
                    </div>

                    <Input
                      id="proof-file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {file && (
                    <div className="bg-muted/40 flex items-center gap-3 rounded-xl border p-3">
                      <div className="bg-background flex size-9 shrink-0 items-center justify-center rounded-lg border">
                        <FileUp className="text-primary size-4" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {file.name}
                        </p>

                        <p className="text-muted-foreground text-xs">
                          {(file.size / 1024 / 1024).toFixed(
                            2,
                          )}{" "}
                          MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transaction reference */}
                <div className="space-y-2">
                  <Label htmlFor="transaction-reference">
                    رقم العملية في بريدي موب
                    <span className="text-muted-foreground mr-1 text-xs font-normal">
                      (اختياري)
                    </span>
                  </Label>

                  <Input
                    id="transaction-reference"
                    value={transactionReference}
                    onChange={(event) =>
                      setTransactionReference(
                        event.target.value,
                      )
                    }
                    placeholder="أدخل رقم أو مرجع التحويل"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="h-11 w-full"
                  disabled={uploading || !file}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      جاري إرسال الإثبات...
                    </>
                  ) : (
                    <>
                      <Upload className="size-4" />
                      إرسال إثبات الدفع
                    </>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
