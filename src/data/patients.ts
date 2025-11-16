
export interface Patient {
  bpjsNumber: string;
  bookingNumber: string;
  name: string;
  nik: string;
}

export const patients: Patient[] = [
  {
    bpjsNumber: "000111222333",
    bookingNumber: "BOOK001",
    name: "Budi Santoso",
    nik: "3201010101900001",
  },
  {
    bpjsNumber: "000444555666",
    bookingNumber: "BOOK002",
    name: "Siti Aminah",
    nik: "3201020202920002",
  },
  {
    bpjsNumber: "000777888999",
    bookingNumber: "BOOK003",
    name: "Agus Setiawan",
    nik: "3201030303880003",
  },
];
