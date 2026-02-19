import { Fabric, Installer, ShapeType } from './types';

export const COMPANY_NAME = "World Wide Shades";
export const SEO_DESCRIPTION = "The world's first AI-powered custom window treatment platform. Design, visualize, and order custom roller shades with computer vision technology.";

export const DEFAULT_ROOM_IMAGE = "https://res.cloudinary.com/dcmlcfynd/image/upload/v1763580287/Visualizer_image_vsbovk.webp";

const CLOUD_NAME = 'dcmlcfynd'; 

export const getFabricUrl = (publicIdOrUrl: string, type: 'thumb' | 'texture') => {
  if (!publicIdOrUrl) return '';
  
  if (publicIdOrUrl.startsWith('http')) {
    if (publicIdOrUrl.includes('cloudinary.com')) {
        const parts = publicIdOrUrl.split('/upload/');
        if (parts.length === 2) {
            const transform = type === 'thumb' ? 'f_auto,q_auto,w_400,h_400,c_fill,g_auto/' : 'f_auto,q_auto,w_1000,c_scale/';
            return `${parts[0]}/upload/${transform}${parts[1]}`;
        }
    }
    return publicIdOrUrl;
  }

  const baseUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;
  return type === 'thumb' 
    ? `${baseUrl}/f_auto,q_auto,w_400,h_400,c_fill,g_auto/${publicIdOrUrl}` 
    : `${baseUrl}/f_auto,q_auto,w_1000,c_scale/${publicIdOrUrl}`;
};

export const STEPS = ['step.1', 'step.2', 'step.3', 'step.4', 'step.5', 'step.6', 'step.7', 'step.8'];
export const FRACTIONS = ['0', '1/8', '1/4', '3/8', '1/2', '5/8', '3/4', '7/8'];

export const VALANCE_OPTIONS = [
  { id: 'standard', label: 'Standard Roll', pricePerInch: 0, desc: 'Fabric rolls from the back.' },
  { id: 'reverse', label: 'Reverse Roll', pricePerInch: 0, desc: 'Fabric rolls from the front.' },
  { id: 'cassette', label: 'Cassette Valance', pricePerInch: 4.00, desc: 'Full architectural curved enclosure.' },
  { id: 'fascia', label: 'Metal Fascia', pricePerInch: 2.00, desc: 'Industrial flat-front metal cover.' }
];

export const SIDE_CHANNEL_OPTIONS = [
  { id: 'none', label: 'No Side Channels', pricePerFoot: 0 },
  { id: 'standard', label: 'Light Blocking Side Channels', pricePerFoot: 40 }
];

export const getInstallerForZip = (zip: string): Installer => {
  const prefix = zip.substring(0, 2);
  if (['07', '08', '10', '11', '12'].includes(prefix)) {
    return { id: "NY-2107", name: "Robert S.", location: `Bronx, NY ${zip}`, experienceYears: 38, rating: 4.9, reviews: 142, fees: { measure: 100, installPerUnit: 33, minimum: 125 } };
  }
  return { id: `USA-${zip.substring(0,3)}`, name: "Michael T.", location: `Local NBI Pro (${zip})`, experienceYears: 15, rating: 4.7, reviews: 75, fees: { measure: 95, installPerUnit: 35, minimum: 120 } };
};

export const SHAPE_CONFIGS: Record<ShapeType, { label: string, mask: string, diagram: string, inputs: { key: string, label: string }[] }> = {
  'Standard': { 
    label: 'Standard Rectangle', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895721/Bottom_Up_Rectangle_fuh9wo.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525899/Bottom_up_rectangle_jvenzj.webp', 
    inputs: [ { key: 'width', label: 'Width' }, { key: 'height', label: 'Height' } ] 
  },
  'Right Triangle (Left)': { 
    label: 'Right Triangle – Left', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895716/Right_Triangle_left_gcmcpz.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525899/Right_Triangle_Left_cxgpeb.webp', 
    inputs: [ 
      { key: 'width', label: 'Bottom Width' }, 
      { key: 'leftAngledLength', label: 'Left Angled Length' }, 
      { key: 'rightHeight', label: 'Right Height' } 
    ] 
  },
  'Right Triangle (Right)': { 
    label: 'Right Triangle – Right', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895723/Right_Triangle_Right_ewqoan.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525902/Right_Triangle_Right_k5xwbe.webp', 
    inputs: [ 
      { key: 'width', label: 'Bottom Width' }, 
      { key: 'leftHeight', label: 'Left Height' }, 
      { key: 'rightAngledLength', label: 'Right Angled Length' } 
    ] 
  },
  'Acute Triangle': { 
    label: 'Acute Triangle', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895721/Acute_Triangle_tlw47x.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525900/Acute_triangle_wdhqve.webp', 
    inputs: [ 
      { key: 'leftAngledLength', label: 'Left Angled Length' }, 
      { key: 'rightAngledLength', label: 'Right Angled Length' }, 
      { key: 'width', label: 'Bottom Width' }, 
      { key: 'centerHeight', label: 'Center Height' } 
    ] 
  },
  'Trapezoid Left': { 
    label: 'Trapezoid – Left', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895716/Trapezoid_Left_ofrqqd.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525902/Trapezoid_Left_ruvoph.webp', 
    inputs: [ { key: 'width', label: 'Bottom Width' }, { key: 'leftHeight', label: 'Left Height' }, { key: 'leftAngledLength', label: 'Left Angled Length' }, { key: 'rightHeight', label: 'Right Height' } ] 
  },
  'Trapezoid Right': { 
    label: 'Trapezoid – Right', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895719/Trapezoid_ksy87c.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525900/Trapezoid_Right_x7i9vk.webp', 
    inputs: [ 
      { key: 'leftHeight', label: 'Left Height' }, 
      { key: 'rightAngledLength', label: 'Right Angled Length' }, 
      { key: 'rightHeight', label: 'Right Height' }, 
      { key: 'width', label: 'Bottom Width' } 
    ] 
  },
  'Flat Top Trapezoid Right': { 
    label: 'Flat Top Trapezoid – Right', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895717/Flat_Top_Trapezoid_right_lvvk96.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525900/Flat_top_trapezoid_Right_ezlewd.webp', 
    inputs: [ 
      { key: 'topWidth', label: 'Top Width' }, 
      { key: 'width', label: 'Bottom Width' }, 
      { key: 'leftHeight', label: 'Left Height' }, 
      { key: 'rightAngledLength', label: 'Right Angled Length' }, 
      { key: 'rightHeight', label: 'Right Height' } 
    ] 
  },
  'Flat Top Trapezoid Left': { 
    label: 'Flat Top Trapezoid – Left', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895716/Trapezoid_Left_ofrqqd.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525902/Trapezoid_Left_ruvoph.webp', 
    inputs: [ 
      { key: 'width', label: 'Bottom Width' }, 
      { key: 'leftHeight', label: 'Left Height' }, 
      { key: 'leftAngledLength', label: 'Left Angled Length' }, 
      { key: 'rightHeight', label: 'Right Height' } 
    ] 
  },
  'Pentagon': { 
    label: 'Pentagon', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895717/Pentagon_cmdrjj.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525902/Pentagon_s61whw.webp', 
    inputs: [ 
      { key: 'leftAngledLength', label: 'Left Angled Length' }, 
      { key: 'rightAngledLength', label: 'Right Angled Length' }, 
      { key: 'rightHeight', label: 'Right Height' }, 
      { key: 'width', label: 'Bottom Width' }, 
      { key: 'leftHeight', label: 'Left Height' }, 
      { key: 'centerHeight', label: 'Center Height' } 
    ] 
  },
  'Flat Top Hexagon': { 
    label: 'Flat Top Hexagon', 
    mask: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764895722/Flat_Top_Hexagon_zlqbx3.png', 
    diagram: 'https://res.cloudinary.com/dcmlcfynd/image/upload/v1764525899/Flat_Top_Hexagon_hrxsvt.webp', 
    inputs: [ 
        { key: 'topWidth', label: 'Top Width' }, 
        { key: 'width', label: 'Bottom Width' }, 
        { key: 'leftHeight', label: 'Left Height' }, 
        { key: 'leftAngledLength', label: 'Left Angled Length' }, 
        { key: 'rightAngledLength', label: 'Right Angled Length' }, 
        { key: 'rightHeight', label: 'Right Height' }, 
        { key: 'centerHeight', label: 'Center Height' } 
    ] 
  }
};

