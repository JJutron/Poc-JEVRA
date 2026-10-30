export type DomainType = '금융' | '반도체' | 'ERP' | '제조';
export type GradeType = '특급' | '고급' | '중급';

export interface PersonNode {
  id: string;
  name: string;
  engName: string;
  characterName: string;
  role: string;
  dept: string;
  domain: DomainType;
  grade: GradeType;
  monthlyRate: number; // 단위: 만원/MM (예: 1850 = 1,850만원/월)
  exp: string;
  expYears: string;
  status: 'Available' | 'RollOffSoon' | 'Busy';
  rollOff: string;
  avatar: string;
  skills: string[];
  rawProject: string;
  normProject: string;
  edgeLabel: string;
  workload: number; // 0 to 100
  jevConf: number;
  x: number;
  y: number;
}

export interface ProjectNode {
  id: string;
  domain: DomainType;
  name: string;
  engSubtitle: string;
  client: string;
  period: string;
  durationMonths: number;
  monthlyBudget: number; // 단위: 만원/월 (예: 5500 = 5,500만원/월)
  reqCount: number;
  currentCount: number;
  reqSkills: string[];
  rawVariants: string[];
  x: number;
  y: number;
}

export interface AIQueryPreset {
  id: string;
  label: string;
  query: string;
  domain: DomainType | 'ALL';
  recommendedTeam: string[];
  targetProjectId: string;
  summary: string;
}

export const ALL_DOMAINS: DomainType[] = ['금융', '반도체', 'ERP', '제조'];

export const ALL_SKILLS = [
  'Java',
  'Python',
  'RAG',
  'vLLM',
  'GraphDB',
  'SAP S/4HANA',
  'VisionAI',
  'DigitalTwin',
  'React',
  'Kafka'
];

export const ALL_DEPTS = [
  '금융AX팀',
  '반도체AX팀',
  'ERP엔터프라이즈팀',
  '스마트제조AX팀',
  'AI리서치팀'
];

