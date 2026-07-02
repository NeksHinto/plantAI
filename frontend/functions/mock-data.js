export const MOCK_USER = {
  id: "user-1",
  name: "Lucia",
};

export const HEALTH_STATUS = {
  SALUDABLE: "saludable",
  ATENCION: "atencion",
  CRITICO: "critico",
  MEJORANDO: "mejorando",
  SALUD_OPTIMA: "salud-optima",
  ALERTA: "alerta",
};

export const MOCK_ROOMS = [
  {
    id: "salon",
    name: "Salón",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=150&fit=crop",
    plantCount: 5,
    badStatePercent: 20,
    status: HEALTH_STATUS.ATENCION,
    isIndoors: true,
  },
  {
    id: "habitacion",
    name: "Habitación",
    image: "https://images.unsplash.com/photo-1616594039964-4083a934dfec?w=200&h=150&fit=crop",
    plantCount: 3,
    badStatePercent: 0,
    status: HEALTH_STATUS.SALUDABLE,
    isIndoors: true,
  },
  {
    id: "cocina",
    name: "Cocina",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=200&h=150&fit=crop",
    plantCount: 4,
    badStatePercent: 33,
    status: HEALTH_STATUS.ATENCION,
    isIndoors: true,
  },
  {
    id: "balcon",
    name: "Balcón",
    image: "https://images.unsplash.com/photo-1463320729081-f7551c9628f2?w=200&h=150&fit=crop",
    plantCount: 7,
    badStatePercent: 14,
    status: HEALTH_STATUS.ATENCION,
    isIndoors: false,
  },
  {
    id: "oficina",
    name: "Oficina",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200&h=150&fit=crop",
    plantCount: 2,
    badStatePercent: 0,
    status: HEALTH_STATUS.SALUDABLE,
    isIndoors: true,
  },
  {
    id: "terraza",
    name: "Terraza",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=200&h=150&fit=crop",
    plantCount: 4,
    badStatePercent: 50,
    status: HEALTH_STATUS.CRITICO,
    isIndoors: false,
  },
];

export const MOCK_PLANTS = [
  {
    id: "monstera-salon",
    name: "Monstera Deliciosa",
    roomId: "salon",
    roomName: "Salón",
    potType: "Maceta Grande",
    image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=200&h=200&fit=crop",
    status: HEALTH_STATUS.SALUDABLE,
  },
  {
    id: "ficus-salon",
    name: "Ficus Lyrata",
    roomId: "salon",
    roomName: "Salón",
    potType: "Maceta Mediana",
    image: "https://images.unsplash.com/photo-1593482892228-8a0e64342369?w=200&h=200&fit=crop",
    status: HEALTH_STATUS.ATENCION,
  },
  {
    id: "pothos-salon",
    name: "Pothos",
    roomId: "salon",
    roomName: "Salón",
    potType: "Maceta Colgante",
    image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=200&h=200&fit=crop",
    status: HEALTH_STATUS.SALUDABLE,
  },
  {
    id: "dracaena-salon",
    name: "Dracaena Marginata",
    roomId: "salon",
    roomName: "Salón",
    potType: "Maceta Alta",
    image: "https://images.unsplash.com/photo-1593482892228-8a0e64342369?w=200&h=200&fit=crop",
    status: HEALTH_STATUS.CRITICO,
  },
  {
    id: "luna",
    name: "Monstera 'Luna'",
    nickname: "Monstera 'Luna'",
    species: "Monstera Deliciosa",
    roomId: "salon",
    roomName: "Salón",
    potType: "Maceta Grande",
    image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=200&h=200&fit=crop",
    status: HEALTH_STATUS.MEJORANDO,
  },
  {
    id: "sansevieria-hab",
    name: "Sansevieria",
    roomId: "habitacion",
    roomName: "Habitación",
    potType: "Maceta Pequeña",
    image: "https://images.unsplash.com/photo-1593482892228-8a0e64342369?w=200&h=200&fit=crop",
    status: HEALTH_STATUS.SALUDABLE,
  },
  {
    id: "aloe-cocina",
    name: "Aloe Vera",
    roomId: "cocina",
    roomName: "Cocina",
    potType: "Maceta Pequeña",
    image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=200&h=200&fit=crop",
    status: HEALTH_STATUS.ATENCION,
  },
];

export const MOCK_PLANT_DETAIL = {
  id: "luna",
  nickname: "Monstera 'Luna'",
  species: "Monstera Deliciosa",
  image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=200&h=200&fit=crop",
  roomId: "salon",
  roomName: "Salón",
  history: [
    {
      id: "scan-1",
      date: "2023-10-28",
      time: "09:15",
      status: HEALTH_STATUS.SALUD_OPTIMA,
      label: "Salud Óptima",
      note: "Trasplante exitoso",
      scanResult: "Salud Óptima",
      image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=300&h=200&fit=crop",
    },
    {
      id: "scan-2",
      date: "2023-11-05",
      time: "14:30",
      status: HEALTH_STATUS.ALERTA,
      label: "Alerta",
      note: "Manchas amarillas detectadas",
      scanResult: "Deficiencia de nitrógeno",
      image: "https://images.unsplash.com/photo-1593482892228-8a0e64342369?w=300&h=200&fit=crop",
    },
    {
      id: "scan-3",
      date: "2023-11-18",
      time: "10:45",
      status: HEALTH_STATUS.MEJORANDO,
      label: "Mejorando",
      note: "Recuperación foliar",
      scanResult: "Mejorando",
      image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=300&h=200&fit=crop",
    },
    {
      id: "scan-4",
      date: "2023-12-01",
      time: "11:00",
      status: HEALTH_STATUS.SALUD_OPTIMA,
      label: "Salud Óptima",
      note: "Estado estable",
      scanResult: "Salud Óptima",
      image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=300&h=200&fit=crop",
    },
    {
      id: "scan-5",
      date: "2023-12-15",
      time: "16:20",
      status: HEALTH_STATUS.SALUD_OPTIMA,
      label: "Salud Óptima",
      note: "Crecimiento normal",
      scanResult: "Salud Óptima",
      image: "https://images.unsplash.com/photo-1614594975524-03f902a553bd?w=300&h=200&fit=crop",
    },
  ],
};

export const MOCK_SCAN_RESULT = {
  species: "Monstera Deliciosa",
  matchPercent: 96,
  healthStatus: HEALTH_STATUS.ALERTA,
  healthLabel: "Alerta de Salud - Deficiencia de Nitrógeno / Hongo Foliar",
  recommendation: "Aplicar fertilizante específico y reducir humedad ambiental.",
  image: "https://images.unsplash.com/photo-1593482892228-8a0e64342369?w=400&h=500&fit=crop",
  scannedAt: "2026-06-17T14:30:00",
};

export function getPlantsByRoom(roomId) {
  return MOCK_PLANTS.filter((plant) => plant.roomId === roomId);
}

export function getRoomById(roomId) {
  return MOCK_ROOMS.find((room) => room.id === roomId);
}

export function formatDate(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year.slice(2)}`;
}
