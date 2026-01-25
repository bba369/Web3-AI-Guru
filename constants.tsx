
import { Lesson } from './types';

// Web3 & Tech Track - 100 Days
const generateTechLessons = (): Lesson[] => {
  const lessons: Lesson[] = [];
  const themes = [
    "Web3 को उदय", "Blockchain को शक्ति", "Digital Wallets", "Smart Contracts", "DeFi को परिचय",
    "NFTs र कला", "DAOs: नयाँ संगठन", "Ethereum vs Solana", "Layer 2 Solutions", "Metaverse",
    "Crypto Security", "Tokenomics", "Mining vs Staking", "Dapps विकास", "Web3 Gaming",
    "AI र Blockchain", "Zero Knowledge Proofs", "Stablecoins", "Gas Fees बुझौं", "IPFS र Storage",
    "Web3 Security", "Hardware Wallets", "Bridge र Interoperability", "Regulation र Crypto", "भविष्यको इन्टरनेट"
  ];

  for (let i = 1; i <= 100; i++) {
    const level = i <= 30 ? 'easy' : i <= 70 ? 'intermediate' : 'hard';
    lessons.push({
      id: `t${i}`,
      day: i,
      youtubeId: 'nhh86I277v0',
      title: themes[(i - 1) % themes.length] + (i > themes.length ? ` Part ${Math.ceil(i/themes.length)}` : ''),
      description: `प्रविधि र Web3 को संसारमा गहिरो यात्रा - दिन ${i}`,
      level,
      category: 'tech'
    });
  }
  return lessons;
};

// Business & Entrepreneurship - 100 Days
const generateEntrepreneurshipLessons = (): Lesson[] => {
  const lessons: Lesson[] = [];
  const phase1Themes = ["सुरुवात र सपना", "अवलोकनको शक्ति", "समस्या पहिचान", "मूल्य निर्धारण", "पहिलो आम्दानी"];
  const phase2Themes = ["NEPSE को परिचय", "MeroShare", "IPO लगानी", "TMS ट्रेडिङ", "Fundamental Analysis"];
  const phase3Themes = ["Desire", "Faith", "SWOT Analysis", "Risk Management", "Scaling Business"];

  for (let i = 1; i <= 100; i++) {
    let level: any = 'kids';
    let title = "";
    if (i <= 25) { level = 'kids'; title = phase1Themes[(i-1)%phase1Themes.length]; }
    else if (i <= 55) { level = 'teens'; title = phase2Themes[(i-26)%phase2Themes.length]; }
    else { level = 'youth'; title = phase3Themes[(i-56)%phase3Themes.length]; }

    lessons.push({
      id: `e${i}`,
      day: i,
      youtubeId: 'ZE2HxVaTKkk',
      title: title + (i > 10 ? ` (${i})` : ''),
      description: `व्यवसाय र आर्थिक स्वतन्त्रताको बाटो - दिन ${i}`,
      level,
      category: 'entrepreneur'
    });
  }
  return lessons;
};

// Research-Based Abacus Track - 100 Days
const generateAbacusLessons = (): Lesson[] => {
  const lessons: Lesson[] = [];
  const foundationalThemes = [
    "एबाकसको ५००० वर्षको इतिहास", 
    "Soroban र Suanpan बीचको भिन्नता", 
    "मस्तिष्कको Neuroplasticity र Abacus", 
    "दायाँ र बायाँ मस्तिष्कको (Hemispheres) तालमेल", 
    "एकाग्रता (Concentration) बढाउने वैज्ञानिक विधि", 
    "स्मरण शक्ति (Photographic Memory) को विकास", 
    "गणितीय डर (Math Anxiety) हटाउने तरिका", 
    "औंला र मस्तिष्कको न्यूरो-कनेक्सन", 
    "दृश्य विधि (Visualization) को शक्ति", 
    "मानसिक गणितको चमत्कार"
  ];
  const technicalThemes = [
    "Small Friends (+)", "Small Friends (-)", "Big Friends (+)", "Big Friends (-)",
    "Double Friends", "Mental Arithmetic Basics", "Fast Addition", "Fast Subtraction",
    "Multiplication Magic", "Division Techniques"
  ];

  for (let i = 1; i <= 100; i++) {
    const level = i <= 30 ? 'easy' : i <= 70 ? 'intermediate' : 'hard';
    let title = "";
    if (i <= 10) title = foundationalThemes[i-1];
    else title = technicalThemes[(i - 11) % technicalThemes.length];

    lessons.push({
      id: `a${i}`,
      day: i,
      youtubeId: 'nhh86I277v0',
      title: title + (i > 20 ? ` Part ${Math.floor(i/10)}` : ''),
      description: `एबाकस र मस्तिष्क विज्ञानको गहिरो सिकाई - दिन ${i}`,
      level,
      category: 'abacus'
    });
  }
  return lessons;
};