function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const CHARACTER_AVATARS: Record<string, string> = {
  // 1. 한교동 (Hangyodon - Sanrio): 민트블루 반어인 + 도톰한 분홍 입술 + 머리 위 지느러미 & 꼬마 문어 사유리
  hangyodon: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#CFFAFE"/>
      <!-- 꼬마 문어 사유리 (머리 위) -->
      <circle cx="88" cy="24" r="11" fill="#FDA4AF" stroke="#1E293B" stroke-width="2.5"/>
      <circle cx="85" cy="23" r="1.8" fill="#1E293B"/>
      <circle cx="92" cy="23" r="1.8" fill="#1E293B"/>
      <circle cx="88.5" cy="27" r="2.2" fill="#E11D48"/>
      <!-- 머리 위 파란 지느러미 -->
      <path d="M45 26 C48 12, 56 12, 60 22 C64 12, 72 12, 75 26 Z" fill="#0284C7" stroke="#1E293B" stroke-width="2.8" stroke-linejoin="round"/>
      <!-- 양옆 귀 지느러미 -->
      <path d="M18 56 C8 48, 8 68, 19 66 Z" fill="#0284C7" stroke="#1E293B" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M102 56 C112 48, 112 68, 101 66 Z" fill="#0284C7" stroke="#1E293B" stroke-width="2.8" stroke-linejoin="round"/>
      <!-- 한교동 민트블루 얼굴 -->
      <ellipse cx="60" cy="64" rx="41" ry="38" fill="#22D3EE" stroke="#1E293B" stroke-width="3"/>
      <!-- 큰 동그란 흰자 + 눈동자 -->
      <circle cx="46" cy="52" r="12.5" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.8"/>
      <circle cx="74" cy="52" r="12.5" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.8"/>
      <circle cx="48" cy="52" r="4.5" fill="#1E293B"/>
      <circle cx="72" cy="52" r="4.5" fill="#1E293B"/>
      <circle cx="49.5" cy="50" r="1.6" fill="#FFFFFF"/>
      <circle cx="73.5" cy="50" r="1.6" fill="#FFFFFF"/>
      <!-- 한교동 시그니처 도톰한 핑크 입술 -->
      <ellipse cx="60" cy="78" rx="18" ry="11.5" fill="#FB7185" stroke="#1E293B" stroke-width="2.8"/>
      <ellipse cx="60" cy="78" rx="9" ry="4.5" fill="#BE123C"/>
      <!-- 볼 홍조 -->
      <ellipse cx="30" cy="68" rx="5.5" ry="3.2" fill="#F472B6" opacity="0.65"/>
      <ellipse cx="90" cy="68" rx="5.5" ry="3.2" fill="#F472B6" opacity="0.65"/>
    </svg>
  `),

  // 2. 치이카와 (Chiikawa): 하얀 햄스터/곰돌이 + 초롱초롱 눈망울 + 핑크 볼터치
  chiikawa: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#FFE4E6"/>
      <!-- 동그란 귀 -->
      <circle cx="31" cy="30" r="13" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <circle cx="89" cy="30" r="13" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <circle cx="31" cy="30" r="6" fill="#FECDD3"/>
      <circle cx="89" cy="30" r="6" fill="#FECDD3"/>
      <!-- 얼굴 -->
      <ellipse cx="60" cy="66" rx="42" ry="37" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <!-- 눈썹 -->
      <path d="M38 46 Q43 43 48 46" fill="none" stroke="#1E293B" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M72 46 Q77 43 82 46" fill="none" stroke="#1E293B" stroke-width="2.4" stroke-linecap="round"/>
      <!-- 초롱초롱 큰 눈 -->
      <circle cx="43" cy="58" r="6.8" fill="#1E293B"/>
      <circle cx="77" cy="58" r="6.8" fill="#1E293B"/>
      <circle cx="41.5" cy="55.5" r="2.5" fill="#FFFFFF"/>
      <circle cx="75.5" cy="55.5" r="2.5" fill="#FFFFFF"/>
      <circle cx="45" cy="60.5" r="1.3" fill="#FFFFFF"/>
      <circle cx="79" cy="60.5" r="1.3" fill="#FFFFFF"/>
      <!-- 볼터치 -->
      <ellipse cx="29" cy="68" rx="8" ry="4.8" fill="#FDA4AF"/>
      <ellipse cx="91" cy="68" rx="8" ry="4.8" fill="#FDA4AF"/>
      <!-- 귀여운 ω 입 -->
      <path d="M53 69 Q56.5 73 60 69 Q63.5 73 67 69" fill="none" stroke="#1E293B" stroke-width="2.6" stroke-linecap="round"/>
    </svg>
  `),

  // 3. 하치와레 (Hachiware): 파란 가르마 고양이 + 뾰족 귀 + 미소
  hachiware: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#E0F2FE"/>
      <!-- 고양이 귀 -->
      <polygon points="24,44 30,17 49,33" fill="#38BDF8" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>
      <polygon points="96,44 90,17 71,33" fill="#38BDF8" stroke="#1E293B" stroke-width="3" stroke-linejoin="round"/>
      <!-- 하얀 얼굴 -->
      <ellipse cx="60" cy="66" rx="42" ry="37" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <!-- 파란 하치(八) 가르마 무늬 -->
      <path d="M21 53 C28 31, 48 28, 60 44 C72 28, 92 31, 99 53 C86 44, 72 41, 60 51 C48 41, 34 44, 21 53 Z" fill="#38BDF8"/>
      <!-- 눈 -->
      <circle cx="43" cy="59" r="6.5" fill="#1E293B"/>
      <circle cx="77" cy="59" r="6.5" fill="#1E293B"/>
      <circle cx="41.5" cy="56.5" r="2.4" fill="#FFFFFF"/>
      <circle cx="75.5" cy="56.5" r="2.4" fill="#FFFFFF"/>
      <!-- 볼터치 -->
      <ellipse cx="29" cy="69" rx="7.5" ry="4.5" fill="#FDA4AF"/>
      <ellipse cx="91" cy="69" rx="7.5" ry="4.5" fill="#FDA4AF"/>
      <!-- 입 -->
      <path d="M52 68 Q56 72 60 68 Q64 72 68 68" fill="none" stroke="#1E293B" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M55 70 C56 77, 64 77, 65 70" fill="#FB7185" stroke="#1E293B" stroke-width="2"/>
    </svg>
  `),

  // 4. 우사기 (Usagi): 크림 노란색 토끼 + 긴 귀 + 활발한 표정
  usagi: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#FEF3C7"/>
      <!-- 긴 토끼 귀 -->
      <ellipse cx="43" cy="24" rx="9.5" ry="22" fill="#FDE68A" stroke="#1E293B" stroke-width="3"/>
      <ellipse cx="77" cy="24" rx="9.5" ry="22" fill="#FDE68A" stroke="#1E293B" stroke-width="3"/>
      <ellipse cx="43" cy="24" rx="4.5" ry="14" fill="#FBCFE8"/>
      <ellipse cx="77" cy="24" rx="4.5" ry="14" fill="#FBCFE8"/>
      <!-- 얼굴 -->
      <ellipse cx="60" cy="70" rx="40" ry="34" fill="#FDE68A" stroke="#1E293B" stroke-width="3"/>
      <!-- 눈 -->
      <circle cx="44" cy="62" r="6" fill="#1E293B"/>
      <circle cx="76" cy="62" r="6" fill="#1E293B"/>
      <circle cx="42.5" cy="59.8" r="2.2" fill="#FFFFFF"/>
      <circle cx="74.5" cy="59.8" r="2.2" fill="#FFFFFF"/>
      <!-- 볼터치 -->
      <ellipse cx="30" cy="71" rx="7" ry="4.2" fill="#FDA4AF"/>
      <ellipse cx="90" cy="71" rx="7" ry="4.2" fill="#FDA4AF"/>
      <!-- 야하~ 입 -->
      <path d="M52 71 Q56 75 60 71 Q64 75 68 71" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M56 73 Q60 82 64 73 Z" fill="#FB7185" stroke="#1E293B" stroke-width="2"/>
    </svg>
  `),

  // 5. 모몽가 (Momonga): 복슬복슬 하얀 볼 + 보라회색 귀 + 새침하고 초롱한 큰 눈
  momonga: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#F3E8FF"/>
      <!-- 귀 -->
      <ellipse cx="28" cy="30" rx="12" ry="15" fill="#94A3B8" stroke="#1E293B" stroke-width="2.8"/>
      <ellipse cx="92" cy="30" rx="12" ry="15" fill="#94A3B8" stroke="#1E293B" stroke-width="2.8"/>
      <!-- 복슬복슬한 얼굴 -->
      <path d="M20 62 C12 50, 22 34, 60 34 C98 34, 108 50, 100 62 C110 74, 96 98, 60 98 C24 98, 10 74, 20 62 Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="3"/>
      <!-- 왕방울 눈 -->
      <circle cx="43" cy="60" r="8" fill="#1E293B"/>
      <circle cx="77" cy="60" r="8" fill="#1E293B"/>
      <circle cx="41" cy="57" r="3" fill="#FFFFFF"/>
      <circle cx="75" cy="57" r="3" fill="#FFFFFF"/>
      <circle cx="45.5" cy="63" r="1.6" fill="#FFFFFF"/>
      <circle cx="79.5" cy="63" r="1.6" fill="#FFFFFF"/>
      <!-- 볼터치 -->
      <ellipse cx="27" cy="70" rx="8" ry="4.5" fill="#F472B6" opacity="0.6"/>
      <ellipse cx="93" cy="70" rx="8" ry="4.5" fill="#F472B6" opacity="0.6"/>
      <!-- 새침한 입 -->
      <path d="M54 71 Q57 74 60 71 Q63 74 66 71" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `),

  // 6. 쿠로미 (Kuromi - Sanrio): 블랙 제스터 모자 + 핑크 해골 마크 + 장난꾸러기 눈매
  kuromi: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#FAE8FF"/>
      <!-- 쿠로미 블랙 후드 & 뾰족 귀 -->
      <path d="M22 68 C16 42, 20 14, 34 12 C42 22, 46 28, 60 28 C74 28, 78 22, 86 12 C100 14, 104 42, 98 68 C94 90, 80 100, 60 100 C40 100, 26 90, 22 68 Z" fill="#1E1B4B" stroke="#0F172A" stroke-width="3"/>
      <circle cx="29" cy="13" r="5" fill="#F472B6"/>
      <circle cx="91" cy="13" r="5" fill="#F472B6"/>
      <!-- 이마의 핑크 해골 마크 -->
      <circle cx="60" cy="40" r="8" fill="#F472B6"/>
      <rect x="56" y="45" width="8" height="4" rx="1" fill="#F472B6"/>
      <circle cx="57.2" cy="39.5" r="1.8" fill="#1E1B4B"/>
      <circle cx="62.8" cy="39.5" r="1.8" fill="#1E1B4B"/>
      <!-- 하얀 얼굴 -->
      <ellipse cx="60" cy="72" rx="31" ry="23" fill="#FFFFFF" stroke="#1E1B4B" stroke-width="2.5"/>
      <!-- V자 후드 라인 -->
      <path d="M40 50 L60 61 L80 50" fill="#1E1B4B"/>
      <!-- 장난꾸러기 눈 & 핑크 코 -->
      <ellipse cx="44" cy="70" rx="4.5" ry="6" fill="#1E1B4B"/>
      <ellipse cx="76" cy="70" rx="4.5" ry="6" fill="#1E1B4B"/>
      <ellipse cx="60" cy="74" rx="3" ry="2.2" fill="#F472B6"/>
      <!-- 미소 -->
      <path d="M54 81 Q60 85 66 81" fill="none" stroke="#1E1B4B" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `),

  // 7. 폼폼푸린 (Pompompurin - Sanrio): 골든 옐로우 강아지 + 초코 브라운 베레모
  pompompurin: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#FEF9C3"/>
      <!-- 양옆 처진 귀 -->
      <ellipse cx="20" cy="66" rx="12" ry="22" transform="rotate(15 20 66)" fill="#FDE047" stroke="#713F12" stroke-width="3"/>
      <ellipse cx="100" cy="66" rx="12" ry="22" transform="rotate(-15 100 66)" fill="#FDE047" stroke="#713F12" stroke-width="3"/>
      <!-- 통통한 노란 얼굴 -->
      <ellipse cx="60" cy="68" rx="40" ry="33" fill="#FDE047" stroke="#713F12" stroke-width="3"/>
      <!-- 시그니처 갈색 베레모 -->
      <ellipse cx="60" cy="34" rx="25" ry="10" fill="#78350F" stroke="#451A03" stroke-width="2.8"/>
      <path d="M58 24 L60 18 L62 24" stroke="#451A03" stroke-width="3" stroke-linecap="round"/>
      <!-- 눈 & 코/입 -->
      <circle cx="43" cy="63" r="4.2" fill="#451A03"/>
      <circle cx="77" cy="63" r="4.2" fill="#451A03"/>
      <ellipse cx="60" cy="67" rx="3.2" ry="2.2" fill="#78350F"/>
      <path d="M52 70 Q56 75 60 69 Q64 75 68 70" fill="none" stroke="#78350F" stroke-width="2.5" stroke-linecap="round"/>
      <!-- 볼터치 -->
      <ellipse cx="32" cy="70" rx="6" ry="3.5" fill="#FB7185" opacity="0.55"/>
      <ellipse cx="88" cy="70" rx="6" ry="3.5" fill="#FB7185" opacity="0.55"/>
    </svg>
  `),

  // 8. 시나모롤 (Cinnamoroll - Sanrio): 하얀 강아지 + 긴 귀 + 하늘색 눈
  cinnamoroll: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#DBEAFE"/>
      <!-- 옆으로 길게 늘어진 큰 귀 -->
      <ellipse cx="18" cy="68" rx="14" ry="26" transform="rotate(24 18 68)" fill="#FFFFFF" stroke="#334155" stroke-width="2.8"/>
      <ellipse cx="102" cy="68" rx="14" ry="26" transform="rotate(-24 102 68)" fill="#FFFFFF" stroke="#334155" stroke-width="2.8"/>
      <!-- 하얀 얼굴 -->
      <ellipse cx="60" cy="64" rx="37" ry="29" fill="#FFFFFF" stroke="#334155" stroke-width="2.8"/>
      <!-- 시그니처 하늘색 눈 -->
      <ellipse cx="42" cy="61" rx="4.8" ry="6.5" fill="#0284C7"/>
      <ellipse cx="78" cy="61" rx="4.8" ry="6.5" fill="#0284C7"/>
      <circle cx="40.8" cy="59" r="1.8" fill="#FFFFFF"/>
      <circle cx="76.8" cy="59" r="1.8" fill="#FFFFFF"/>
      <!-- 핑크 볼터치 -->
      <ellipse cx="31" cy="69" rx="7" ry="4" fill="#FDA4AF"/>
      <ellipse cx="89" cy="69" rx="7" ry="4" fill="#FDA4AF"/>
      <!-- 귀여운 입 -->
      <path d="M54 66 Q57 70 60 66 Q63 70 66 66" fill="none" stroke="#334155" stroke-width="2.4" stroke-linecap="round"/>
    </svg>
  `),

  // 9. 포차코 (Pochacco - Sanrio): 하얀 강아지 + 까만 귀 + 정수리 털 3가닥
  pochacco: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#D1FAE5"/>
      <!-- 까만 귀 (한쪽은 살짝 들림) -->
      <ellipse cx="21" cy="54" rx="9" ry="21" transform="rotate(30 21 54)" fill="#0F172A"/>
      <ellipse cx="98" cy="44" rx="9" ry="21" transform="rotate(-50 98 44)" fill="#0F172A"/>
      <!-- 하얀 얼굴 -->
      <ellipse cx="60" cy="66" rx="36" ry="32" fill="#FFFFFF" stroke="#0F172A" stroke-width="3"/>
      <!-- 정수리 털 3가닥 -->
      <path d="M56 34 L54 24 M60 34 L60 22 M64 34 L66 24" stroke="#0F172A" stroke-width="2.6" stroke-linecap="round"/>
      <!-- 눈 & 까만 코 -->
      <circle cx="46" cy="59" r="4" fill="#0F172A"/>
      <circle cx="74" cy="59" r="4" fill="#0F172A"/>
      <ellipse cx="60" cy="66" rx="4.5" ry="3.2" fill="#0F172A"/>
      <!-- 빨간 스포츠 카라 -->
      <path d="M36 92 Q60 102 84 92" fill="none" stroke="#EF4444" stroke-width="6" stroke-linecap="round"/>
      <!-- 볼터치 -->
      <ellipse cx="34" cy="67" rx="6" ry="3.5" fill="#FDA4AF"/>
      <ellipse cx="86" cy="67" rx="6" ry="3.5" fill="#FDA4AF"/>
    </svg>
  `),

  // 10. 해달 랏코 (Rakko - Chiikawa): 브라운 해달 + 이마의 십자 흉터 + 늠름한 눈썹
  rakko: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#FFEDD5"/>
      <!-- 작은 귀 -->
      <circle cx="27" cy="36" r="10" fill="#D97706" stroke="#1E293B" stroke-width="2.8"/>
      <circle cx="93" cy="36" r="10" fill="#D97706" stroke="#1E293B" stroke-width="2.8"/>
      <!-- 해달 얼굴 -->
      <ellipse cx="60" cy="66" rx="41" ry="36" fill="#F59E0B" stroke="#1E293B" stroke-width="3"/>
      <!-- 크림색 입가 -->
      <ellipse cx="60" cy="73" rx="22" ry="16" fill="#FEF3C7"/>
      <!-- 시그니처 이마 십자(+) 흉터 -->
      <path d="M35 39 L45 49 M45 39 L35 49" stroke="#1E293B" stroke-width="2.4" stroke-linecap="round"/>
      <!-- 늠름한 눈썹 & 눈 -->
      <path d="M36 51 L49 54" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
      <path d="M84 51 L71 54" stroke="#1E293B" stroke-width="3" stroke-linecap="round"/>
      <circle cx="43" cy="60" r="6" fill="#1E293B"/>
      <circle cx="77" cy="60" r="6" fill="#1E293B"/>
      <circle cx="41.5" cy="58" r="2.2" fill="#FFFFFF"/>
      <circle cx="75.5" cy="58" r="2.2" fill="#FFFFFF"/>
      <!-- 코 & 입 -->
      <ellipse cx="60" cy="67" rx="4.5" ry="3.2" fill="#78350F"/>
      <path d="M53 73 Q56.5 77 60 73 Q63.5 77 67 73" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `),

  // 11. 마이멜로디 (My Melody - Sanrio): 핑크 두건 + 꽃장식 + 사랑스러운 표정
  mymelody: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#FCE7F3"/>
      <!-- 핑크 두건 귀 -->
      <ellipse cx="43" cy="24" rx="11" ry="22" fill="#F472B6" stroke="#1E293B" stroke-width="2.8"/>
      <ellipse cx="77" cy="26" rx="11" ry="20" transform="rotate(18 77 26)" fill="#F472B6" stroke="#1E293B" stroke-width="2.8"/>
      <!-- 핑크 두건 몸체 -->
      <ellipse cx="60" cy="68" rx="42" ry="34" fill="#F472B6" stroke="#1E293B" stroke-width="3"/>
      <!-- 하얀 얼굴 -->
      <ellipse cx="60" cy="72" rx="30" ry="23" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5"/>
      <!-- 귀 옆 하얀 꽃장식 -->
      <circle cx="82" cy="44" r="9" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.2"/>
      <circle cx="82" cy="44" r="3.8" fill="#FACC15"/>
      <!-- 눈 & 노란 코 -->
      <ellipse cx="45" cy="70" rx="4" ry="5.5" fill="#1E293B"/>
      <ellipse cx="75" cy="70" rx="4" ry="5.5" fill="#1E293B"/>
      <ellipse cx="60" cy="73" rx="3.2" ry="2.2" fill="#FACC15" stroke="#1E293B" stroke-width="1.5"/>
      <!-- 볼터치 -->
      <ellipse cx="36" cy="76" rx="5.5" ry="3" fill="#FDA4AF"/>
      <ellipse cx="84" cy="76" rx="5.5" ry="3" fill="#FDA4AF"/>
    </svg>
  `),

  // 12. 쿠리만쥬 (Kurimanju - Chiikawa): 밤만주 투톤 브라운 정수리 + 여유로운 미소
  kurimanju: svgToDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="60" fill="#ECFCCB"/>
      <!-- 작은 귀 -->
      <circle cx="25" cy="48" r="9" fill="#FEF3C7" stroke="#1E293B" stroke-width="2.6"/>
      <circle cx="95" cy="48" r="9" fill="#FEF3C7" stroke="#1E293B" stroke-width="2.6"/>
      <!-- 크림색 얼굴 -->
      <ellipse cx="60" cy="66" rx="41" ry="36" fill="#FEF3C7" stroke="#1E293B" stroke-width="3"/>
      <!-- 밤만주 갈색 정수리 -->
      <path d="M22 54 C26 32, 42 28, 60 28 C78 28, 94 32, 98 54 Q60 62 22 54 Z" fill="#92400E" stroke="#1E293B" stroke-width="2.6"/>
      <!-- 눈 & 푸근한 입 -->
      <circle cx="44" cy="62" r="5" fill="#1E293B"/>
      <circle cx="76" cy="62" r="5" fill="#1E293B"/>
      <circle cx="42.5" cy="60.5" r="1.8" fill="#FFFFFF"/>
      <circle cx="74.5" cy="60.5" r="1.8" fill="#FFFFFF"/>
      <ellipse cx="31" cy="70" rx="6.5" ry="3.8" fill="#FDA4AF"/>
      <ellipse cx="89" cy="70" rx="6.5" ry="3.8" fill="#FDA4AF"/>
      <path d="M53 70 Q56.5 74 60 70 Q63.5 74 67 70" fill="none" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    </svg>
  `)
};