// Official Master Pricing Tables
export const PRICE_TABLES: Record<string, number[][]> = {
  A: [
    [153, 175, 202, 238, 319, 387, 477, 503, 824, 872], [163, 190, 219, 262, 347, 419, 525, 553, 882, 932], [174, 207, 237, 284, 377, 450, 573, 604, 935, 990], [188, 220, 254, 309, 430, 475, 667, 704, 1047, 1112], [198, 237, 273, 332, 458, 508, 714, 755, 1102, 1173], [212, 252, 290, 355, 489, 539, 755, 805, 1158, 1234], [222, 265, 308, 380, 513, 572, 809, 855, 1212, 1294], [234, 280, 325, 403, 540, 602, 857, 905, 1269, 1355], [245, 295, 345, 482, 569, 632, 904, 957, 1324, 1414], [258, 312, 363, 504, 595, 697, 999, 1057, 1435, 1537],
  ],
  B: [
    [154, 184, 200, 238, 249, 333, 465, 508, 700, 745], [177, 213, 235, 282, 300, 393, 532, 577, 779, 828], [199, 242, 269, 324, 349, 449, 600, 647, 854, 910], [220, 272, 313, 370, 399, 507, 663, 717, 930, 995], [242, 299, 352, 414, 448, 565, 728, 785, 1007, 1078], [263, 328, 387, 458, 502, 622, 827, 822, 1062, 1158], [287, 357, 430, 502, 588, 684, 858, 924, 1158, 1244], [308, 387, 473, 545, 640, 738, 922, 993, 1234, 1327], [329, 415, 503, 589, 745, 798, 988, 1063, 1310, 1409], [350, 444, 537, 634, 795, 860, 1052, 1132, 1387, 1493],
  ],
  C: [
    [169, 202, 218, 259, 272, 364, 508, 554, 763, 813], [193, 233, 257, 307, 328, 428, 580, 629, 846, 903], [217, 264, 294, 354, 380, 490, 654, 704, 932, 993], [240, 297, 340, 404, 435, 553, 723, 782, 1014, 1085], [264, 327, 384, 452, 489, 618, 794, 857, 1098, 1175], [287, 358, 422, 499, 548, 679, 903, 895, 1158, 1263], [313, 389, 469, 548, 642, 745, 935, 1008, 1263, 1357], [335, 422, 517, 594, 699, 805, 1005, 1083, 1347, 1448], [359, 454, 549, 643, 813, 872, 1078, 1159, 1429, 1538], [383, 485, 587, 692, 868, 938, 1148, 1234, 1513, 1629],
  ],
  D: [
    [199, 242, 292, 334, 385, 464, 584, 618, 880, 939], [232, 284, 347, 397, 458, 535, 677, 718, 989, 1055], [263, 324, 397, 459, 533, 633, 770, 818, 1098, 1174], [294, 369, 448, 522, 605, 714, 865, 917, 1207, 1293], [324, 409, 502, 584, 675, 798, 959, 1014, 1317, 1412], [357, 449, 552, 645, 749, 883, 1052, 1113, 1424, 1530], [387, 490, 607, 708, 823, 964, 1147, 1212, 1535, 1649], [417, 534, 659, 770, 895, 1049, 1239, 1312, 1644, 1768], [449, 575, 708, 833, 968, 1132, 1333, 1408, 1753, 1885], [479, 615, 762, 897, 1039, 1213, 1428, 1507, 1863, 2003],
  ],
  E: [
    [234, 279, 307, 362, 380, 509, 710, 778, 1067, 1138], [270, 325, 359, 430, 460, 600, 814, 882, 1187, 1263], [304, 369, 410, 494, 533, 688, 917, 987, 1303, 1389], [337, 417, 478, 564, 608, 775, 1012, 1094, 1420, 1520], [369, 457, 537, 632, 687, 865, 1110, 1200, 1538, 1645], [402, 500, 592, 698, 768, 953, 1214, 1254, 1622, 1768], [438, 544, 655, 768, 899, 1043, 1309, 1413, 1768, 1900], [472, 592, 724, 833, 977, 1129, 1407, 1517, 1884, 2027], [504, 635, 770, 900, 1137, 1220, 1507, 1624, 2000, 2153], [534, 680, 822, 968, 1214, 1309, 1608, 1728, 2117, 2280],
  ],
  F: [
    [284, 347, 404, 479, 547, 539, 708, 724, 894, 975], [332, 404, 464, 572, 634, 755, 855, 897, 1065, 1159], [382, 459, 528, 637, 707, 838, 983, 1052, 1235, 1330], [430, 513, 588, 705, 784, 918, 1095, 1208, 1407, 1533], [478, 562, 644, 772, 855, 1005, 1185, 1363, 1578, 1719], [525, 615, 707, 893, 992, 1033, 1275, 1519, 1749, 1907], [575, 708, 802, 903, 1064, 1162, 1364, 1673, 1920, 2092], [625, 757, 862, 974, 1147, 1257, 1457, 1829, 2090, 2279], [674, 825, 944, 1068, 1217, 1334, 1547, 1985, 2260, 2467], [723, 892, 1023, 1168, 1290, 1415, 1637, 2140, 2432, 2652],
  ],
  G: [
    [304, 372, 433, 513, 730, 867, 903, 975, 1124, 1210], [355, 433, 497, 609, 824, 954, 1060, 1169, 1307, 1408], [408, 492, 564, 682, 902, 1042, 1197, 1335, 1489, 1592], [460, 548, 628, 754, 985, 1128, 1318, 1502, 1673, 1808], [512, 600, 688, 825, 1060, 1222, 1414, 1668, 1855, 2007], [562, 658, 755, 897, 1207, 1250, 1510, 1834, 2039, 2207], [615, 757, 858, 965, 1284, 1388, 1605, 1999, 2222, 2405], [669, 809, 922, 1042, 1372, 1490, 1703, 2167, 2404, 2605], [720, 883, 1009, 1143, 1448, 1573, 1800, 2333, 2585, 2805], [773, 954, 1094, 1249, 1527, 1659, 1897, 2499, 2769, 3004],
  ],
  H: [
    [322, 393, 458, 542, 773, 915, 954, 1040, 1188, 1279], [375, 458, 525, 644, 872, 1008, 1122, 1235, 1382, 1488], [432, 519, 597, 720, 953, 1102, 1264, 1412, 1574, 1682], [487, 579, 664, 797, 1040, 1192, 1393, 1587, 1768, 1910], [540, 635, 728, 873, 1122, 1290, 1494, 1763, 1962, 2120], [593, 695, 798, 948, 1275, 1322, 1597, 1939, 2155, 2333], [650, 800, 907, 1020, 1358, 1467, 1697, 2114, 2349, 2543], [708, 855, 974, 1102, 1450, 1575, 1800, 2289, 2540, 2754], [762, 933, 1067, 1208, 1530, 1663, 1903, 2465, 2733, 2965], [817, 1008, 1157, 1320, 1614, 1754, 2004, 2640, 2927, 3175],
  ],
  I: [
    [399, 487, 568, 672, 958, 1135, 1183, 1290, 1473, 1586], [465, 568, 651, 799, 1081, 1250, 1391, 1532, 1713, 1845], [535, 644, 740, 893, 1182, 1366, 1568, 1750, 1952, 2085], [603, 718, 824, 988, 1290, 1478, 1727, 1967, 2192, 2369], [670, 788, 903, 1082, 1391, 1600, 1853, 2186, 2432, 2629], [735, 862, 989, 1175, 1581, 1639, 1980, 2405, 2673, 2893], [806, 992, 1124, 1265, 1684, 1819, 2104, 2622, 2913, 3153], [878, 1061, 1208, 1366, 1798, 1953, 2232, 2839, 3150, 3415], [944, 1157, 1323, 1498, 1898, 2062, 2360, 3057, 3389, 3677], [1013, 1250, 1434, 1637, 2002, 2175, 2485, 3276, 3629, 3937],
  ],
};

export const SPECIALTY_PRICE_TABLE_1: number[][] = [
  [2885, 2934, 3424, 3481, 3562, 3630, 3698, 3759, 3961, 4493], [2922, 2988, 3496, 3568, 3661, 3741, 3819, 3887, 4094, 4647], [2958, 3041, 3565, 3649, 3763, 3842, 3924, 3998, 4216, 4790], [3003, 3102, 3636, 3734, 3842, 3935, 4025, 4112, 4339, 4939], [3045, 3157, 3703, 3803, 3918, 4019, 4124, 4218, 4457, 5084], [3091, 3215, 3769, 3874, 4001, 4113, 4228, 4333, 4581, 5233], [3133, 3268, 3827, 3941, 4076, 4201, 4324, 4442, 4701, 5376], [3179, 3323, 3886, 4012, 4159, 4293, 4429, 4555, 4826, 5528], [3226, 3378, 3942, 4131, 4236, 4381, 4527, 4665, 4945, 5672], [3284, 3436, 4004, 4149, 4318, 4475, 4629, 4777, 5068, 5818] 
];

// Size breakpoints (in inches)
export const SIZE_BREAKPOINTS = [36, 48, 60, 72, 84, 96, 108, 120, 132, 144];

export const getPriceFromTable = (
  priceGroup: string,
  widthInches: number,
  heightInches: number,
  isSpecialty: boolean = false
): number => {
  const table = isSpecialty 
    ? SPECIALTY_PRICE_TABLE_1 
    : PRICE_TABLES[priceGroup];
  
  if (!table) return 0;
  
  // Find nearest size indices. Rounding up to the next bracket.
  const widthIdx = SIZE_BREAKPOINTS.findIndex(s => widthInches <= s);
  const heightIdx = SIZE_BREAKPOINTS.findIndex(s => heightInches <= s);
  
  // Clamp to valid range (0-9). If index is -1 (meaning > 144), use the largest bracket (9).
  const w = widthIdx === -1 ? 9 : Math.max(0, Math.min(widthIdx, 9));
  const h = heightIdx === -1 ? 9 : Math.max(0, Math.min(heightIdx, 9));
  
  return table[h][w];
};

export const getGridPrice = (group: string, width: number, height: number, shape: ShapeType = 'Standard') => {
  return getPriceFromTable(group, width, height, shape !== 'Standard');
};

