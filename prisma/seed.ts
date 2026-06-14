import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.vehicleFitment.deleteMany();
  await prisma.part.deleteMany();
  await prisma.category.deleteMany();

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Engine", nameAr: "المحرك" } }),
    prisma.category.create({ data: { name: "Brakes", nameAr: "الفرامل" } }),
    prisma.category.create({ data: { name: "Filters", nameAr: "الفلاتر" } }),
    prisma.category.create({ data: { name: "Electrical", nameAr: "الكهرباء" } }),
    prisma.category.create({ data: { name: "Suspension", nameAr: "نظام التعليق" } }),
  ]);

  const [engine, brakes, filters, electrical, suspension] = categories;

  const parts = [
    {
      name: "Oil Filter",
      nameAr: "فلتر زيت",
      partNumber: "OEM-90915-YZZD2",
      brand: "Toyota",
      description: "فلتر زيت أصلي لمحركات تويوتا",
      price: 6.5,
      quantity: 120,
      minQuantity: 20,
      branch: "Amman",
      categoryId: filters.id,
      fitments: [
        { make: "Toyota", model: "Corolla", yearFrom: 2014, yearTo: 2022 },
        { make: "Toyota", model: "Camry", yearFrom: 2012, yearTo: 2020 },
      ],
    },
    {
      name: "Front Brake Pads",
      nameAr: "تيل فرامل أمامي",
      partNumber: "OEM-58101-1RA00",
      brand: "Hyundai",
      description: "طقم تيل فرامل أمامي عالي الجودة",
      price: 24.0,
      quantity: 45,
      minQuantity: 10,
      branch: "Zarqa",
      categoryId: brakes.id,
      fitments: [
        { make: "Hyundai", model: "Elantra", yearFrom: 2016, yearTo: 2021 },
        { make: "Kia", model: "Cerato", yearFrom: 2018, yearTo: 2023 },
      ],
    },
    {
      name: "Air Filter",
      nameAr: "فلتر هواء",
      partNumber: "OEM-28113-3X000",
      brand: "Kia",
      description: "فلتر هواء للمحرك",
      price: 9.75,
      quantity: 3,
      minQuantity: 15,
      branch: "Irbid",
      categoryId: filters.id,
      fitments: [{ make: "Kia", model: "Sportage", yearFrom: 2016, yearTo: 2022 }],
    },
    {
      name: "Spark Plug",
      nameAr: "بوجيه",
      partNumber: "OEM-22401-JA01B",
      brand: "Nissan",
      description: "بوجيه إيريديوم طويل العمر",
      price: 4.25,
      quantity: 300,
      minQuantity: 50,
      branch: "Amman",
      categoryId: engine.id,
      fitments: [{ make: "Nissan", model: "Altima", yearFrom: 2013, yearTo: 2018 }],
    },
    {
      name: "Car Battery 70Ah",
      nameAr: "بطارية سيارة 70 أمبير",
      partNumber: "BAT-70AH-DIN",
      brand: "Varta",
      description: "بطارية 12 فولت 70 أمبير",
      price: 55.0,
      quantity: 18,
      minQuantity: 8,
      branch: "Amman",
      categoryId: electrical.id,
      fitments: [
        { make: "Toyota", model: "Corolla", yearFrom: 2010, yearTo: 2023 },
        { make: "Hyundai", model: "Tucson", yearFrom: 2015, yearTo: 2023 },
      ],
    },
    {
      name: "Shock Absorber Front",
      nameAr: "مساعد أمامي",
      partNumber: "OEM-54302-3SG0A",
      brand: "KYB",
      description: "مساعد أمامي (ماص صدمات)",
      price: 38.5,
      quantity: 2,
      minQuantity: 6,
      branch: "Zarqa",
      categoryId: suspension.id,
      fitments: [{ make: "Nissan", model: "Sunny", yearFrom: 2012, yearTo: 2020 }],
    },
  ];

  for (const part of parts) {
    const { fitments, ...data } = part;
    await prisma.part.create({
      data: {
        ...data,
        fitments: { create: fitments },
      },
    });
  }

  console.log("Seed completed: created", categories.length, "categories and", parts.length, "parts.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