export const INITIAL_PEOPLE: PersonNode[] = [
  // --- 1. 금융 (Finance AX) -> prj1 ---
  {
    id: 'p1',
    name: '김현우',
    engName: 'Min-woo Kim',
    characterName: '🐟 한교동 (산리오)',
    role: '수석 금융 아키텍트',
    dept: '금융AX팀',
    domain: '금융',
    grade: '특급',
    monthlyRate: 1850,
    exp: '9년',
    expYears: '9 years',
    status: 'Available',
    rollOff: '즉시 투입 가능',
    avatar: CHARACTER_AVATARS.hangyodon,
    skills: ['Java', 'Spring', 'RAG', 'Kafka'],
    rawProject: 'A은행 차세대 구축',
    normProject: 'prj1',
    edgeLabel: '참여 중',
    workload: 30,
    jevConf: 0.96,
    x: 115,
    y: 95
  },
  {
    id: 'p2',
    name: '이지은',
    engName: 'Ji-eun Lee',
    characterName: '🐹 치이카와',
    role: '선임 AI 엔지니어',
    dept: '금융AX팀',
    domain: '금융',
    grade: '고급',
    monthlyRate: 1450,
    exp: '5년',
    expYears: '5 years',
    status: 'RollOffSoon',
    rollOff: '2주 후 종료 (11/15)',
    avatar: CHARACTER_AVATARS.chiikawa,
    skills: ['Python', 'RAG', 'vLLM', 'FastAPI'],
    rawProject: 'A은행 차세대 PJT',
    normProject: 'prj1',
    edgeLabel: '참여 중',
    workload: 65,
    jevConf: 0.91,
    x: 115,
    y: 230
  },
  {
    id: 'p5',
    name: '정민호',
    engName: 'Min-ho Jung',
    characterName: '🐱 하치와레',
    role: '데이터 아키텍트',
    dept: '금융AX팀',
    domain: '금융',
    grade: '고급',
    monthlyRate: 1550,
    exp: '7년',
    expYears: '7 years',
    status: 'Available',
    rollOff: '즉시 투입 가능',
    avatar: CHARACTER_AVATARS.hachiware,
    skills: ['Java', 'Kafka', 'GraphDB', 'Oracle'],
    rawProject: 'A은행 차세대 시스템',
    normProject: 'prj1',
    edgeLabel: '참여 중',
    workload: 40,
    jevConf: 0.89,
    x: 115,
    y: 365
  },

  // --- 2. 반도체 (Semiconductor AX) -> prj3 ---
  {
    id: 'p6',
    name: '강동훈',
    engName: 'Dong-hoon Kang',
    characterName: '🐰 우사기',
    role: '수석 비전AI 리더',
    dept: '반도체AX팀',
    domain: '반도체',
    grade: '특급',
    monthlyRate: 1950,
    exp: '10년',
    expYears: '10 years',
    status: 'Available',
    rollOff: '즉시 투입 가능',
    avatar: CHARACTER_AVATARS.usagi,
    skills: ['Python', 'VisionAI', 'PyTorch', 'C++'],
    rawProject: 'H사 웨이퍼 불량 비전검사',
    normProject: 'prj3',
    edgeLabel: '참여 중',
    workload: 25,
    jevConf: 0.95,
    x: 745,
    y: 95
  },
  {
    id: 'p7',
    name: '윤서연',
    engName: 'Seo-yeon Yoon',
    characterName: '🐿️ 모몽가',
    role: '선임 수율 분석가',
    dept: '반도체AX팀',
    domain: '반도체',
    grade: '중급',
    monthlyRate: 1250,
    exp: '4년',
    expYears: '4 years',
    status: 'Available',
    rollOff: '즉시 투입 가능',
    avatar: CHARACTER_AVATARS.momonga,
    skills: ['Python', 'VisionAI', 'Spark', 'GraphDB'],
    rawProject: '반도체 FAB 수율 예측 AI',
    normProject: 'prj3',
    edgeLabel: '필요 역량',
    workload: 35,
    jevConf: 0.92,
    x: 745,
    y: 230
  },
  {
    id: 'p8',
    name: '송우진',
    engName: 'Woo-jin Song',
    characterName: '😈 쿠로미 (산리오)',
    role: '책임 FAB 설비제어',
    dept: '반도체AX팀',
    domain: '반도체',
    grade: '고급',
    monthlyRate: 1600,
    exp: '7년',
    expYears: '7 years',
    status: 'RollOffSoon',
    rollOff: '1주 후 종료 (11/08)',
    avatar: CHARACTER_AVATARS.kuromi,
    skills: ['Kafka', 'VisionAI', 'SECS-GEM', 'C++'],
    rawProject: '이천 M16 웨이퍼 수율 고도화',
    normProject: 'prj3',
    edgeLabel: '검수 대기',
    workload: 75,
    jevConf: 0.61,
    x: 745,
    y: 365
  },

  // --- 3. ERP (Enterprise SAP S/4HANA AX) -> prj4 ---
  {
    id: 'p9',
    name: '한승우',
    engName: 'Seung-woo Han',
    characterName: '🍮 폼폼푸린 (산리오)',
    role: '수석 ERP 아키텍트',
    dept: 'ERP엔터프라이즈팀',
    domain: 'ERP',
    grade: '특급',
    monthlyRate: 1900,
    exp: '11년',
    expYears: '11 years',
    status: 'Available',
    rollOff: '즉시 투입 가능',
    avatar: CHARACTER_AVATARS.pompompurin,
    skills: ['SAP S/4HANA', 'ABAP', 'FI-CO', 'RAG'],
    rawProject: '글로벌 화학사 S/4HANA 전환',
    normProject: 'prj4',
    edgeLabel: '참여 중',
    workload: 20,
    jevConf: 0.97,
    x: 115,
    y: 500
  },
  {
    id: 'p10',
    name: '오하영',
    engName: 'Ha-young Oh',
    characterName: '🐶 시나모롤 (산리오)',
    role: '선임 BTP 개발자',
    dept: 'ERP엔터프라이즈팀',
    domain: 'ERP',
    grade: '중급',
    monthlyRate: 1180,
    exp: '4년',
    expYears: '4 years',
    status: 'Available',
    rollOff: '즉시 투입 가능',
    avatar: CHARACTER_AVATARS.cinnamoroll,
    skills: ['SAP S/4HANA', 'React', 'Java', 'BTP'],
    rawProject: 'SAP BTP 재무 이상탐지 구축',
    normProject: 'prj4',
    edgeLabel: '참여 중',
    workload: 30,
    jevConf: 0.93,
    x: 115,
    y: 635
  },
  {
    id: 'p11',
    name: '남궁민',
    engName: 'Min Namgung',
    characterName: '🐾 포차코 (산리오)',
    role: '책임 MM/PP 컨설턴트',
    dept: 'ERP엔터프라이즈팀',
    domain: 'ERP',
    grade: '고급',
    monthlyRate: 1620,
    exp: '8년',
    expYears: '8 years',
    status: 'RollOffSoon',
    rollOff: '3주 후 종료 (11/22)',
    avatar: CHARACTER_AVATARS.pochacco,
    skills: ['SAP S/4HANA', 'MM-PP', 'ABAP', 'GraphDB'],
    rawProject: '계열사 ERP 물류/생산 모듈 고도화',
    normProject: 'prj4',
    edgeLabel: '필요 역량',
    workload: 70,
    jevConf: 0.9,
    x: 275,
    y: 650
  },

  // --- 4. 제조 (Smart Factory & Digital Twin AX) -> prj2 ---
  {
    id: 'p3',
    name: '박태준',
    engName: 'Tae-jun Park',
    characterName: '🦦 해달 랏코',
    role: '3D 관제/프론트 리드',
    dept: '스마트제조AX팀',
    domain: '제조',
    grade: '고급',
    monthlyRate: 1400,
    exp: '6년',
    expYears: '6 years',
    status: 'Available',
    rollOff: '즉시 투입 가능',
    avatar: CHARACTER_AVATARS.rakko,
    skills: ['React', 'DigitalTwin', 'Nuxt', 'TypeScript'],
    rawProject: '배터리 전극공정 디지털트윈 포털',
    normProject: 'prj2',
    edgeLabel: '필요 역량',
    workload: 25,
    jevConf: 0.94,
    x: 745,
    y: 500
  },
  {
    id: 'p4',
    name: '최윤아',
    engName: 'Yoon-ah Choi',
    characterName: '🎀 마이멜로디 (산리오)',
    role: 'ML 예지보전 엔지니어',
    dept: 'AI리서치팀',
    domain: '제조',
    grade: '중급',
    monthlyRate: 1300,
    exp: '4년',
    expYears: '4 years',
    status: 'Busy',
    rollOff: '2027.02 종료',
    avatar: CHARACTER_AVATARS.mymelody,
    skills: ['Python', 'vLLM', 'GraphDB', 'DigitalTwin'],
    rawProject: '사내 설비 이상탐지 챗봇',
    normProject: 'prj2',
    edgeLabel: '검수 대기',
    workload: 88,
    jevConf: 0.62,
    x: 745,
    y: 635
  },
  {
    id: 'p12',
    name: '배준호',
    engName: 'Jun-ho Bae',
    characterName: '🌰 쿠리만쥬',
    role: '책임 디지털트윈 설계',
    dept: '스마트제조AX팀',
    domain: '제조',
    grade: '고급',
    monthlyRate: 1580,
    exp: '7년',
    expYears: '7 years',
    status: 'Available',
    rollOff: '즉시 투입 가능',
    avatar: CHARACTER_AVATARS.kurimanju,
    skills: ['DigitalTwin', 'Kafka', 'Python', 'GraphDB'],
    rawProject: '글로벌 배터리사 설비 예지보전',
    normProject: 'prj2',
    edgeLabel: '참여 중',
    workload: 35,
    jevConf: 0.91,
    x: 585,
    y: 650
  }
];