// Digital Literacy & Cyber Security - 30 Lessons
const generateDigitalLiteracyLessons = (): Lesson[] => {
  const lessons: Lesson[] = [];
  const modules = [
    { title: "Digital World को परिचय", desc: "स्मार्टफोन र इन्टरनेटको आधारभूत प्रयोग।" },
    { title: "Internet र Connectivity", desc: "Wi-Fi, Mobile Data र Hotspot को सही प्रयोग।" },
    { title: "Email र संचार", desc: "Professional Email कसरी बनाउने र पठाउने?" },
    { title: "Search Engine को जादू", desc: "Google मा सही जानकारी कसरी खोज्ने?" },
    { title: "Digital Footprint", desc: "तपाईंले इन्टरनेटमा छाड्ने छाप र यसको असर।" },
    { title: "Device Security Basics", desc: "मोबाइल र ल्यापटपलाई कसरी सुरक्षित राख्ने?" },
    { title: "App Permissions", desc: "कुन एपलाई के अनुमति दिने? बुझौं।" },
    { title: "Software Updates", desc: "अपडेट किन आवश्यक छ? सुरक्षाका लागि अपडेट।" },
    { title: "Public Wi-Fi को खतरा", desc: "फ्री इन्टरनेट प्रयोग गर्दा ध्यान दिनुपर्ने कुरा।" },
    { title: "eSewa र Khalti Fraud", desc: "डिजिटल वालेटमा हुने ठगीबाट बच्ने उपाय।" },
    { title: "Fake Lottery Calls", desc: "चिठ्ठा परेको भन्दै आउने कल र मेसेजको वास्तविकता।" },
    { title: "ATM Cloning र Banking Scams", desc: "बैंक खाता कसरी सुरक्षित राख्ने?" },
    { title: "Social Media Identity Theft", desc: "तपाईंको प्रोफाइल कसैले दुरुपयोग गरे के गर्ने?" },
    { title: "Phishing Links", desc: "शंकास्पद लिंकहरु पहिचान गर्ने तरिका।" },
    { title: "Job Scams", desc: "वैदेशिक रोजगार र पार्ट-टाइम कामको नाममा हुने ठगी।" },
    { title: "Nepal Cyber Bureau", desc: "साइबर अपराधको उजुरी गर्ने प्रक्रिया र सम्पर्क।" },
    { title: "Password Power", desc: "स्ट्रोङ पासवर्ड बनाउने वैज्ञानिक तरिका।" },
    { title: "2-Factor Authentication (2FA)", desc: "सुरक्षाको दोस्रो ढोका कसरी लगाउने?" },
    { title: "Biometric Security", desc: "Fingerprint र Face Unlock को फाइदा र जोखिम।" },
    { title: "Password Managers", desc: "पासवर्डहरु सुरक्षित राख्ने आधुनिक तरिका।" },
    { title: "Data Privacy", desc: "तपाईंको व्यक्तिगत जानकारी किन गोप्य राख्ने?" },
    { title: "Electronic Transactions Act 2063", desc: "नेपालको साइबर कानून बुझौं।" },
    { title: "Digital Wellbeing", desc: "इन्टरनेटको सही समय व्यवस्थापन र स्वास्थ्य।" },
    { title: "Online Etiquette", desc: "डिजिटल संसारमा कस्तो व्यवहार गर्ने?" },
    { title: "Cloud Security", desc: "Google Drive र iCloud को सुरक्षित प्रयोग।" },
    { title: "Backup Strategies", desc: "महत्वपूर्ण डाटा सुरक्षित राख्ने तरिकाहरु।" },
    { title: "Cyber Security Audit", desc: "आफ्नो डिजिटल सुरक्षा आफैं जाँच गर्ने तरिका।" },
    { title: "Awareness Campaign", desc: "समुदायमा साइबर सुरक्षा चेतना कसरी फैलाउने?" },
    { title: "Final Review", desc: "प्रमाणपत्रका लागि सबै पाठको सार।" },
    { title: "Certification Project", desc: "आफ्नो सिकाईलाई व्यवहारमा उतारौं।" }
  ];

  modules.forEach((mod, i) => {
    const level = i < 10 ? 'easy' : i < 20 ? 'intermediate' : 'hard';
    lessons.push({
      id: `dl${i + 1}`,
      day: i + 1,
      youtubeId: 'nhh86I277v0',
      title: mod.title,
      description: mod.desc,
      level,
      category: 'digital-literacy'
    });
  });
  return lessons;
};

export const PLAYLIST_LESSONS: Lesson[] = [
  ...generateTechLessons(),
  ...generateEntrepreneurshipLessons(),
  ...generateAbacusLessons(),
  ...generateDigitalLiteracyLessons()
];