const ALL_FABRIC_URLS = [
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1761756245/woocommerce-placeholder.webp",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514050/fabrics/breezeguard-blackout-shades/odyssey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514048/fabrics/breezeguard-blackout-shades/tundra.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514047/fabrics/breezeguard-blackout-shades/nimbus.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514046/fabrics/breezeguard-blackout-shades/mist.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514045/fabrics/breezeguard-blackout-shades/limestone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514045/fabrics/breezeguard-blackout-shades/stone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514044/fabrics/breezeguard-blackout-shades/dune.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514043/fabrics/breezeguard-blackout-shades/porcelain.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514042/fabrics/breezeguard-blackout-shades/cloud.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514041/fabrics/breezeguard-blackout-shades/ice.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514040/fabrics/ecotherm-blackout-shades/flint.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514038/fabrics/ecotherm-blackout-shades/spice.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514037/fabrics/ecotherm-blackout-shades/shale.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514034/fabrics/ecotherm-blackout-shades/seagrass.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514033/fabrics/ecotherm-blackout-shades/pebble.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514032/fabrics/ecotherm-blackout-shades/sesame.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514031/fabrics/ecotherm-blackout-shades/parchment.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514029/fabrics/ecotherm-blackout-shades/cotton.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514028/fabrics/urbanview-blackout-shades/onyx.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514027/fabrics/urbanview-blackout-shades/porpoise.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514026/fabrics/urbanview-blackout-shades/graphite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514025/fabrics/urbanview-blackout-shades/canyon.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514024/fabrics/urbanview-blackout-shades/cocoa.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514023/fabrics/urbanview-blackout-shades/mushroom.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514021/fabrics/urbanview-blackout-shades/sand.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514020/fabrics/urbanview-blackout-shades/white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514019/fabrics/urbanview-blackout-shades/canvas.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514018/fabrics/urbanview-blackout-shades/wheat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514016/fabrics/urbanview-blackout-shades/merino.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514015/fabrics/urbanview-blackout-shades/birch.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514013/fabrics/skyshade-1p-light-filtering-shades/jutesmoke.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514012/fabrics/skyshade-1p-light-filtering-shades/jutefog.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759514010/fabrics/skyshade-1p-light-filtering-shades/seaglasscrystal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362196/test-wws-fabrics/urbanshade-blackout-shades-black-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362194/test-wws-fabrics/urbanshade-blackout-shades-graphite-graphite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362193/test-wws-fabrics/urbanshade-blackout-shades-pewter-pewter.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362191/test-wws-fabrics/urbanshade-blackout-shades-black-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362190/test-wws-fabrics/urbanshade-blackout-shades-graphite-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362188/test-wws-fabrics/urbanshade-blackout-shades-pewter-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362187/test-wws-fabrics/urbanshade-blackout-shades-khaki-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362185/test-wws-fabrics/urbanshade-blackout-shades-linen-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362184/test-wws-fabrics/urbanshade-blackout-shades-canvas-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362181/test-wws-fabrics/urbanshade-blackout-shades-frost-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362179/test-wws-fabrics/urbanshade-blackout-shades-chalk-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362178/test-wws-fabrics/urbanshade-blackout-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362176/test-wws-fabrics/breezeflex-blackout-shades-blanc.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362175/test-wws-fabrics/breezeflex-blackout-shades-sahel.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362174/test-wws-fabrics/breezeflex-blackout-shades-mississippi.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362172/test-wws-fabrics/breezeflex-blackout-shades-chartreux.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362170/test-wws-fabrics/breezeflex-blackout-shades-loutre.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362169/test-wws-fabrics/earthblock-1p-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362167/test-wws-fabrics/earthblock-1p-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362166/test-wws-fabrics/earthblock-1p-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362164/test-wws-fabrics/earthblock-1p-light-filtering-shades-pearl-grey-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362162/test-wws-fabrics/earthblock-1p-light-filtering-shades-pearl-grey-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362160/test-wws-fabrics/earthblock-1p-light-filtering-shades-white-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362158/test-wws-fabrics/earthblock-1p-light-filtering-shades-linen-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362156/test-wws-fabrics/earthblock-1p-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362154/test-wws-fabrics/earthblock-1p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362152/test-wws-fabrics/solarblock-1-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362151/test-wws-fabrics/solarblock-1-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362149/test-wws-fabrics/solarblock-1-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362148/test-wws-fabrics/solarblock-1-light-filtering-shades-pearl-grey-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362145/test-wws-fabrics/solarblock-1-light-filtering-shades-pearl-grey-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362143/test-wws-fabrics/solarblock-1-light-filtering-shades-white-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362142/test-wws-fabrics/solarblock-1-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362140/test-wws-fabrics/solarblock-1-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362139/test-wws-fabrics/solarblock-1-light-filtering-shades-wow-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362137/test-wws-fabrics/naturescreen-3p-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362135/test-wws-fabrics/naturescreen-3p-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362133/test-wws-fabrics/naturescreen-3p-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362131/test-wws-fabrics/naturescreen-3p-light-filtering-shades-white-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362130/test-wws-fabrics/naturescreen-3p-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362128/test-wws-fabrics/naturescreen-3p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362126/test-wws-fabrics/lumiscreen-3-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362112/test-wws-fabrics/lumiscreen-3-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362109/test-wws-fabrics/lumiscreen-3-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362108/test-wws-fabrics/lumiscreen-3-light-filtering-shades-pearl-grey-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362106/test-wws-fabrics/lumiscreen-3-light-filtering-shades-pearl-grey-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362105/test-wws-fabrics/lumiscreen-3-light-filtering-shades-white-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362103/test-wws-fabrics/lumiscreen-3-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362102/test-wws-fabrics/lumiscreen-3-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362101/test-wws-fabrics/greenshade-5p-light-filtering-shades-charcoal-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362099/test-wws-fabrics/greenshade-5p-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362097/test-wws-fabrics/greenshade-5p-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362096/test-wws-fabrics/greenshade-5p-light-filtering-shades-pearl-grey-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362091/test-wws-fabrics/greenshade-5p-light-filtering-shades-pearl-grey-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362089/test-wws-fabrics/greenshade-5p-light-filtering-shades-white-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362088/test-wws-fabrics/greenshade-5p-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362086/test-wws-fabrics/greenshade-5p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362085/test-wws-fabrics/vistashade-5-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362084/test-wws-fabrics/vistashade-5-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362082/test-wws-fabrics/vistashade-5-light-filtering-shades-charcoal-sand-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362080/test-wws-fabrics/vistashade-5-light-filtering-shades-charcoal-white-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362078/test-wws-fabrics/vistashade-5-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362076/test-wws-fabrics/vistashade-5-light-filtering-shades-pearl-grey-white-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362075/test-wws-fabrics/vistashade-5-light-filtering-shades-pearl-grey-sand-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362074/test-wws-fabrics/vistashade-5-light-filtering-shades-pearl-grey-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362072/test-wws-fabrics/vistashade-5-light-filtering-shades-pearl-grey-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362071/test-wws-fabrics/vistashade-5-light-filtering-shades-white-white-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362069/test-wws-fabrics/vistashade-5-light-filtering-shades-white-sand-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362068/test-wws-fabrics/vistashade-5-light-filtering-shades-white-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362067/test-wws-fabrics/vistashade-5-light-filtering-shades-white-turquoise.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362065/test-wws-fabrics/vistashade-5-light-filtering-shades-white-pistache.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362063/test-wws-fabrics/vistashade-5-light-filtering-shades-white-mandarine.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362061/test-wws-fabrics/vistashade-5-light-filtering-shades-white-yellow.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362060/test-wws-fabrics/vistashade-5-light-filtering-shades-linen-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362058/test-wws-fabrics/vistashade-5-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362056/test-wws-fabrics/vistashade-5-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362055/test-wws-fabrics/vistashade-5-light-filtering-shades-wow-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362053/test-wws-fabrics/ecoview-10p-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362052/test-wws-fabrics/ecoview-10p-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362050/test-wws-fabrics/ecoview-10p-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362047/test-wws-fabrics/ecoview-10p-light-filtering-shades-white-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362045/test-wws-fabrics/ecoview-10p-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362044/test-wws-fabrics/ecoview-10p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362042/test-wws-fabrics/clearview-10-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362041/test-wws-fabrics/clearview-10-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362039/test-wws-fabrics/clearview-10-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362038/test-wws-fabrics/clearview-10-light-filtering-shades-pearl-grey-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362036/test-wws-fabrics/clearview-10-light-filtering-shades-pearl-grey-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362034/test-wws-fabrics/clearview-10-light-filtering-shades-white-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362032/test-wws-fabrics/clearview-10-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362030/test-wws-fabrics/clearview-10-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362028/test-wws-fabrics/clearview-10-light-filtering-shades-wow-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362026/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-teal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362023/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-noir.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362021/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-navy-blue.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362019/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-lake-blue.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362016/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-blue-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362013/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-stone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362011/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-vanilla.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362009/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-light-blue.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362006/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-light-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362004/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-shadow.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759362001/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-sand.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361999/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-natural.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361996/test-wws-fabrics/luxe-verona-5p-light-filtering-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361994/test-wws-fabrics/desertfade-blackout-shades-ebony.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361991/test-wws-fabrics/desertfade-blackout-shades-espresso.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361989/test-wws-fabrics/desertfade-blackout-shades-desert.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361987/test-wws-fabrics/desertfade-blackout-shades-cloud.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361984/test-wws-fabrics/desertfade-blackout-shades-almond.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361982/test-wws-fabrics/desertfade-blackout-shades-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361980/test-wws-fabrics/desertfade-blackout-shades-polar.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361975/test-wws-fabrics/thermoshield-1-light-filtering-shades-espresso.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361974/test-wws-fabrics/thermoshield-1-light-filtering-shades-mocha.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361972/test-wws-fabrics/thermoshield-1-light-filtering-shades-toffee.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361971/test-wws-fabrics/thermoshield-1-light-filtering-shades-cappuccino.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361970/test-wws-fabrics/thermoshield-1-light-filtering-shades-cream.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361968/test-wws-fabrics/thermoshield-1-light-filtering-shades-charcoal-charcoal-iron.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361967/test-wws-fabrics/thermoshield-1-light-filtering-shades-charcoal-charcoal-steel.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361965/test-wws-fabrics/thermoshield-1-light-filtering-shades-charcoal-grey-stone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361964/test-wws-fabrics/thermoshield-1-light-filtering-shades-charcoal-grey-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361962/test-wws-fabrics/thermoshield-1-light-filtering-shades-charcoal-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361961/test-wws-fabrics/thermoshield-1-light-filtering-shades-pearl-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361960/test-wws-fabrics/thermoshield-1-light-filtering-shades-pearl-charcoal-fawn.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361958/test-wws-fabrics/thermoshield-1-light-filtering-shades-pearl-stone-fawn.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361957/test-wws-fabrics/thermoshield-1-light-filtering-shades-white-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361956/test-wws-fabrics/thermoshield-1-light-filtering-shades-white-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361954/test-wws-fabrics/thermoshield-1-light-filtering-shades-white-white-steel.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361953/test-wws-fabrics/thermoshield-1-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361951/test-wws-fabrics/armorweave-blackout-shades-black-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361950/test-wws-fabrics/armorweave-blackout-shades-black-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361949/test-wws-fabrics/armorweave-blackout-shades-emery-emery.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361947/test-wws-fabrics/armorweave-blackout-shades-emery-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361945/test-wws-fabrics/armorweave-blackout-shades-pewter-pewter.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361943/test-wws-fabrics/armorweave-blackout-shades-pewter-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361942/test-wws-fabrics/armorweave-blackout-shades-gypsum-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361940/test-wws-fabrics/armorweave-blackout-shades-chalk-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361939/test-wws-fabrics/armorweave-blackout-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361937/test-wws-fabrics/zipguard-5-light-filtering-shades-graphite-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361935/test-wws-fabrics/zipguard-5-light-filtering-shades-grey-pepper.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361933/test-wws-fabrics/zipguard-5-light-filtering-shades-sandalwood.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361931/test-wws-fabrics/zipguard-5-light-filtering-shades-volcano.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361930/test-wws-fabrics/zipguard-5-light-filtering-shades-shadow.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361927/test-wws-fabrics/zipguard-5-light-filtering-shades-sea-urchin.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361925/test-wws-fabrics/zipguard-5-light-filtering-shades-sea-lion.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361923/test-wws-fabrics/zipguard-5-light-filtering-shades-lunar-surface.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361921/test-wws-fabrics/zipguard-5-light-filtering-shades-tundra.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361919/test-wws-fabrics/zipguard-5-light-filtering-shades-mistral.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361917/test-wws-fabrics/zipguard-5-light-filtering-shades-macadamia.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361915/test-wws-fabrics/zipguard-5-light-filtering-shades-natural.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361913/test-wws-fabrics/zipguard-5-light-filtering-shades-cumulus.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361911/test-wws-fabrics/zipguard-5-light-filtering-shades-edelweiss.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361909/test-wws-fabrics/zipguard-5-light-filtering-shades-frost-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361907/test-wws-fabrics/softweave-3-light-filtering-shades-mahogany.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361906/test-wws-fabrics/softweave-3-light-filtering-shades-mocha.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361904/test-wws-fabrics/softweave-3-light-filtering-shades-tannin.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361902/test-wws-fabrics/softweave-3-light-filtering-shades-coffee-bean.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361900/test-wws-fabrics/softweave-3-light-filtering-shades-tornado.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361898/test-wws-fabrics/softweave-3-light-filtering-shades-cobalt.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361896/test-wws-fabrics/softweave-3-light-filtering-shades-twilight.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361894/test-wws-fabrics/softweave-3-light-filtering-shades-pacific.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361892/test-wws-fabrics/softweave-3-light-filtering-shades-shore.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361891/test-wws-fabrics/softweave-3-light-filtering-shades-opaline.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361889/test-wws-fabrics/softweave-3-light-filtering-shades-elephant.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361887/test-wws-fabrics/softweave-3-light-filtering-shades-celestial.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361885/test-wws-fabrics/softweave-3-light-filtering-shades-maple.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361883/test-wws-fabrics/softweave-3-light-filtering-shades-biscuit.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361881/test-wws-fabrics/softweave-3-light-filtering-shades-rope.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361879/test-wws-fabrics/softweave-3-light-filtering-shades-reed.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361877/test-wws-fabrics/softweave-3-light-filtering-shades-flower-bud.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361876/test-wws-fabrics/softweave-3-light-filtering-shades-citrine.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361874/test-wws-fabrics/softweave-3-light-filtering-shades-turmeric.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361872/test-wws-fabrics/softweave-3-light-filtering-shades-wheat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361870/test-wws-fabrics/softweave-3-light-filtering-shades-glacier.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361868/test-wws-fabrics/softweave-3-light-filtering-shades-raffia.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361867/test-wws-fabrics/softweave-3-light-filtering-shades-agate-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361865/test-wws-fabrics/softweave-3-light-filtering-shades-flint.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361863/test-wws-fabrics/softweave-3-light-filtering-shades-mother-of-pearl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361861/test-wws-fabrics/softweave-3-light-filtering-shades-carrara.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361859/test-wws-fabrics/softweave-3-light-filtering-shades-jasmine.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361857/test-wws-fabrics/softweave-3-light-filtering-shades-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361855/test-wws-fabrics/loopmesh-3p-light-filtering-shades-steel-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361853/test-wws-fabrics/loopmesh-3p-light-filtering-shades-alloy.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361851/test-wws-fabrics/loopmesh-3p-light-filtering-shades-oxygen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361850/test-wws-fabrics/loopmesh-3p-light-filtering-shades-silver.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361848/test-wws-fabrics/loopmesh-3p-light-filtering-shades-oatmeal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361847/test-wws-fabrics/loopmesh-3p-light-filtering-shades-cream.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361845/test-wws-fabrics/loopmesh-3p-light-filtering-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361843/test-wws-fabrics/loopmesh-3p-light-filtering-shades-optical-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361841/test-wws-fabrics/totalblock-0p-light-filtering-shades-snow-white-opaque-white.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361838/test-wws-fabrics/totalblock-0p-light-filtering-shades-anthracite-opaque-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361836/test-wws-fabrics/totalblock-0p-light-filtering-shades-medium-grey-opaque-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361834/test-wws-fabrics/totalblock-0p-light-filtering-shades-clay-opaque-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361833/test-wws-fabrics/totalblock-0p-light-filtering-shades-light-grey-opaque-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361831/test-wws-fabrics/totalblock-0p-light-filtering-shades-hemp-opaque-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361829/test-wws-fabrics/totalblock-0p-light-filtering-shades-quartz-opaque-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361828/test-wws-fabrics/totalblock-0p-light-filtering-shades-aluminium-opaque-alu.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361826/test-wws-fabrics/totalblock-0p-light-filtering-shades-spume-opaque-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361824/test-wws-fabrics/totalblock-0p-light-filtering-shades-snow-white-opaque-alu.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361822/test-wws-fabrics/totalblock-0p-light-filtering-shades-blanc-lowe.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361820/test-wws-fabrics/totalblock-0p-light-filtering-shades-black-snow-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361818/test-wws-fabrics/totalblock-0p-light-filtering-shades-anthracite-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361817/test-wws-fabrics/totalblock-0p-light-filtering-shades-elephant-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361815/test-wws-fabrics/totalblock-0p-light-filtering-shades-clay-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361813/test-wws-fabrics/totalblock-0p-light-filtering-shades-crane-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361811/test-wws-fabrics/totalblock-0p-light-filtering-shades-medium-grey-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361809/test-wws-fabrics/totalblock-0p-light-filtering-shades-fjord-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361808/test-wws-fabrics/totalblock-0p-light-filtering-shades-shower-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361806/test-wws-fabrics/totalblock-0p-light-filtering-shades-light-grey-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361804/test-wws-fabrics/totalblock-0p-light-filtering-shades-green-tea-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361803/test-wws-fabrics/totalblock-0p-light-filtering-shades-spume-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361801/test-wws-fabrics/totalblock-0p-light-filtering-shades-alu-alu.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361799/test-wws-fabrics/totalblock-0p-light-filtering-shades-nashi-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361797/test-wws-fabrics/totalblock-0p-light-filtering-shades-sandy-beige-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361795/test-wws-fabrics/totalblock-0p-light-filtering-shades-arena-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361794/test-wws-fabrics/totalblock-0p-light-filtering-shades-thermal-water-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361792/test-wws-fabrics/totalblock-0p-light-filtering-shades-hemp-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361791/test-wws-fabrics/totalblock-0p-light-filtering-shades-tahini-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361789/test-wws-fabrics/totalblock-0p-light-filtering-shades-quartz-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361787/test-wws-fabrics/totalblock-0p-light-filtering-shades-pina-colada-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361785/test-wws-fabrics/totalblock-0p-light-filtering-shades-snow-white-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361783/test-wws-fabrics/totalblock-0p-light-filtering-shades-anthracite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361782/test-wws-fabrics/totalblock-0p-light-filtering-shades-medium-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361780/test-wws-fabrics/totalblock-0p-light-filtering-shades-light-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361778/test-wws-fabrics/totalblock-0p-light-filtering-shades-clay.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361776/test-wws-fabrics/totalblock-0p-light-filtering-shades-sandy-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361775/test-wws-fabrics/totalblock-0p-light-filtering-shades-spume.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361773/test-wws-fabrics/totalblock-0p-light-filtering-shades-hemp.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361771/test-wws-fabrics/totalblock-0p-light-filtering-shades-quartz.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361769/test-wws-fabrics/totalblock-0p-light-filtering-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361767/test-wws-fabrics/totalblock-0p-light-filtering-shades-snow-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361765/test-wws-fabrics/dayglow-3-light-filtering-shades-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361763/test-wws-fabrics/dayglow-3-light-filtering-shades-anthracite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361761/test-wws-fabrics/dayglow-3-light-filtering-shades-platinum.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361759/test-wws-fabrics/dayglow-3-light-filtering-shades-midnight-blue.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361758/test-wws-fabrics/dayglow-3-light-filtering-shades-atlantis.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361756/test-wws-fabrics/dayglow-3-light-filtering-shades-acapulco.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361754/test-wws-fabrics/dayglow-3-light-filtering-shades-lime-blossom.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361752/test-wws-fabrics/dayglow-3-light-filtering-shades-citrus.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361750/test-wws-fabrics/dayglow-3-light-filtering-shades-aureolin.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361748/test-wws-fabrics/dayglow-3-light-filtering-shades-caramel.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361746/test-wws-fabrics/dayglow-3-light-filtering-shades-red.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361743/test-wws-fabrics/dayglow-3-light-filtering-shades-jungle.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361741/test-wws-fabrics/dayglow-3-light-filtering-shades-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361739/test-wws-fabrics/dayglow-3-light-filtering-shades-taupe.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361737/test-wws-fabrics/dayglow-3-light-filtering-shades-boulder.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361735/test-wws-fabrics/dayglow-3-light-filtering-shades-cloud.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361733/test-wws-fabrics/dayglow-3-light-filtering-shades-sandy-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361731/test-wws-fabrics/dayglow-3-light-filtering-shades-vanilla.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361728/test-wws-fabrics/dayglow-3-light-filtering-shades-off-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361726/test-wws-fabrics/dayglow-3-light-filtering-shades-new-shea.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361724/test-wws-fabrics/dayglow-3-light-filtering-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361722/test-wws-fabrics/ultrashield-4-light-filtering-shades-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361721/test-wws-fabrics/ultrashield-4-light-filtering-shades-alu-anthracite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361719/test-wws-fabrics/ultrashield-4-light-filtering-shades-alu-medium-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361717/test-wws-fabrics/ultrashield-4-light-filtering-shades-alu-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361715/test-wws-fabrics/ultrashield-4-light-filtering-shades-alu-oat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361714/test-wws-fabrics/ultrashield-4-light-filtering-shades-alu-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361712/test-wws-fabrics/ultrashield-4-light-filtering-shades-deep-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361710/test-wws-fabrics/ultrashield-4-light-filtering-shades-beetle.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361708/test-wws-fabrics/ultrashield-4-light-filtering-shades-beaten-metal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361706/test-wws-fabrics/ultrashield-4-light-filtering-shades-copper.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361704/test-wws-fabrics/ultrashield-4-light-filtering-shades-gold.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361702/test-wws-fabrics/ultrashield-4-light-filtering-shades-red.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361700/test-wws-fabrics/ultrashield-4-light-filtering-shades-deep-blue.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361698/test-wws-fabrics/ultrashield-4-light-filtering-shades-aniseed.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361696/test-wws-fabrics/ultrashield-4-light-filtering-shades-orange.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361694/test-wws-fabrics/ultrashield-4-light-filtering-shades-lagoon.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361692/test-wws-fabrics/ultrashield-4-light-filtering-shades-buttercup.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361690/test-wws-fabrics/ultrashield-4-light-filtering-shades-deep-red.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361688/test-wws-fabrics/ultrashield-4-light-filtering-shades-tennis-green.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361686/test-wws-fabrics/ultrashield-4-light-filtering-shades-green-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361684/test-wws-fabrics/ultrashield-4-light-filtering-shades-moss-green.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361683/test-wws-fabrics/ultrashield-4-light-filtering-shades-anthracite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361681/test-wws-fabrics/ultrashield-4-light-filtering-shades-celestial-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361679/test-wws-fabrics/ultrashield-4-light-filtering-shades-dark-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361677/test-wws-fabrics/ultrashield-4-light-filtering-shades-concrete.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361676/test-wws-fabrics/ultrashield-4-light-filtering-shades-boulder.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361673/test-wws-fabrics/ultrashield-4-light-filtering-shades-cloud.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361671/test-wws-fabrics/ultrashield-4-light-filtering-shades-havana-brown.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361669/test-wws-fabrics/ultrashield-4-light-filtering-shades-shea.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361667/test-wws-fabrics/ultrashield-4-light-filtering-shades-quartz.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361665/test-wws-fabrics/ultrashield-4-light-filtering-shades-taupe.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361663/test-wws-fabrics/ultrashield-4-light-filtering-shades-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361661/test-wws-fabrics/ultrashield-4-light-filtering-shades-brick.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361658/test-wws-fabrics/ultrashield-4-light-filtering-shades-pepper.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361655/test-wws-fabrics/ultrashield-4-light-filtering-shades-sandy-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361653/test-wws-fabrics/ultrashield-4-light-filtering-shades-hemp.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361651/test-wws-fabrics/ultrashield-4-light-filtering-shades-champagne.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361649/test-wws-fabrics/ultrashield-4-light-filtering-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361647/test-wws-fabrics/ultrashield-4-light-filtering-shades-snow-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361645/test-wws-fabrics/vistaview-5p-light-filtering-shades-pebble-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361643/test-wws-fabrics/vistaview-5p-light-filtering-shades-sand.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361641/test-wws-fabrics/vistaview-5p-light-filtering-shades-off-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361639/test-wws-fabrics/vistaview-5p-light-filtering-shades-white-lowe.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361637/test-wws-fabrics/vistaview-5p-light-filtering-shades-aluminium.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361635/test-wws-fabrics/vistaview-5p-light-filtering-shades-deep-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361633/test-wws-fabrics/vistaview-5p-light-filtering-shades-anthracite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361631/test-wws-fabrics/vistaview-5p-light-filtering-shades-dark-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361627/test-wws-fabrics/vistaview-5p-light-filtering-shades-concrete.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361626/test-wws-fabrics/vistaview-5p-light-filtering-shades-boulder.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361624/test-wws-fabrics/vistaview-5p-light-filtering-shades-green-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361622/test-wws-fabrics/vistaview-5p-light-filtering-shades-taupe.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361620/test-wws-fabrics/vistaview-5p-light-filtering-shades-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361618/test-wws-fabrics/vistaview-5p-light-filtering-shades-brick.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361616/test-wws-fabrics/vistaview-5p-light-filtering-shades-pepper.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361614/test-wws-fabrics/vistaview-5p-light-filtering-shades-sandy-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361611/test-wws-fabrics/vistaview-5p-light-filtering-shades-hemp.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361609/test-wws-fabrics/vistaview-5p-light-filtering-shades-champagne.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361608/test-wws-fabrics/vistaview-5p-light-filtering-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361605/test-wws-fabrics/vistaview-5p-light-filtering-shades-snow-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361603/test-wws-fabrics/vistaview-5p-light-filtering-shades-celestial-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361601/test-wws-fabrics/solarlite-4p-light-filtering-shades-alu-anthracite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361599/test-wws-fabrics/solarlite-4p-light-filtering-shades-alu-alu.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361597/test-wws-fabrics/solarlite-4p-light-filtering-shades-alu-oat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361595/test-wws-fabrics/solarlite-4p-light-filtering-shades-alu-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361593/test-wws-fabrics/solarlite-4p-light-filtering-shades-deep-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361591/test-wws-fabrics/solarlite-4p-light-filtering-shades-anthracite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361589/test-wws-fabrics/solarlite-4p-light-filtering-shades-concrete.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361587/test-wws-fabrics/solarlite-4p-light-filtering-shades-beaten-metal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361585/test-wws-fabrics/solarlite-4p-light-filtering-shades-deep-blue.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361583/test-wws-fabrics/solarlite-4p-light-filtering-shades-aniseed.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361580/test-wws-fabrics/solarlite-4p-light-filtering-shades-orange.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361579/test-wws-fabrics/solarlite-4p-light-filtering-shades-buttercup.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361576/test-wws-fabrics/solarlite-4p-light-filtering-shades-deep-red.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361574/test-wws-fabrics/solarlite-4p-light-filtering-shades-red.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361572/test-wws-fabrics/solarlite-4p-light-filtering-shades-moss-green.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361570/test-wws-fabrics/solarlite-4p-light-filtering-shades-boulder.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361568/test-wws-fabrics/solarlite-4p-light-filtering-shades-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361566/test-wws-fabrics/solarlite-4p-light-filtering-shades-brick.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361564/test-wws-fabrics/solarlite-4p-light-filtering-shades-pepper.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361562/test-wws-fabrics/solarlite-4p-light-filtering-shades-sandy-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361560/test-wws-fabrics/solarlite-4p-light-filtering-shades-champagne.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361558/test-wws-fabrics/solarlite-4p-light-filtering-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361556/test-wws-fabrics/solarlite-4p-light-filtering-shades-snow-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361554/test-wws-fabrics/silklight-blackout-shades-pumpernickel.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361552/test-wws-fabrics/silklight-blackout-shades-buckwheat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361550/test-wws-fabrics/silklight-blackout-shades-rye.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361549/test-wws-fabrics/silklight-blackout-shades-poppyseed.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361547/test-wws-fabrics/silklight-blackout-shades-barley.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361545/test-wws-fabrics/silklight-blackout-shades-oat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361544/test-wws-fabrics/silent-haven-blackout-shades-lava.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361541/test-wws-fabrics/silent-haven-blackout-shades-baltic.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361537/test-wws-fabrics/silent-haven-blackout-shades-slate.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361534/test-wws-fabrics/silent-haven-blackout-shades-mineral.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361530/test-wws-fabrics/silent-haven-blackout-shades-suede.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759361527/test-wws-fabrics/silent-haven-blackout-shades-fossil.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336300/test-wws-fabrics/silent-haven-blackout-shades-truffle.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336290/test-wws-fabrics/silent-haven-blackout-shades-ceramic.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336287/test-wws-fabrics/silent-haven-blackout-shades-limestone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336284/test-wws-fabrics/silent-haven-blackout-shades-marble.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336281/test-wws-fabrics/silent-haven-blackout-shades-plaster.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336278/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-lava.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336275/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-baltic.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336272/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-slate.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336268/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-mineral.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336265/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-suede.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336262/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-fossil.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336258/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-truffle.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336255/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-ceramic.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336251/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-limestone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336247/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-marble.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336244/test-wws-fabrics/tranquil-haven-3p-light-filtering-shades-plaster.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336241/test-wws-fabrics/solarsoft-3-light-filtering-shades-peppercorn.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336240/test-wws-fabrics/solarsoft-3-light-filtering-shades-granite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336238/test-wws-fabrics/solarsoft-3-light-filtering-shades-ginger.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336237/test-wws-fabrics/solarsoft-3-light-filtering-shades-nougat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336234/test-wws-fabrics/solarsoft-3-light-filtering-shades-papyrus.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336233/test-wws-fabrics/solarsoft-3-light-filtering-shades-cork.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336230/test-wws-fabrics/solarsoft-3-light-filtering-shades-jute.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336228/test-wws-fabrics/solarsoft-3-light-filtering-shades-seasalt.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336227/test-wws-fabrics/solarsoft-3-light-filtering-shades-marble.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336225/test-wws-fabrics/solarsoft-3-light-filtering-shades-porcelain.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336223/test-wws-fabrics/coastal-luxe-5-light-filtering-shades-ink.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336222/test-wws-fabrics/coastal-luxe-5-light-filtering-shades-steel.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336220/test-wws-fabrics/coastal-luxe-5-light-filtering-shades-monsoon.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336219/test-wws-fabrics/coastal-luxe-5-light-filtering-shades-pearl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336217/test-wws-fabrics/coastal-luxe-5-light-filtering-shades-horizon.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336215/test-wws-fabrics/coastal-luxe-5-light-filtering-shades-angora.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336213/test-wws-fabrics/coastal-luxe-5-light-filtering-shades-melody.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336211/test-wws-fabrics/coastal-luxe-5-blackout-shades-quartz.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336209/test-wws-fabrics/coastal-luxe-5-blackout-shades-summer-storm.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336208/test-wws-fabrics/coastal-luxe-5-blackout-shades-iron.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336207/test-wws-fabrics/coastal-luxe-5-blackout-shades-porpoise.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336205/test-wws-fabrics/coastal-luxe-5-blackout-shades-merino.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336204/test-wws-fabrics/coastal-luxe-5-blackout-shades-jasmine.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336202/test-wws-fabrics/coastal-luxe-5-blackout-shades-gull.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336201/test-wws-fabrics/coastal-luxe-5-blackout-shades-lyric.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336199/test-wws-fabrics/coastal-luxe-5-blackout-shades-quill.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336198/test-wws-fabrics/stoneview-blackout-shades-black-facade.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336195/test-wws-fabrics/stoneview-blackout-shades-storm-facade.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336192/test-wws-fabrics/stoneview-blackout-shades-slate-fa%C3%A7ade.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336190/test-wws-fabrics/stoneview-blackout-shades-tuxedo-fa%C3%A7ade.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336187/test-wws-fabrics/stoneview-blackout-shades-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336184/test-wws-fabrics/stoneview-blackout-shades-storm.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336182/test-wws-fabrics/stoneview-blackout-shades-slate.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336179/test-wws-fabrics/stoneview-blackout-shades-seal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336176/test-wws-fabrics/stoneview-blackout-shades-dune.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336174/test-wws-fabrics/stoneview-blackout-shades-mist.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336171/test-wws-fabrics/stoneview-blackout-shades-quill.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336169/test-wws-fabrics/stoneview-blackout-shades-nougat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336167/test-wws-fabrics/stoneview-blackout-shades-moonstone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336164/test-wws-fabrics/stoneview-blackout-shades-pearl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336162/test-wws-fabrics/stoneview-blackout-shades-ice-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336159/test-wws-fabrics/stoneview-blackout-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336156/test-wws-fabrics/stoneview-blackout-shades-dove-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336154/test-wws-fabrics/microview-4-light-filtering-shades-charcoal-cocoa.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336153/test-wws-fabrics/microview-4-light-filtering-shades-charcoal-apricot.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336151/test-wws-fabrics/microview-4-light-filtering-shades-charcoal-sable.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336149/test-wws-fabrics/microview-4-light-filtering-shades-linen-sable-cocoa.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336147/test-wws-fabrics/microview-4-light-filtering-shades-linen-stone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336146/test-wws-fabrics/microview-4-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336145/test-wws-fabrics/microview-4-light-filtering-shades-white-stone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336144/test-wws-fabrics/microview-4-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336142/test-wws-fabrics/microview-4-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336141/test-wws-fabrics/microview-4-light-filtering-shades-pearl-pearl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336138/test-wws-fabrics/microview-4-light-filtering-shades-pearl-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336137/test-wws-fabrics/microview-4-light-filtering-shades-white-pearl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336135/test-wws-fabrics/microview-4-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336134/test-wws-fabrics/nightshade-blackout-shades-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336131/test-wws-fabrics/nightshade-blackout-shades-graphite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336128/test-wws-fabrics/nightshade-blackout-shades-shale.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336125/test-wws-fabrics/nightshade-blackout-shades-pumice.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336122/test-wws-fabrics/nightshade-blackout-shades-alloy.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336119/test-wws-fabrics/nightshade-blackout-shades-barley.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336116/test-wws-fabrics/nightshade-blackout-shades-ice.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336113/test-wws-fabrics/pureshade-5p-light-filtering-shades-black.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336110/test-wws-fabrics/pureshade-5p-light-filtering-shades-graphite.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336106/test-wws-fabrics/pureshade-5p-light-filtering-shades-raven.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336103/test-wws-fabrics/pureshade-5p-light-filtering-shades-ash.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336099/test-wws-fabrics/pureshade-5p-light-filtering-shades-canyon.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336096/test-wws-fabrics/pureshade-5p-light-filtering-shades-alloy.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336093/test-wws-fabrics/pureshade-5p-light-filtering-shades-barley.png",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336090/test-wws-fabrics/pureshade-5p-light-filtering-shades-pure-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336087/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-slate.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336086/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-bark.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336084/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-midnight.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336083/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-nickel.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336081/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-barley.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336080/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-stone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336078/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-wheat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336077/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-almond.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336075/test-wws-fabrics/infinity-veil-3p-light-filtering-shades-cotton.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336074/test-wws-fabrics/feathermesh-blackout-shades-blanc.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336073/test-wws-fabrics/feathermesh-blackout-shades-sahel.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336071/test-wws-fabrics/feathermesh-blackout-shades-mississippi.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336070/test-wws-fabrics/feathermesh-blackout-shades-chartreux.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336068/test-wws-fabrics/feathermesh-blackout-shades-loutre.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336067/test-wws-fabrics/luxetone-blackout-shades-obsidian.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336065/test-wws-fabrics/luxetone-blackout-shades-basalt.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336063/test-wws-fabrics/luxetone-blackout-shades-slate.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336061/test-wws-fabrics/luxetone-blackout-shades-limestone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336059/test-wws-fabrics/luxetone-blackout-shades-pumice.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336057/test-wws-fabrics/luxetone-blackout-shades-quartz.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336056/test-wws-fabrics/ecoweave-3p-light-filtering-shades-elm.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336054/test-wws-fabrics/ecoweave-3p-light-filtering-shades-hickory.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336052/test-wws-fabrics/ecoweave-3p-light-filtering-shades-aspen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336050/test-wws-fabrics/ecoweave-3p-light-filtering-shades-magnolia.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336049/test-wws-fabrics/ecoweave-3p-light-filtering-shades-willow.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336048/test-wws-fabrics/ecoweave-3p-light-filtering-shades-oak.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336046/test-wws-fabrics/ecoweave-3p-light-filtering-shades-palmetto.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336045/test-wws-fabrics/ecoweave-3p-light-filtering-shades-maple.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336044/test-wws-fabrics/ecoweave-3p-light-filtering-shades-sycamore.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336042/test-wws-fabrics/ecoweave-3p-light-filtering-shades-cedar.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336041/test-wws-fabrics/ecoweave-3p-light-filtering-shades-poplar.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336040/test-wws-fabrics/ecoweave-3p-light-filtering-shades-cypress.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336038/test-wws-fabrics/ecoweave-3p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336037/test-wws-fabrics/ecoweave-3p-light-filtering-shades-white-pearl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336035/test-wws-fabrics/ecoweave-3p-light-filtering-shades-white-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336033/test-wws-fabrics/ecoweave-3p-light-filtering-shades-pearl-pearl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336031/test-wws-fabrics/ecoweave-3p-light-filtering-shades-pearl-linen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336030/test-wws-fabrics/ecoweave-3p-light-filtering-shades-pearl-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336028/test-wws-fabrics/ecoweave-3p-light-filtering-shades-charcoal-grey-stone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336027/test-wws-fabrics/ecoweave-3p-light-filtering-shades-charcoal-grey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336025/test-wws-fabrics/ecoweave-3p-light-filtering-shades-charcoal-cocoa.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336024/test-wws-fabrics/ecoweave-3p-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336022/test-wws-fabrics/ecoweave-3p-light-filtering-shades-charcoal-apricot.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336020/test-wws-fabrics/designmesh-6-light-filtering-shades-harvest.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336018/test-wws-fabrics/designmesh-6-light-filtering-shades-hazelnut.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336017/test-wws-fabrics/designmesh-6-light-filtering-shades-flagstone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336015/test-wws-fabrics/designmesh-6-light-filtering-shades-tumbleweed.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336013/test-wws-fabrics/designmesh-6-light-filtering-shades-river-rock.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336012/test-wws-fabrics/designmesh-6-light-filtering-shades-naturelle.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336010/test-wws-fabrics/designmesh-6-light-filtering-shades-parchment.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336009/test-wws-fabrics/renewweave-3p-light-filtering-shades-black-black.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336007/test-wws-fabrics/renewweave-3p-light-filtering-shades-black-coffee.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336004/test-wws-fabrics/renewweave-3p-light-filtering-shades-black-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759336000/test-wws-fabrics/renewweave-3p-light-filtering-shades-black-blue.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335997/test-wws-fabrics/renewweave-3p-light-filtering-shades-black-smoke.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335995/test-wws-fabrics/renewweave-3p-light-filtering-shades-gray-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335992/test-wws-fabrics/renewweave-3p-light-filtering-shades-smoke-smoke.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335990/test-wws-fabrics/renewweave-3p-light-filtering-shades-white-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335987/test-wws-fabrics/renewweave-3p-light-filtering-shades-white-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335984/test-wws-fabrics/renewweave-3p-light-filtering-shades-white-smoke.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335981/test-wws-fabrics/renewweave-3p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335979/test-wws-fabrics/vistaweave-3p-light-filtering-shades-charcoal-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335976/test-wws-fabrics/vistaweave-3p-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335974/test-wws-fabrics/vistaweave-3p-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335971/test-wws-fabrics/vistaweave-3p-light-filtering-shades-gray-dark-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335969/test-wws-fabrics/vistaweave-3p-light-filtering-shades-gray-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335967/test-wws-fabrics/vistaweave-3p-light-filtering-shades-beige-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335964/test-wws-fabrics/vistaweave-3p-light-filtering-shades-beige-sable.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335962/test-wws-fabrics/vistaweave-3p-light-filtering-shades-beige-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335959/test-wws-fabrics/vistaweave-3p-light-filtering-shades-white-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335957/test-wws-fabrics/vistaweave-3p-light-filtering-shades-white-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335955/test-wws-fabrics/vistaweave-3p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335952/test-wws-fabrics/vistaweave-3p-light-filtering-shades-dove-sand.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335950/test-wws-fabrics/vistaweave-3p-light-filtering-shades-dove-dove.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335948/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-charcoal-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335945/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-charcoal-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335942/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-charcoal-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335939/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-gray-blue.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335937/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-gray-dark-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335934/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-gray-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335932/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-beige-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335929/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-beige-sable.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335926/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-beige-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335924/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-white-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335921/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-white-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335918/test-wws-fabrics/airlite-mesh-1p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335916/test-wws-fabrics/toughshade-1p-light-filtering-shades-white-charcoal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335913/test-wws-fabrics/toughshade-1p-light-filtering-shades-white-bronze.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335910/test-wws-fabrics/toughshade-1p-light-filtering-shades-white-dim-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335908/test-wws-fabrics/toughshade-1p-light-filtering-shades-white-light-gray.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335905/test-wws-fabrics/toughshade-1p-light-filtering-shades-white-beige.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335902/test-wws-fabrics/toughshade-1p-light-filtering-shades-white-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335898/test-wws-fabrics/ultrablock-0p-light-filtering-shades-kohl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335896/test-wws-fabrics/ultrablock-0p-light-filtering-shades-seal35.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335894/test-wws-fabrics/ultrablock-0p-light-filtering-shades-smoke.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335892/test-wws-fabrics/ultrablock-0p-light-filtering-shades-silver.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335890/test-wws-fabrics/ultrablock-0p-light-filtering-shades-ecru.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335889/test-wws-fabrics/ultrablock-0p-light-filtering-shades-eggshell.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335887/test-wws-fabrics/ultrablock-0p-light-filtering-shades-snow.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335885/test-wws-fabrics/daylite-max-blackout-shades-fossil.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335883/test-wws-fabrics/daylite-max-blackout-shades-aspen.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335881/test-wws-fabrics/daylite-max-blackout-shades-fleece.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335879/test-wws-fabrics/daylite-max-blackout-shades-vine.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335877/test-wws-fabrics/daylite-max-blackout-shades-dove.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335876/test-wws-fabrics/daylite-max-blackout-shades-raffia.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335873/test-wws-fabrics/daylite-max-blackout-shades-almond.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335872/test-wws-fabrics/daylite-max-blackout-shades-blanco.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335870/test-wws-fabrics/breezeguard-blackout-shades-midnight.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335868/test-wws-fabrics/breezeguard-blackout-shades-orient.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335867/test-wws-fabrics/breezeguard-blackout-shades-odyssey.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335865/test-wws-fabrics/breezeguard-blackout-shades-tundra.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335864/test-wws-fabrics/breezeguard-blackout-shades-nimbus.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335862/test-wws-fabrics/breezeguard-blackout-shades-mist.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335860/test-wws-fabrics/breezeguard-blackout-shades-limestone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335859/test-wws-fabrics/breezeguard-blackout-shades-stone.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335857/test-wws-fabrics/breezeguard-blackout-shades-dune.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335855/test-wws-fabrics/breezeguard-blackout-shades-porcelain.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335854/test-wws-fabrics/breezeguard-blackout-shades-cloud.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335852/test-wws-fabrics/breezeguard-blackout-shades-ice.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335851/test-wws-fabrics/ecotherm-blackout-shades-flint.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335849/test-wws-fabrics/ecotherm-blackout-shades-spice.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335847/test-wws-fabrics/ecotherm-blackout-shades-shale.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335845/test-wws-fabrics/ecotherm-blackout-shades-seagrass.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335843/test-wws-fabrics/ecotherm-blackout-shades-pebble.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335841/test-wws-fabrics/ecotherm-blackout-shades-sesame.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335839/test-wws-fabrics/ecotherm-blackout-shades-parchment.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335838/test-wws-fabrics/ecotherm-blackout-shades-cotton.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335836/test-wws-fabrics/urbanview-blackout-shades-onyx.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335834/test-wws-fabrics/urbanview-blackout-shades-porpoise.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335832/test-wws-fabrics/urbanview-blackout-shades-graphite.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335830/test-wws-fabrics/urbanview-blackout-shades-canyon.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335829/test-wws-fabrics/urbanview-blackout-shades-cocoa.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335827/test-wws-fabrics/urbanview-blackout-shades-mushroom.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335825/test-wws-fabrics/urbanview-blackout-shades-sand.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335823/test-wws-fabrics/urbanview-blackout-shades-white.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335822/test-wws-fabrics/urbanview-blackout-shades-canvas.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335820/test-wws-fabrics/urbanview-blackout-shades-wheat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335819/test-wws-fabrics/urbanview-blackout-shades-merino.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335817/test-wws-fabrics/urbanview-blackout-shades-birch.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335815/test-wws-fabrics/skyshade-1p-light-filtering-shades-jutesmoke.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335814/test-wws-fabrics/skyshade-1p-light-filtering-shades-jutefog.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335812/test-wws-fabrics/skyshade-1p-light-filtering-shades-seaglasscrystal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335810/test-wws-fabrics/skyshade-1p-light-filtering-shades-seaglasschardonnay.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335809/test-wws-fabrics/skyshade-1p-light-filtering-shades-seaglasssilver.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335807/test-wws-fabrics/skyshade-1p-light-filtering-shades-linencream.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335805/test-wws-fabrics/skyshade-1p-light-filtering-shades-tweedputty.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335803/test-wws-fabrics/skyshade-1p-light-filtering-shades-tweedglacier.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335798/test-wws-fabrics/skyshade-1p-light-filtering-shades-tweedsatin.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335796/test-wws-fabrics/skyshade-1p-light-filtering-shades-blissshadow.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335794/test-wws-fabrics/skyshade-1p-light-filtering-shades-blissnatural.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335792/test-wws-fabrics/skyshade-1p-light-filtering-shades-blissfrost.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335791/test-wws-fabrics/skyshade-1p-light-filtering-shades-blisscotton.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335790/test-wws-fabrics/skyshade-1p-light-filtering-shades-barkantique.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335788/test-wws-fabrics/skyshade-1p-light-filtering-shades-barksterling.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335787/test-wws-fabrics/skyshade-1p-light-filtering-shades-barkeggshell.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335785/test-wws-fabrics/skyshade-1p-light-filtering-shades-barksienna.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335783/test-wws-fabrics/skyshade-1p-light-filtering-shades-chenilledriftwood.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335781/test-wws-fabrics/skyshade-1p-light-filtering-shades-chenillehoney.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335779/test-wws-fabrics/skyshade-1p-light-filtering-shades-chenillemarshmallow.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335777/test-wws-fabrics/skyshade-1p-light-filtering-shades-jutecoffee.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335776/test-wws-fabrics/skyshade-1p-light-filtering-shades-jutelatte.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335774/test-wws-fabrics/skyshade-1p-light-filtering-shades-juteparchment.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335773/test-wws-fabrics/skyshade-1p-light-filtering-shades-linencinnamon.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335771/test-wws-fabrics/skyshade-1p-light-filtering-shades-featherclear.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335769/test-wws-fabrics/skyshade-1p-light-filtering-shades-tweedbuckeye.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335767/test-wws-fabrics/skyshade-1p-light-filtering-shades-tweedoatmeal.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335765/test-wws-fabrics/skyshade-1p-light-filtering-shades-metroplatinum.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335764/test-wws-fabrics/skyshade-1p-light-filtering-shades-linenclay.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335762/test-wws-fabrics/skyshade-1p-light-filtering-shades-linentaupe.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335761/test-wws-fabrics/skyshade-1p-light-filtering-shades-linenpearl.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335759/test-wws-fabrics/skyshade-1p-light-filtering-shades-barkpewter.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335757/test-wws-fabrics/skyshade-1p-light-filtering-shades-barkash.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335754/test-wws-fabrics/skyshade-1p-light-filtering-shades-barktigeroak.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335752/test-wws-fabrics/skyshade-1p-light-filtering-shades-bamboowheat.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335751/test-wws-fabrics/skyshade-1p-light-filtering-shades-marblesand.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335749/test-wws-fabrics/skyshade-1p-light-filtering-shades-bamboobirch.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335747/test-wws-fabrics/blackoutx-0p-light-filtering-shades-ebony.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335746/test-wws-fabrics/blackoutx-0p-light-filtering-shades-flint.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335744/test-wws-fabrics/blackoutx-0p-light-filtering-shades-mink.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335743/test-wws-fabrics/blackoutx-0p-light-filtering-shades-mocha.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335741/test-wws-fabrics/blackoutx-0p-light-filtering-shades-fleece.jpg",
  "https://res.cloudinary.com/dcmlcfynd/image/upload/v1759335740/test-wws-fabrics/blackoutx-0p-light-filtering-shades-clay.jpg"
];