export const PROJECTS: ProjectNode[] = [
  {
    id: 'prj1',
    domain: '금융',
    name: 'A은행 차세대 AI 코어뱅킹',
    engSubtitle: 'Finance AX Core Banking',
    client: 'A금융그룹',
    period: '2025.03 - 2026.08',
    durationMonths: 6,
    monthlyBudget: 5000, // 월 5,000만원 예산
    reqCount: 3,
    currentCount: 3,
    reqSkills: ['Java', 'RAG', 'Kafka', 'GraphDB'],
    rawVariants: ['A은행 차세대 구축', 'A은행 차세대 PJT', 'A은행 차세대 시스템'],
    x: 315,
    y: 195
  },
  {
    id: 'prj3',
    domain: '반도체',
    name: '하이닉스 웨이퍼 수율 비전 AI',
    engSubtitle: 'Semiconductor Yield AI',
    client: 'SK하이닉스',
    period: '2026.01 - 2026.12',
    durationMonths: 6,
    monthlyBudget: 5200, // 월 5,200만원 예산
    reqCount: 3,
    currentCount: 3,
    reqSkills: ['Python', 'VisionAI', 'Kafka', 'GraphDB'],
    rawVariants: [
      'H사 웨이퍼 불량 비전검사',
      '반도체 FAB 수율 예측 AI',
      '이천 M16 웨이퍼 수율 고도화'
    ],
    x: 545,
    y: 195
  },
  {
    id: 'prj4',
    domain: 'ERP',
    name: '글로벌 화학 SAP S/4HANA 전환',
    engSubtitle: 'Enterprise ERP & AI FI/CO',
    client: 'SK케미칼/계열사',
    period: '2026.02 - 2026.11',
    durationMonths: 6,
    monthlyBudget: 4800, // 월 4,800만원 예산
    reqCount: 3,
    currentCount: 3,
    reqSkills: ['SAP S/4HANA', 'React', 'Java', 'GraphDB'],
    rawVariants: [
      '글로벌 화학사 S/4HANA 전환',
      'SAP BTP 재무 이상탐지 구축',
      '계열사 ERP 물류/생산 모듈 고도화'
    ],
    x: 315,
    y: 470
  },
  {
    id: 'prj2',
    domain: '제조',
    name: '배터리 공정 디지털트윈 & 예지보전',
    engSubtitle: 'Smart Factory Digital Twin',
    client: 'SK온 / 스마트제조',
    period: '2026.05 - 진행중',
    durationMonths: 6,
    monthlyBudget: 4500, // 월 4,500만원 예산
    reqCount: 3,
    currentCount: 3,
    reqSkills: ['DigitalTwin', 'React', 'vLLM', 'GraphDB'],
    rawVariants: [
      '배터리 전극공정 디지털트윈 포털',
      '글로벌 배터리사 설비 예지보전',
      '사내 설비 이상탐지 챗봇'
    ],
    x: 545,
    y: 470
  }
];

