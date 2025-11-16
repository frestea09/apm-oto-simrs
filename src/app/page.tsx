
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Fingerprint,
  Loader,
  LogIn,
  Printer,
  XCircle,
  ScanBarcode,
  Keyboard,
  User,
  FileText,
  ExternalLink,
} from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { VoicePrompt } from "@/components/voice-prompt";
import { patients, Patient } from "@/data/patients";

type Step = "idle" | "input" | "verifying" | "success" | "error";
type VerificationSubStep = "login" | "fingerprint" | "print";
type SubStepStatus = "pending" | "progress" | "success" | "error";

const verificationSteps: {
  key: VerificationSubStep;
  name: string;
  icon: React.ElementType;
}[] = [
  { key: "login", name: "Login Aplikasi", icon: LogIn },
  { key: "fingerprint", name: "Verifikasi Sidik Jari", icon: Fingerprint },
  { key: "print", name: "Cetak Tiket", icon: Printer },
];

export default function Home() {
  const [step, setStep] = useState<Step>("idle");
  const [bpjsNumber, setBpjsNumber] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [voiceInstruction, setVoiceInstruction] = useState("");
  const [statuses, setStatuses] = useState<
    Record<VerificationSubStep, SubStepStatus>
  >({
    login: "pending",
    fingerprint: "pending",
    print: "pending",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [verifiedPatient, setVerifiedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  const resetState = useCallback(() => {
    setStep("idle");
    setBpjsNumber("");
    setBookingNumber("");
    setStatuses({
      login: "pending",
      fingerprint: "pending",
      print: "pending",
    });
    setErrorMessage("");
    setVerifiedPatient(null);
  }, []);

  useEffect(() => {
    const instructions: Record<Step, string> = {
      idle: "Selamat datang. Silakan tekan tombol Mulai Verifikasi untuk memulai.",
      input:
        "Silakan masukkan nomor BPJS atau nomor booking Anda pada kolom yang tersedia. Anda dapat menggunakan keyboard atau pemindai barcode.",
      verifying: "Sedang memproses. Mohon tunggu.",
      success:
        `Verifikasi untuk pasien ${verifiedPatient?.name} berhasil. Tiket Anda akan segera dicetak. Silakan ambil tiket Anda.`,
      error: `Terjadi kesalahan. ${errorMessage} Silakan coba lagi.`,
    };
    setVoiceInstruction(instructions[step]);
  }, [step, errorMessage, verifiedPatient]);

  const handleStart = () => {
    setStep("input");
  };

  const handleOpenFrista = () => {
    // This will attempt to open the application registered with the "frista://" protocol.
    // The user's local machine must be configured to handle this custom URL scheme.
    window.location.href = `frista://open?patientId=${verifiedPatient?.nik}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpjsNumber && !bookingNumber) {
      setErrorMessage("Mohon isi Nomor BPJS atau Nomor Booking.");
      setStep("error");
      return;
    }

    const foundPatient = patients.find(
      (p) =>
        (bpjsNumber && p.bpjsNumber === bpjsNumber) ||
        (bookingNumber && p.bookingNumber === bookingNumber)
    );

    if (!foundPatient) {
      setErrorMessage("Data pasien tidak ditemukan.");
      setStep("error");
      return;
    }
    
    setVerifiedPatient(foundPatient);
    setStep("verifying");
  };

  const handleTryAgain = () => {
    resetState();
    setStep("input");
  };

  const handleStartOver = () => {
    resetState();
  };

  useEffect(() => {
    if (step !== "verifying") return;

    let mounted = true;
    const timeouts: NodeJS.Timeout[] = [];

    const runVerification = async () => {
      if (!mounted) return;
      setStatuses((s) => ({ ...s, login: "progress" }));
      timeouts.push(
        setTimeout(() => {
          if (!mounted) return;
          setStatuses((s) => ({ ...s, login: "success" }));
          setVoiceInstruction(
            "Login berhasil. Silakan letakkan jari Anda pada pemindai sidik jari."
          );

          timeouts.push(
            setTimeout(() => {
              if (!mounted) return;
              setStatuses((s) => ({ ...s, fingerprint: "progress" }));

              timeouts.push(
                setTimeout(() => {
                  if (!mounted) return;
                  setStatuses((s) => ({ ...s, fingerprint: "success" }));
                  setVoiceInstruction(
                    "Verifikasi sidik jari berhasil. Sedang mencetak tiket."
                  );

                  timeouts.push(
                    setTimeout(() => {
                      if (!mounted) return;
                      setStatuses((s) => ({ ...s, print: "progress" }));

                      timeouts.push(
                        setTimeout(() => {
                          if (!mounted) return;
                          setStatuses((s) => ({ ...s, print: "success" }));
                          setStep("success");
                        }, 1500)
                      );
                    }, 1000)
                  );
                }, 2000)
              );
            }, 1000)
          );
        }, 1500)
      );
    };

    runVerification();

    return () => {
      mounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [step]);

  const renderStepContent = () => {
    switch (step) {
      case "idle":
        return (
          <div className="flex flex-col items-center gap-8 text-center">
            <Logo className="h-24 w-24 text-primary" />
            <div>
              <h1 className="font-headline text-4xl sm:text-5xl font-bold text-primary">
                BPJS Verification Simplified
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Rumah Sakit Oto Iskanda Dinata
              </p>
            </div>
            <Button
              onClick={handleStart}
              size="lg"
              className="h-24 w-72 text-2xl shadow-lg"
            >
              Mulai Verifikasi
            </Button>
            <p className="text-muted-foreground">
              Tekan untuk memulai proses verifikasi
            </p>
          </div>
        );

      case "input":
        return (
          <Card className="w-full max-w-lg shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">
                Masukkan Data Pasien
              </CardTitle>
              <CardDescription>
                Isi nomor BPJS atau nomor booking untuk melanjutkan.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="bpjs-number" className="text-lg">
                    Nomor BPJS
                  </Label>
                  <Input
                    id="bpjs-number"
                    placeholder="Contoh: 000111222333"
                    className="h-14 text-xl"
                    value={bpjsNumber}
                    onChange={(e) => setBpjsNumber(e.target.value)}
                  />
                </div>
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-muted"></div>
                  <span className="flex-shrink mx-4 text-muted-foreground">
                    ATAU
                  </span>
                  <div className="flex-grow border-t border-muted"></div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-number" className="text-lg">
                    Nomor Booking
                  </Label>
                  <Input
                    id="booking-number"
                    placeholder="Contoh: BOOK001"
                    className="h-14 text-xl"
                    value={bookingNumber}
                    onChange={(e) => setBookingNumber(e.target.value)}
                  />
                </div>
                <div className="flex justify-center items-center gap-4 text-muted-foreground text-sm pt-4">
                  <Keyboard className="h-6 w-6" />
                  <span>Gunakan Keyboard</span>
                  <div className="border-l h-6"></div>
                  <ScanBarcode className="h-6 w-6" />
                  <span>Gunakan Barcode Scanner</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" size="lg" className="w-full h-16 text-xl">
                  Lanjutkan Verifikasi
                </Button>
              </CardFooter>
            </form>
          </Card>
        );

      case "verifying":
        return (
          <Card className="w-full max-w-lg text-center shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-headline">
                Proses Verifikasi
              </CardTitle>
              <CardDescription>
                Mohon tunggu, sistem sedang memproses data Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {verificationSteps.map(({ key, name, icon: Icon }) => (
                <div
                  key={key}
                  className="flex items-center text-lg p-3 bg-secondary rounded-lg"
                >
                  <Icon className="h-6 w-6 mr-4 text-primary" />
                  <span className="flex-grow text-left">{name}</span>
                  {statuses[key] === "pending" && (
                    <span className="text-sm text-muted-foreground">
                      Menunggu
                    </span>
                  )}
                  {statuses[key] === "progress" && (
                    <Loader className="animate-spin h-6 w-6 text-primary" />
                  )}
                  {statuses[key] === "success" && (
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                  )}
                  {statuses[key] === "error" && (
                    <XCircle className="h-6 w-6 text-destructive" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );

      case "success":
        return (
          <Card className="w-full max-w-2xl text-center shadow-xl">
            <CardHeader>
              <CheckCircle2 className="h-24 w-24 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-3xl font-headline">
                Verifikasi Berhasil!
              </CardTitle>
              <CardDescription className="text-lg">
                Data pasien cocok dan tiket akan segera dicetak.
              </CardDescription>
            </CardHeader>
            {verifiedPatient && (
               <CardContent className="text-left space-y-4 text-lg bg-secondary/50 p-6 rounded-lg">
                 <div className="flex items-center">
                   <User className="h-6 w-6 mr-4 text-primary" />
                   <div>
                     <p className="font-semibold text-xl">{verifiedPatient.name}</p>
                     <p className="text-muted-foreground">Nama Pasien</p>
                   </div>
                 </div>
                 <div className="flex items-center">
                   <FileText className="h-6 w-6 mr-4 text-primary" />
                   <div>
                     <p className="font-semibold">{verifiedPatient.bpjsNumber}</p>
                     <p className="text-muted-foreground">No. BPJS</p>
                   </div>
                 </div>
                 <div className="flex items-center">
                   <FileText className="h-6 w-6 mr-4 text-primary" />
                   <div>
                     <p className="font-semibold">{verifiedPatient.nik}</p>
                     <p className="text-muted-foreground">NIK</p>
                   </div>
                 </div>
               </CardContent>
            )}
            <CardFooter className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <Button
                size="lg"
                className="w-full h-16 text-xl bg-green-600 hover:bg-green-700"
              >
                <Printer className="mr-2 h-6 w-6" /> Cetak Ulang Tiket
              </Button>
              <Button
                onClick={handleOpenFrista}
                size="lg"
                variant="secondary"
                className="w-full h-16 text-xl"
              >
                <ExternalLink className="mr-2 h-6 w-6" /> Buka Aplikasi Frista
              </Button>
              <Button
                onClick={handleStartOver}
                size="lg"
                variant="outline"
                className="w-full h-16 text-xl md:col-span-2"
              >
                Mulai dari Awal
              </Button>
            </CardFooter>
          </Card>
        );

      case "error":
        return (
          <Card className="w-full max-w-lg text-center border-destructive shadow-xl">
            <CardHeader>
              <XCircle className="h-24 w-24 text-destructive mx-auto mb-4" />
              <CardTitle className="text-3xl font-headline text-destructive">
                Verifikasi Gagal
              </CardTitle>
              <CardDescription className="text-destructive/90 text-base">
                {errorMessage || "Terjadi kesalahan yang tidak diketahui."}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                onClick={handleTryAgain}
                size="lg"
                variant="destructive"
                className="w-full h-16 text-xl"
              >
                Coba Lagi
              </Button>
            </CardFooter>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <VoicePrompt text={voiceInstruction} />
      <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-transparent z-10">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg hidden sm:block">
            RS. Oto Iskanda Dinata
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{currentDate}</p>
      </header>
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 pt-20">
        {renderStepContent()}
      </main>
    </div>
  );
}

    