// Mapping Table for SEO: maps detected folder/keywords to Company and Fabric code
const SEO_COLLECTION_MAP: Record<string, { company: string, fabric: string, wwsFabricName: string, type: string }> = {
  'breezeguard': { company: 'Phifer', fabric: '7500', wwsFabricName: 'BreezeGuard', type: 'Blackout Shades' },
  'ecotherm': { company: 'Phifer', fabric: '7400', wwsFabricName: 'EcoTherm', type: 'Blackout Shades' },
  'urbanview': { company: 'Phifer', fabric: '7000', wwsFabricName: 'UrbanView', type: 'Blackout Shades' },
  'skyshade-1p': { company: 'Phifer', fabric: '5000', wwsFabricName: 'SkyShade 1P', type: 'Light Filtering Shades' },
  'urbanshade': { company: 'Mermet', fabric: 'Zora', wwsFabricName: 'UrbanShade', type: 'Blackout Shades' },
  'breezeflex': { company: 'Mermet', fabric: 'Vizela', wwsFabricName: 'BreezeFlex', type: 'Blackout Shades' },
  'earthblock-1p': { company: 'Copaco', fabric: 'Visi Natte-420P', wwsFabricName: 'EarthBlock 1P', type: 'Light Filtering Shades' },
  'solarblock-1': { company: 'Copaco', fabric: 'Visi Natte-420', wwsFabricName: 'SolarBlock 1', type: 'Light Filtering Shades' },
  'naturescreen-3p': { company: 'Copaco', fabric: 'Visi Natte-390P', wwsFabricName: 'NatureScreen 3P', type: 'Light Filtering Shades' },
  'lumiscreen-3': { company: 'Copaco', fabric: 'Visi Natte-390', wwsFabricName: 'LumiScreen 3', type: 'Light Filtering Shades' },
  'greenshade-5p': { company: 'Copaco', fabric: 'Visi Natte-380P', wwsFabricName: 'GreenShade 5P', type: 'Light Filtering Shades' },
  'vistashade-5': { company: 'Copaco', fabric: 'Visi Natte-380', wwsFabricName: 'VistaShade 5', type: 'Light Filtering Shades' },
  'ecoview-10p': { company: 'Copaco', fabric: 'Visi Natte-300P', wwsFabricName: 'EcoView 10P', type: 'Light Filtering Shades' },
  'clearview-10': { company: 'Copaco', fabric: 'Visi Natte-300', wwsFabricName: 'ClearView 10', type: 'Light Filtering Shades' },
  'luxe-verona-5p': { company: 'Texstyle', fabric: 'Verona', wwsFabricName: 'Luxe Verona 5P', type: 'Light Filtering Shades' },
  'desertfade': { company: 'Texstyle', fabric: 'Tempe', wwsFabricName: 'DesertFade', type: 'Blackout Shades' },
  'thermoshield-1': { company: 'Mermet', fabric: 'T Screen', wwsFabricName: 'ThermoShield 1', type: 'Light Filtering Shades' },
  'armorweave': { company: 'Mermet', fabric: 'Sparta', wwsFabricName: 'ArmorWeave', type: 'Blackout Shades' },
  'zipguard-5': { company: 'Ferarri', fabric: 'Soltis Veozip', wwsFabricName: 'ZipGuard 5', type: 'Light Filtering Shades' },
  'softweave-3': { company: 'Ferarri', fabric: 'Soltis Touch', wwsFabricName: 'SoftWeave 3', type: 'Light Filtering Shades' },
  'loopmesh-3p': { company: 'Ferarri', fabric: 'Soltis Loop', wwsFabricName: 'LoopMesh 3P', type: 'Light Filtering Shades' },
  'totalblock-0p': { company: 'Ferarri', fabric: 'Soltis 99', wwsFabricName: 'TotalBlock 0P', type: 'Light Filtering Shades' },
  'dayglow-3': { company: 'Ferarri', fabric: 'Soltis 96', wwsFabricName: 'DayGlow 3', type: 'Light Filtering Shades' },
  'ultrashield-4': { company: 'Ferarri', fabric: 'Soltis 92', wwsFabricName: 'UltraShield 4', type: 'Light Filtering Shades' },
  'vistaview-5p': { company: 'Ferarri', fabric: 'Soltis 88', wwsFabricName: 'VistaView 5P', type: 'Light Filtering Shades' },
  'solarlite-4p': { company: 'Ferarri', fabric: 'Soltis 86', wwsFabricName: 'SolarLite 4P', type: 'Light Filtering Shades' },
  'silklight': { company: 'Mermet', fabric: 'Sofia', wwsFabricName: 'SilkLight', type: 'Blackout Shades' },
  'silent-haven': { company: 'Texstyle', fabric: 'Sanctuary Blackout', wwsFabricName: 'Silent Haven', type: 'Blackout Shades' },
  'tranquil-haven-3p': { company: 'Texstyle', fabric: 'Sanctuary', wwsFabricName: 'Tranquil Haven 3P', type: 'Light Filtering Shades' },
  'solarsoft-3': { company: 'Mermet', fabric: 'S Screen', wwsFabricName: 'SolarSoft 3', type: 'Light Filtering Shades' },
  'coastal-luxe-5': { company: 'Senbesta', fabric: 'Palm Beach', wwsFabricName: 'Coastal Luxe 5', type: 'Light Filtering Shades' },
  'stoneview': { company: 'Texstyle', fabric: 'Mesa', wwsFabricName: 'StoneView', type: 'Blackout Shades' },
  'microview-4': { company: 'Mermet', fabric: 'M Screen', wwsFabricName: 'Microview 4', type: 'Light Filtering Shades' },
  'nightshade': { company: 'Texstyle', fabric: 'Kleenscreen Blackout', wwsFabricName: 'NightShade', type: 'Blackout Shades' },
  'pureshade-5p': { company: 'Texstyle', fabric: 'Kleenscreen', wwsFabricName: 'PureShade 5P', type: 'Light Filtering Shades' },
  'infinity-veil-3p': { company: 'Phifer', fabric: 'Infinity', wwsFabricName: 'Infinity Veil 3P', type: 'Light Filtering Shades' },
  'feathermesh': { company: 'Mermet', fabric: 'Flocke', wwsFabricName: 'FeatherMesh', type: 'Blackout Shades' },
  'luxetone': { company: 'Mermet', fabric: 'Elba', wwsFabricName: 'LuxeTone', type: 'Blackout Shades' },
  'ecoweave-3p': { company: 'Mermet', fabric: 'E Screen', wwsFabricName: 'EcoWeave 3P', type: 'Light Filtering Shades' },
  'designmesh-6': { company: 'Mermet', fabric: 'Deco Screen', wwsFabricName: 'DesignMesh 6', type: 'Light Filtering Shades' },
  'renewweave-3p': { company: 'Texstyle', fabric: 'Ambient Renew', wwsFabricName: 'RenewWeave 3P', type: 'Light Filtering Shades' },
  'vistaweave-3p': { company: 'Texstyle', fabric: '4000 Net', wwsFabricName: 'VistaWeave 3P', type: 'Light Filtering Shades' },
  'airlite-mesh-1p': { company: 'Texstyle', fabric: '3000 Net', wwsFabricName: 'AirLite Mesh 1P', type: 'Light Filtering Shades' },
  'toughshade-1p': { company: 'Texstyle', fabric: '3000 HT', wwsFabricName: 'ToughShade 1P', type: 'Light Filtering Shades' },
  'ultrablock-0p': { company: 'Phifer', fabric: '8000', wwsFabricName: 'UltraBlock 0P', type: 'Light Filtering Shades' },
  'daylite-max': { company: 'Phifer', fabric: '7800', wwsFabricName: 'DayLite Max', type: 'Blackout Shades' },
  'blackoutx-0p': { company: 'Phifer', fabric: '4800', wwsFabricName: 'BlackoutX 0P', type: 'Light Filtering Shades' }
};