export const AI_QUERY_PRESETS: AIQueryPreset[] = [
  {
    id: 'q-fin',
    label: '금융 차세대 (월 4,900만 내)',
    query: 'A은행 차세대 함께 수행한 Java·RAG 금융 전문가 조합 (월 4,900만 이내)',
    domain: '금융',
    recommendedTeam: ['p1', 'p2', 'p5'],
    targetProjectId: 'prj1',
    summary: 'Jev 정규화로 복원된 A은행 차세대 동료 3인(김현우·이지은·정민호) 조합 · 월 4,850만원 (예산 내)'
  },
  {
    id: 'q-semi',
    label: '반도체 수율 비전AI 가성비팀',
    query: 'SK하이닉스 웨이퍼 비전AI·수율 예측 즉시 가용팀 (월 4,800만 이내)',
    domain: '반도체',
    recommendedTeam: ['p6', 'p7', 'p8'],
    targetProjectId: 'prj3',
    summary: '반도체 FAB 비전검사·설비제어 3인(강동훈·윤서연·송우진) 조합 · 월 4,800만원 (예산 400만 절감)'
  },
  {
    id: 'q-erp',
    label: 'SAP S/4HANA 전환 드림팀',
    query: 'SAP S/4HANA 및 BTP 구축 경험자 중 즉시/3주내 투입 가능팀',
    domain: 'ERP',
    recommendedTeam: ['p9', 'p10', 'p11'],
    targetProjectId: 'prj4',
    summary: 'SAP S/4HANA 아키텍트·BTP·MM/PP 3인(한승우·오하영·남궁민) 조합 · 월 4,700만원 (예산 내)'
  },
  {
    id: 'q-mfg',
    label: '제조 디지털트윈·예지보전팀',
    query: '배터리 공정 디지털트윈 및 설비 예지보전 즉시 가용 조합',
    domain: '제조',
    recommendedTeam: ['p3', 'p12', 'p2'],
    targetProjectId: 'prj2',
    summary: '디지털트윈·3D관제·AI(박태준·배준호·이지은) 조합 · 월 4,430만원 (바쁨 상태 최윤아 대체)'
  }
];