// Fabric Price Group Mapping - Based on official Price List
export const FABRIC_PRICE_GROUPS: Record<string, string> = {
  // Phifer
  'SheerGuard 5P': 'B',
  'PrivacyLite 3P': 'B',
  'EcoShield 1P': 'E',
  'ClearView 1P': 'C',
  'SolarArmor 3': 'C',
  'ThermaView 5': 'C',
  'BlackoutX 0P': 'C',
  'SkyShade 1P': 'C',
  'UrbanView': 'E',
  'EcoTherm': 'D',
  'BreezeGuard': 'B',
  'DayLite Max': 'B',
  'UltraBlock 0P': 'D',
  'Infinity Veil 3P': 'C',
  
  // Texstyle
  'ToughShade 1P': 'C',
  'AirLite Mesh 1P': 'C',
  'VistaWeave 3P': 'C',
  'RenewWeave 3P': 'B',
  'PureShade 5P': 'B',
  'NightShade': 'C',
  'StoneView': 'D',
  'Tranquil Haven 3P': 'B',
  'Silent Haven': 'C',
  'DesertFade': 'C',
  'Luxe Verona 5P': 'D',
  
  // Mermet
  'DesignMesh 6': 'E',
  'EcoWeave 3P': 'B',
  'LuxeTone': 'C',
  'FeatherMesh': 'I',
  'Microview 4': 'D',
  'SolarSoft 3': 'E',
  'SilkLight': 'C',
  'ArmorWeave': 'B',
  'ThermoShield 1': 'E',
  'BreezeFlex': 'G',
  'UrbanShade': 'C',
  
  // Ferrari (Soltis)
  'SolarLite 4P': 'D',
  'VistaView 5P': 'D',
  'UltraShield 4': 'D',
  'DayGlow 3': 'D',
  'TotalBlock 0P': 'D',
  'LoopMesh 3P': 'F',
  'Status': 'D',
  'SoftWeave 3': 'D',
  'ZipGuard 5': 'F',
  
  // Senbesta
  'Coastal Luxe 5': 'B', // Light Filtering default, Blackout is C
  
  // Copaco
  'ClearView 10': 'G',
  'EcoView 10P': 'G',
  'VistaShade 5': 'G',
  'GreenShade 5P': 'G',
  'LumiScreen 3': 'G',
  'NatureScreen 3P': 'G',
  'SolarBlock 1': 'G',
  'EarthBlock 1P': 'G',
};