export interface FilterOptions {
  onlyAvailable: boolean;
  includeRollOff: boolean;
  selectedSkills: string[];
  selectedDepts?: string[];
  selectedDomain?: DomainType | 'ALL';
  maxMonthlyRate?: number | null;
  searchQuery: string;
}

export function filterPeople(people: PersonNode[], options: FilterOptions): PersonNode[] {
  const {
    onlyAvailable,
    includeRollOff,
    selectedSkills,
    selectedDepts = [],
    selectedDomain = 'ALL',
    maxMonthlyRate = null,
    searchQuery
  } = options;
  return people.filter(p => {
    if (selectedDomain !== 'ALL' && p.domain !== selectedDomain) return false;
    if (onlyAvailable && p.status === 'Busy') return false;
    if (!includeRollOff && p.status === 'RollOffSoon') return false;
    if (maxMonthlyRate && p.monthlyRate > maxMonthlyRate) return false;
    if (selectedSkills.length > 0 && !selectedSkills.some(s => p.skills.includes(s))) return false;
    if (selectedDepts.length > 0 && !selectedDepts.includes(p.dept)) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      // 자연어 문장 질의인 경우 핵심 키워드 토큰 매칭 지원
      const tokens = q
        .replace(/[(),·]/g, ' ')
        .split(/\s+/)
        .filter(
          t =>
            t.length >= 2 &&
            ![
              '함께',
              '수행한',
              '전문가',
              '조합',
              '이내',
              '이하',
              '즉시',
              '가용',
              '경험자',
              '구축',
              '가능팀',
              '가용팀'
            ].includes(t)
        );

      const searchableText = [
        p.name,
        p.engName,
        p.characterName,
        p.role,
        p.dept,
        p.domain,
        p.grade,
        p.rawProject,
        ...p.skills
      ]
        .join(' ')
        .toLowerCase();

      if (tokens.length <= 1) {
        return searchableText.includes(q);
      }
      return tokens.some(tok => searchableText.includes(tok));
    }
    return true;
  });
}

export interface TeamMetrics {
  synergyScore: number;
  sharedCount: number;
  coveredSkills: string[];
  missingSkills: string[];
  members: PersonNode[];
  totalMonthlyCost: number; // 단위: 만원/월
  totalProjectCost: number; // 단위: 만원 (durationMonths 곱)
  averageMonthlyRate: number;
  budgetDiff: number; // 양수면 예산 여유, 음수면 예산 초과
  isOverBudget: boolean;
}

export function calculateTeamMetrics(
  people: PersonNode[],
  teamCart: string[],
  isNormalized: boolean,
  targetProject: ProjectNode = PROJECTS[0],
  durationMonths: number = targetProject.durationMonths
): TeamMetrics {
  const targetSkills = targetProject.reqSkills;
  const members = people.filter(p => teamCart.includes(p.id));
  if (members.length === 0) {
    return {
      synergyScore: 0,
      sharedCount: 0,
      coveredSkills: [],
      missingSkills: targetSkills,
      members: [],
      totalMonthlyCost: 0,
      totalProjectCost: 0,
      averageMonthlyRate: 0,
      budgetDiff: targetProject.monthlyBudget,
      isOverBudget: false
    };
  }

  const prjCounts: Record<string, number> = {};
  members.forEach(m => {
    const key = isNormalized ? m.normProject : m.rawProject;
    prjCounts[key] = (prjCounts[key] || 0) + 1;
  });
  const sharedCount = Object.values(prjCounts).filter(c => c > 1).length;
  const synergyScore = Math.min(100, sharedCount * 45 + members.length * 15);

  const covered = Array.from(new Set(members.flatMap(m => m.skills)));
  const missing = targetSkills.filter(s => !covered.includes(s));

  const totalMonthlyCost = members.reduce((acc, m) => acc + m.monthlyRate, 0);
  const totalProjectCost = totalMonthlyCost * durationMonths;
  const averageMonthlyRate = Math.round(totalMonthlyCost / members.length);
  const budgetDiff = targetProject.monthlyBudget - totalMonthlyCost;
  const isOverBudget = budgetDiff < 0;

  return {
    synergyScore,
    sharedCount,
    coveredSkills: covered,
    missingSkills: missing,
    members,
    totalMonthlyCost,
    totalProjectCost,
    averageMonthlyRate,
    budgetDiff,
    isOverBudget
  };
}