// Helper function to get price group for a fabric
export const getPriceGroupForFabric = (fabricName: string, isBlackout?: boolean): string => {
  // Special case: Senbesta Coastal Luxe 5 has different price for blackout
  if (fabricName === 'Coastal Luxe 5' && isBlackout) {
    return 'C';
  }
  return FABRIC_PRICE_GROUPS[fabricName] || 'C'; // Default to 'C' if not found
};

const parseFabricName = (url: string) => {
  const parts = url.split('/');
  const filename = parts[parts.length - 1].replace(/\.(jpg|png|webp)/, '');
  const folder = parts[parts.length - 2] || '';
  
  let raw = folder.includes('shades') ? `${folder}-${filename}` : filename;
  raw = raw.replace('test-wws-fabrics-', '').toLowerCase();
  
  const isBlackout = raw.includes('blackout');
  const category: 'Blackout' | 'Light Filtering' = isBlackout ? 'Blackout' : 'Light Filtering';

  // Identify collection keyword from list
  let foundKey = '';
  for (const key of Object.keys(SEO_COLLECTION_MAP)) {
     if (raw.includes(key)) {
        foundKey = key;
        break;
     }
  }

  const mapData = SEO_COLLECTION_MAP[foundKey] || { company: 'WWS', fabric: 'Designer', wwsFabricName: 'Custom Designer', type: 'Light Filtering Shades' };
  
  // Extract color bits remaining after removing collection name and noise
  let colorRaw = raw
    .replace(foundKey, '')
    .replace('blackout-shades', '')
    .replace('light-filtering-shades', '')
    .replace('blackout', '')
    .replace('light-filtering', '')
    .replace(/^-+|-+$/g, ''); 

  // Format colors, if multiple words join with ' | ' as per spreadsheet style
  const colorParts = colorRaw.split('-').filter(p => p.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1));
  
  const color = colorParts.join(' | ') || 'Premium';

  return {
    name: `${mapData.company} ${mapData.fabric} | ${color}`.trim(),
    category,
    mapData
  };
};

const generateFabrics = (urls: string[]): Fabric[] => {
  return urls.map((url, index) => {
    const { name, category, mapData } = parseFabricName(url);
    const fabricId = `fab_${index}`;
    
    // Generate a placeholder Shopify Variant ID for tracking consistency
    // In production, these should come from a DB or lookup table
    const shopifyId = `VARIANT-${500000 + index}`; 
    const shopifyProductId = `PROD-${Math.floor(index / 10) + 1000}`; 
    
    return {
      id: fabricId,
      name,
      description: `Premium ${category.toLowerCase()} shade material. Crafted for architectural precision and interior elegance.`,
      category,
      tone: category === 'Blackout' ? 'dark' : 'neutral',
      cloudinaryId: url, 
      priceGroup: getPriceGroupForFabric(mapData.wwsFabricName, mapData.type === 'Blackout Shades'),
      features: ['UV Protection', 'Fade Resistant'],
      rgb: { r: 200, g: 200, b: 200 },
      sku: `WWS-${fabricId.toUpperCase()}`,
      shopifyId,
      shopifyProductId
    };
  });
};

export const ALL_FABRICS: Fabric[] = generateFabrics(ALL_FABRIC_URLS.filter(u => !u.includes('placeholder')));