export interface BusFactorAlert {
  person: PersonNode;
  endangeredSkills: string[];
  isolatedClient: string;
  backups: PersonNode[];
  replacementCostDiff: number | null;
}

export function analyzeBusFactor(
  people: PersonNode[],
  removedPersonId: string | null
): BusFactorAlert | null {
  if (!removedPersonId) return null;
  const target = people.find(p => p.id === removedPersonId);
  if (!target) return null;

  const remainingPeople = people.filter(p => p.id !== removedPersonId);
  const endangeredSkills = target.skills.filter(skill => {
    const count = remainingPeople.filter(rp => rp.skills.includes(skill)).length;
    return count <= 1;
  });

  const backupCandidates = remainingPeople.filter(rp => rp.normProject === target.normProject);
  const cheapestBackup =
    backupCandidates.length > 0
      ? [...backupCandidates].sort((a, b) => a.monthlyRate - b.monthlyRate)[0]
      : null;

  const domainContextMap: Record<DomainType, string> = {
    금융: 'A금융그룹 차세대 아키텍처 맥락',
    반도체: 'SK하이닉스 FAB 웨이퍼 수율 비전AI 맥락',
    ERP: '글로벌 화학 SAP S/4HANA 재무/물류 통합 맥락',
    제조: 'SK온 배터리 공정 디지털트윈 & 예지보전 히스토리'
  };

  return {
    person: target,
    endangeredSkills,
    isolatedClient: domainContextMap[target.domain],
    backups: backupCandidates,
    replacementCostDiff: cheapestBackup
      ? cheapestBackup.monthlyRate - target.monthlyRate
      : null
  };
}

export function formatKoreanCurrency(manwon: number): string {
  const abs = Math.abs(manwon);
  if (abs >= 10000) {
    const eok = Math.floor(abs / 10000);
    const rem = abs % 10000;
    return rem > 0
      ? `${manwon < 0 ? '-' : ''}${eok}억 ${rem.toLocaleString()}만원`
      : `${manwon < 0 ? '-' : ''}${eok}억원`;
  }
  return `${manwon.toLocaleString()}만원`;
}
