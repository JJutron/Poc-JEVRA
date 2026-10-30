import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  UserMinus,
  RefreshCw,
  Layers,
  Sparkles,
  FolderGit2,
  Plus,
  X,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Share2,
  RotateCcw,
  Coins,
  Calculator,
  Wand2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Hand,
  MousePointer,
  Sun,
  Moon
} from 'lucide-react';
import {
  INITIAL_PEOPLE,
  PROJECTS,
  ALL_SKILLS,
  ALL_DEPTS,
  ALL_DOMAINS,
  AI_QUERY_PRESETS,
  DomainType,
  filterPeople,
  calculateTeamMetrics,
  analyzeBusFactor,
  formatKoreanCurrency
} from './utils/talentGraphLogic';

type PosMap = Record<string, { x: number; y: number }>;

function getTargetPositions(
  isNormalized: boolean,
  layoutMode: 'standard' | 'cluster',
  selectedDomain: DomainType | 'ALL'
): PosMap {
  const map: PosMap = {};

  // 단일 도메인 집중 뷰일 때
  if (selectedDomain !== 'ALL') {
    const domainPrj = PROJECTS.find(p => p.domain === selectedDomain) || PROJECTS[0];
    const domainPeople = INITIAL_PEOPLE.filter(p => p.domain === selectedDomain);

    map[domainPrj.id] = {
      x: 430,
      y: 300
    };

    const singleCoords = [
      { x: 155, y: 155 },
      { x: 155, y: 445 },
      { x: 710, y: 300 }
    ];

    domainPeople.forEach((p, idx) => {
      map[p.id] = singleCoords[idx % singleCoords.length];
    });

    INITIAL_PEOPLE.forEach(p => {
      if (!map[p.id]) map[p.id] = { x: p.x, y: p.y };
    });
    PROJECTS.forEach(pr => {
      if (!map[pr.id]) map[pr.id] = { x: pr.x, y: pr.y };
    });
    return map;
  }

  // 전체 4대 도메인 뷰 (깔끔하게 정규화·연결된 4대 프로젝트 클러스터 배치)
  if (!isNormalized || layoutMode === 'cluster') {
    map['prj1'] = { x: 325, y: 180 };
    map['prj3'] = { x: 540, y: 180 };
    map['prj4'] = { x: 325, y: 475 };
    map['prj2'] = { x: 540, y: 475 };
  } else {
    map['prj1'] = { x: 320, y: 180 };
    map['prj3'] = { x: 545, y: 180 };
    map['prj4'] = { x: 320, y: 475 };
    map['prj2'] = { x: 545, y: 475 };
  }

  // 금융 AX 클러스터 (좌상단)
  map['p1'] = { x: 108, y: 90 }; // 김현우 (한교동 · 금융)
  map['p2'] = { x: 108, y: 182 }; // 이지은 (치이카와 · 금융)
  map['p5'] = { x: 108, y: 274 }; // 정민호 (하치와레 · 금융)

  // 반도체 AX 클러스터 (우상단)
  map['p6'] = { x: 756, y: 90 }; // 강동훈 (우사기 · 반도체)
  map['p7'] = { x: 756, y: 182 }; // 윤서연 (모몽가 · 반도체)
  map['p8'] = { x: 756, y: 274 }; // 송우진 (쿠로미 · 반도체)

  // ERP AX 클러스터 (좌하단)
  map['p9'] = { x: 108, y: 383 }; // 한승우 (폼폼푸린 · ERP)
  map['p10'] = { x: 108, y: 475 }; // 오하영 (시나모롤 · ERP)
  map['p11'] = { x: 108, y: 567 }; // 남궁민 (포차코 · ERP)

  // 제조 AX 클러스터 (우하단)
  map['p3'] = { x: 756, y: 383 }; // 박태준 (해달 랏코 · 제조)
  map['p4'] = { x: 756, y: 475 }; // 최윤아 (마이멜로디 · 제조)
  map['p12'] = { x: 756, y: 567 }; // 배준호 (쿠리만쥬 · 제조)

  return map;
}

export default function TalentGraphMockup() {
  // --- 라이트 모드(화이트 테마) / 다크 모드 상태 (기본값: false = 화이트 라이트 모드 우선 노출) ---
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- 그래프 및 도메인 상태 ---
  const [isNormalized] = useState(true);
  const [layoutMode] = useState<'standard' | 'cluster'>('standard');
  const [selectedDomain, setSelectedDomain] = useState<DomainType | 'ALL'>('ALL');
  const [selectedPersonId, setSelectedPersonId] = useState('p1');
  const [selectedProjectId, setSelectedProjectId] = useState('prj1');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'profile' | 'teambuilder' | 'jev'>('profile');

  // --- 피그마(Figma) 스타일 무한 캔버스 줌(Zoom) & 팬(Pan) 상태 ---
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [canvasTool, setCanvasTool] = useState<'select' | 'hand'>('select');
  const [isPanningCanvas, setIsPanningCanvas] = useState(false);
  const canvasPanRef = useRef<{
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
  } | null>(null);

  // 필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSummaryBanner, setAiSummaryBanner] = useState<string | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [includeRollOff, setIncludeRollOff] = useState(true);
  const [maxMonthlyRate, setMaxMonthlyRate] = useState<number | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [skillSectionOpen, setSkillSectionOpen] = useState(true);
  const [deptSectionOpen, setDeptSectionOpen] = useState(false);

  // 현업 해결 기능 1: 드림팀 시뮬레이터 카트 & 투입 기간(개월) 비용 시뮬레이션
  const [teamCart, setTeamCart] = useState<string[]>(['p1', 'p2', 'p5']);
  const [simDurationMonths, setSimDurationMonths] = useState<number>(6);

  // 현업 해결 기능 2: 핵심 인력 이탈(Bus Factor) 시뮬레이션
  const [removedPersonId, setRemovedPersonId] = useState<string | null>(null);

  // 낮은 확신도 데이터 검수 승인 상태 (p4 최윤아, p8 송우진)
  const [approvedIds, setApprovedIds] = useState<string[]>([]);

  // --- 부드러운 스프링 물리 좌표 & 드래그 상태 ---
  const [positions, setPositions] = useState<PosMap>(() =>
    getTargetPositions(true, 'standard', 'ALL')
  );
  const currentPositionsRef = useRef<PosMap>(
    getTargetPositions(true, 'standard', 'ALL')
  );
  const targetPositionsRef = useRef<PosMap>(
    getTargetPositions(true, 'standard', 'ALL')
  );
  const velocitiesRef = useRef<PosMap>({});
  const draggingRef = useRef<{
    id: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
  } | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 스프링 물리 루프 (React 19 동기 Ref 루프)
  const startSpringAnimation = () => {
    if (animFrameRef.current !== null) return;

    const step = () => {
      let stillMoving = false;
      const prev = currentPositionsRef.current;
      const next: PosMap = { ...prev };
      const targets = targetPositionsRef.current;
      const vels = velocitiesRef.current;

      for (const key of Object.keys(targets)) {
        if (draggingRef.current?.id === key) continue;
        const cur = prev[key] || targets[key];
        const tgt = targets[key];
        const vel = vels[key] || { x: 0, y: 0 };

        const dx = tgt.x - cur.x;
        const dy = tgt.y - cur.y;

        const stiffness = 0.12;
        const damping = 0.76;

        const vx = (vel.x + dx * stiffness) * damping;
        const vy = (vel.y + dy * stiffness) * damping;

        vels[key] = { x: vx, y: vy };

        if (
          Math.abs(dx) > 0.2 ||
          Math.abs(dy) > 0.2 ||
          Math.abs(vx) > 0.2 ||
          Math.abs(vy) > 0.2
        ) {
          stillMoving = true;
          next[key] = { x: cur.x + vx, y: cur.y + vy };
        } else {
          next[key] = { x: tgt.x, y: tgt.y };
          vels[key] = { x: 0, y: 0 };
        }
      }

      currentPositionsRef.current = next;
      setPositions(next);

      if (stillMoving) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        animFrameRef.current = null;
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    targetPositionsRef.current = getTargetPositions(
      isNormalized,
      layoutMode,
      selectedDomain
    );
    startSpringAnimation();
    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [isNormalized, layoutMode, selectedDomain]);

  // --- 피그마 스타일 캔버스 배경 드래그(Pan) & 휠 줌(Zoom) 핸들러 ---
  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-canvas-toolbar="true"]')) return;
    if (
      canvasTool === 'hand' ||
      e.button === 1 ||
      !(e.target as HTMLElement).closest('[data-node-card="true"]')
    ) {
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanningCanvas(true);
      canvasPanRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        origPanX: pan.x,
        origPanY: pan.y
      };
    }
  };

  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasPanRef.current) return;
    const dx = e.clientX - canvasPanRef.current.startX;
    const dy = e.clientY - canvasPanRef.current.startY;
    setPan({
      x: canvasPanRef.current.origPanX + dx,
      y: canvasPanRef.current.origPanY + dy
    });
  };

  const handleCanvasPointerUp = () => {
    if (canvasPanRef.current) {
      canvasPanRef.current = null;
      setIsPanningCanvas(false);
    }
  };

  const handleCanvasWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomStep = e.deltaY < 0 ? 0.08 : -0.08;
    setZoom(prev => {
      const next = Math.min(2.0, Math.max(0.45, Number((prev + zoomStep).toFixed(2))));
      return next;
    });
  };

  const adjustZoom = (delta: number) => {
    setZoom(prev => Math.min(2.0, Math.max(0.45, Number((prev + delta).toFixed(2)))));
  };

  const fitCanvasView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // 포인터 드래그 핸들러 (개별 노드 카드 드래그, 현재 줌 배율 보정 포함)
  const handleNodePointerDown = (e: React.PointerEvent, id: string) => {
    if (canvasTool === 'hand') return;
    if ((e.target as HTMLElement).closest('button')) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const cur = positions[id] || { x: 0, y: 0 };
    draggingRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      origX: cur.x,
      origY: cur.y,
      hasMoved: false
    };
  };

  const handleNodePointerMove = (e: React.PointerEvent, id: string) => {
    const drag = draggingRef.current;
    if (!drag || drag.id !== id) return;
    e.stopPropagation();
    const dx = (e.clientX - drag.startX) / zoom;
    const dy = (e.clientY - drag.startY) / zoom;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      drag.hasMoved = true;
    }
    const newX = Math.max(-450, Math.min(1350, drag.origX + dx));
    const newY = Math.max(-350, Math.min(1100, drag.origY + dy));
    currentPositionsRef.current[id] = { x: newX, y: newY };
    targetPositionsRef.current[id] = { x: newX, y: newY };
    setPositions(prev => ({
      ...prev,
      [id]: { x: newX, y: newY }
    }));
  };

  const handleNodePointerUp = (
    e: React.PointerEvent,
    id: string,
    onClickAction: () => void
  ) => {
    const drag = draggingRef.current;
    if (drag && drag.id === id) {
      e.stopPropagation();
      const moved = drag.hasMoved;
      draggingRef.current = null;
      if (!moved) {
        onClickAction();
      }
    }
  };

  const resetNodePositions = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    targetPositionsRef.current = getTargetPositions(
      isNormalized,
      layoutMode,
      selectedDomain
    );
    startSpringAnimation();
  };

  // AI 자연어 질의 실행 또는 프리셋 선택
  const applyAIQueryPreset = (preset: (typeof AI_QUERY_PRESETS)[number]) => {
    setSearchQuery(preset.query);
    setSelectedDomain(preset.domain);
    setSelectedProjectId(preset.targetProjectId);
    setTeamCart(preset.recommendedTeam);
    setSelectedPersonId(preset.recommendedTeam[0]);
    setAiSummaryBanner(preset.summary);
    setRightTab('teambuilder');
  };

  const handleCustomAISearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setAiSummaryBanner(null);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matchedPreset = AI_QUERY_PRESETS.find(
      pr =>
        q.includes(pr.domain.toLowerCase()) ||
        (pr.domain === '반도체' && (q.includes('하이닉스') || q.includes('웨이퍼') || q.includes('수율'))) ||
        (pr.domain === '금융' && (q.includes('은행') || q.includes('금융') || q.includes('코어뱅킹'))) ||
        (pr.domain === 'ERP' && (q.includes('sap') || q.includes('erp') || q.includes('재무'))) ||
        (pr.domain === '제조' && (q.includes('배터리') || q.includes('디지털트윈') || q.includes('제조')))
    );

    if (matchedPreset) {
      setSelectedProjectId(matchedPreset.targetProjectId);
      setTeamCart(matchedPreset.recommendedTeam);
      setAiSummaryBanner(matchedPreset.summary);
      setRightTab('teambuilder');
    } else {
      const matched = filterPeople(INITIAL_PEOPLE, {
        onlyAvailable,
        includeRollOff,
        selectedSkills,
        selectedDepts,
        selectedDomain,
        maxMonthlyRate,
        searchQuery
      });
      if (matched.length > 0) {
        const top3 = matched.slice(0, 3).map(m => m.id);
        const totalCost = matched
          .slice(0, 3)
          .reduce((s, m) => s + m.monthlyRate, 0);
        setTeamCart(top3);
        setSelectedPersonId(top3[0]);
        setAiSummaryBanner(
          `AI 관계 탐색 결과 ${matched.length}명 매칭 · 상위 ${top3.length}명 자동 편성 (월 ${formatKoreanCurrency(totalCost)})`
        );
        setRightTab('teambuilder');
      }
    }
  };

  // 필터링된 인재 및 프로젝트 목록
  const filteredPeople = useMemo(() => {
    return filterPeople(INITIAL_PEOPLE, {
      onlyAvailable,
      includeRollOff,
      selectedSkills,
      selectedDepts,
      selectedDomain,
      maxMonthlyRate,
      searchQuery
    });
  }, [
    onlyAvailable,
    includeRollOff,
    selectedSkills,
    selectedDepts,
    selectedDomain,
    maxMonthlyRate,
    searchQuery
  ]);

  const visibleProjects = useMemo(() => {
    if (selectedDomain === 'ALL') return PROJECTS;
    return PROJECTS.filter(p => p.domain === selectedDomain);
  }, [selectedDomain]);

  const selectedPerson =
    INITIAL_PEOPLE.find(p => p.id === selectedPersonId) || INITIAL_PEOPLE[0];

  const activeTargetProject =
    PROJECTS.find(prj => prj.id === selectedProjectId) ||
    PROJECTS.find(prj => prj.id === selectedPerson.normProject) ||
    PROJECTS[0];

  const selectedPersonProject =
    PROJECTS.find(prj => prj.id === selectedPerson.normProject) || PROJECTS[0];

  const selectedPersonColleagues = useMemo(() => {
    return INITIAL_PEOPLE.filter(
      p => p.id !== selectedPerson.id && p.normProject === selectedPerson.normProject
    );
  }, [selectedPerson]);

  const teamMetrics = useMemo(() => {
    return calculateTeamMetrics(
      INITIAL_PEOPLE,
      teamCart,
      isNormalized,
      activeTargetProject,
      simDurationMonths
    );
  }, [teamCart, isNormalized, activeTargetProject, simDurationMonths]);

  const busFactorAlert = useMemo(() => {
    return analyzeBusFactor(INITIAL_PEOPLE, removedPersonId);
  }, [removedPersonId]);

  const lowConfPeople = useMemo(
    () => INITIAL_PEOPLE.filter(p => p.jevConf < 0.65),
    []
  );
  const pendingReviewCount = lowConfPeople.filter(
    p => !approvedIds.includes(p.id)
  ).length;

  const toggleSkillFilter = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const toggleDeptFilter = (dept: string) => {
    setSelectedDepts(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const toggleTeamMember = (id: string) => {
    setTeamCart(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleApproveLowConf = (id: string) => {
    setApprovedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const isCompactAllView = selectedDomain === 'ALL';

  return (
    <div
      className={`flex h-screen w-full font-sans select-none overflow-hidden transition-colors duration-200 ${
        isDarkMode
          ? 'bg-[#0B0F19] text-slate-100'
          : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* ================= 1. 좌측 사이드바 (Talent & Cost Filter - SK AX Brand Theme) ================= */}
      <aside
        className={`w-64 border-r flex flex-col justify-between shrink-0 z-20 overflow-y-auto transition-colors ${
          isDarkMode
            ? 'bg-[#111624] border-[#242B3D]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div className="p-3.5 space-y-3.5">
          {/* SK AX 브랜드 헤더 (SK Red #EA002C & SK Orange #F47725 행복날개 엠블럼) */}
          <div
            className={`flex items-center justify-between pb-2.5 border-b ${
              isDarkMode ? 'border-[#252D42]' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#EA002C] via-[#F04E23] to-[#F47725] p-[1px] shadow-[0_2px_10px_rgba(234,0,44,0.28)]">
                <div
                  className={`w-full h-full rounded-[7px] flex items-center justify-center ${
                    isDarkMode ? 'bg-[#141826]/90' : 'bg-white/95'
                  }`}
                >
                  <Share2 className="w-4 h-4 text-[#EA002C]" />
                </div>
              </div>
              <div>
                <div className="text-sm font-extrabold tracking-tight leading-tight flex items-center gap-1">
                  <span className="text-[#EA002C]">SK</span>
                  <span className="text-[#F47725]">AX</span>
                  <span
                    className={`font-bold ${
                      isDarkMode ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Talent Graph
                  </span>
                </div>
                <div
                  className={`text-[10.5px] font-semibold leading-tight ${
                    isDarkMode ? 'text-[#FF8A3D]' : 'text-[#EA002C]'
                  }`}
                >
                  AI 인재 배치 & 비용 시뮬레이터
                </div>
              </div>
            </div>
            <span
              className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                isDarkMode
                  ? 'bg-[#241622] text-[#FF8A3D] border-[#EA002C]/40'
                  : 'bg-orange-50 text-[#EA002C] border-[#F47725]/40'
              }`}
            >
              12명·4PJT
            </span>
          </div>

          {/* 가용 인력(Available) & 단가 상한 필터 */}
          <div
            className={`space-y-2 p-2.5 rounded-xl border ${
              isDarkMode
                ? 'bg-[#161D2F] border-[#26314A]'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <label className="flex items-center justify-between cursor-pointer">
              <span
                className={`text-xs font-semibold ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                가용 인력만 보기 (Available)
              </span>
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={e => setOnlyAvailable(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-8 h-4 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all relative peer-checked:bg-gradient-to-r peer-checked:from-[#EA002C] peer-checked:to-[#F47725] ${
                  isDarkMode ? 'bg-[#263248]' : 'bg-slate-300'
                }`}
              />
            </label>

            <label
              className={`flex items-center justify-between cursor-pointer pt-1 border-t ${
                isDarkMode ? 'border-[#232D42]' : 'border-slate-200'
              }`}
            >
              <div>
                <span
                  className={`text-xs font-medium block ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  종료 임박(Roll-off) 포함
                </span>
                <span
                  className={`text-[10px] ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  현재 {filteredPeople.length}명 표시 중
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeRollOff}
                onChange={e => setIncludeRollOff(e.target.checked)}
                className="accent-[#EA002C] w-3.5 h-3.5 rounded"
              />
            </label>

            {/* 개인 월 단가 상한 필터 */}
            <div
              className={`pt-1.5 border-t ${
                isDarkMode ? 'border-[#232D42]' : 'border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span
                  className={`font-medium flex items-center gap-1 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  <Coins className="w-3 h-3 text-[#F47725]" /> 인당 월 단가 상한
                </span>
                <span
                  className={`font-mono font-bold ${
                    isDarkMode ? 'text-[#FF8A3D]' : 'text-[#EA002C]'
                  }`}
                >
                  {maxMonthlyRate ? `${maxMonthlyRate.toLocaleString()}만 이하` : '제한 없음'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { label: '전체', val: null },
                  { label: '≤1,600만', val: 1600 },
                  { label: '≤1,400만', val: 1400 }
                ].map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setMaxMonthlyRate(opt.val)}
                    className={`py-1 rounded text-[10px] font-mono border transition-colors ${
                      maxMonthlyRate === opt.val
                        ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white border-[#F47725] font-bold shadow-sm'
                        : isDarkMode
                          ? 'bg-[#101625] text-slate-300 border-[#28344E] hover:border-[#F47725]'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-[#F47725]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 핵심 기술 스택 체크박스 섹션 */}
          <div
            className={`pt-1 border-t ${
              isDarkMode ? 'border-[#232B3E]' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => setSkillSectionOpen(!skillSectionOpen)}
              className={`w-full flex items-center justify-between text-xs font-bold mb-2 ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <span>핵심 기술 스택</span>
              {skillSectionOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {skillSectionOpen && (
              <div className="grid grid-cols-2 gap-1">
                {ALL_SKILLS.map(skill => {
                  const active = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkillFilter(skill)}
                      className={`flex items-center justify-between py-1 px-2 rounded border text-[11px] text-left transition-colors ${
                        active
                          ? isDarkMode
                            ? 'bg-[#2C1624] border-[#EA002C] text-white font-semibold shadow-[0_0_10px_rgba(234,0,44,0.2)]'
                            : 'bg-rose-50 border-[#EA002C] text-[#EA002C] font-bold'
                          : isDarkMode
                            ? 'bg-[#161E30] border-[#25324B] text-slate-300 hover:border-[#F47725]'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-[#F47725]'
                      }`}
                    >
                      <span className="truncate">{skill}</span>
                      <span
                        className={`text-[9.5px] font-mono ml-1 ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-400'
                        }`}
                      >
                        {INITIAL_PEOPLE.filter(p => p.skills.includes(skill)).length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 부서 체크박스 섹션 */}
          <div
            className={`pt-1 border-t ${
              isDarkMode ? 'border-[#232B3E]' : 'border-slate-200'
            }`}
          >
            <button
              onClick={() => setDeptSectionOpen(!deptSectionOpen)}
              className={`w-full flex items-center justify-between text-xs font-bold mb-1.5 ${
                isDarkMode ? 'text-slate-200' : 'text-slate-800'
              }`}
            >
              <span>소속 조직 ({selectedDepts.length || '전체'})</span>
              {deptSectionOpen ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {deptSectionOpen && (
              <div className="space-y-1">
                {ALL_DEPTS.map(dept => {
                  const active = selectedDepts.includes(dept);
                  return (
                    <button
                      key={dept}
                      onClick={() => toggleDeptFilter(dept)}
                      className={`w-full flex items-center gap-2 py-1 px-1.5 rounded text-xs text-left transition-colors ${
                        isDarkMode ? 'hover:bg-[#1A2336]' : 'hover:bg-slate-100'
                      }`}
                    >
                      <span
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[9px] ${
                          active
                            ? 'bg-gradient-to-br from-[#EA002C] to-[#F47725] border-[#F47725] text-white font-bold'
                            : isDarkMode
                              ? 'bg-[#172234] border-[#334663] text-transparent'
                              : 'bg-white border-slate-300 text-transparent'
                        }`}
                      >
                        ✓
                      </span>
                      <span
                        className={
                          active
                            ? isDarkMode
                              ? 'text-white font-semibold'
                              : 'text-[#EA002C] font-bold'
                            : isDarkMode
                              ? 'text-slate-300'
                              : 'text-slate-700'
                        }
                      >
                        {dept}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 하단 AI 인사이트 카드 1: 도메인 고립(Bus Factor) 진단 */}
          <div
            className={`p-2.5 rounded-xl border space-y-1.5 ${
              isDarkMode
                ? 'bg-[#161E30] border-[#28354E]'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${
                  isDarkMode ? 'text-white' : 'text-slate-800'
                }`}
              >
                도메인 고립(Bus Factor) & 대체 단가
              </span>
              {removedPersonId && (
                <button
                  onClick={() => setRemovedPersonId(null)}
                  className="text-[10px] underline text-[#EA002C] font-semibold"
                >
                  해제
                </button>
              )}
            </div>
            <p
              className={`text-[10.5px] leading-snug ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              핵심 인력 이탈 시 도메인 공백과 동일 프로젝트 대체 인력의 단가 차이를 계산합니다.
            </p>
            <select
              aria-label="이탈 시뮬레이션 대상 선택"
              value={removedPersonId || ''}
              onChange={e => setRemovedPersonId(e.target.value || null)}
              className={`w-full text-[11px] p-1.5 border rounded font-medium focus:outline-none focus:border-[#F47725] ${
                isDarkMode
                  ? 'bg-[#0F1523] border-[#2C3A56] text-slate-200'
                  : 'bg-white border-slate-300 text-slate-800'
              }`}
            >
              <option value="">-- 이탈 시뮬레이션 대상 선택 --</option>
              {INITIAL_PEOPLE.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.domain}] {p.name} ({p.grade} · {p.monthlyRate.toLocaleString()}만)
                </option>
              ))}
            </select>
          </div>

          {/* 하단 AI 인사이트 카드 2: 비용 시뮬레이터 & 데이터 검수 바로가기 */}
          <div
            className={`p-2.5 rounded-xl border space-y-2 ${
              isDarkMode
                ? 'bg-[#161E30] border-[#28354E]'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div
              className={`flex items-center justify-between text-xs font-bold ${
                isDarkMode ? 'text-white' : 'text-slate-800'
              }`}
            >
              <span>드림팀 비용 산정 & 검수</span>
              <span
                className={`text-[10px] font-mono font-bold ${
                  isDarkMode ? 'text-[#FF8A3D]' : 'text-[#EA002C]'
                }`}
              >
                월 {teamMetrics.totalMonthlyCost.toLocaleString()}만
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setRightTab('teambuilder')}
                className={`px-2 py-1.5 rounded text-[11px] font-bold border transition-all ${
                  rightTab === 'teambuilder'
                    ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white border-[#F47725] shadow-sm'
                    : isDarkMode
                      ? 'bg-[#1C263B] text-slate-200 border-[#2D3D5C] hover:border-[#F47725]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#F47725]'
                }`}
              >
                팀·비용 ({teamCart.length}명)
              </button>
              <button
                onClick={() => setRightTab('jev')}
                className={`px-2 py-1.5 rounded text-[11px] font-bold border transition-all ${
                  rightTab === 'jev'
                    ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white border-[#F47725] shadow-sm'
                    : isDarkMode
                      ? 'bg-[#1C263B] text-slate-200 border-[#2D3D5C] hover:border-[#F47725]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#F47725]'
                }`}
              >
                데이터 검수 ({pendingReviewCount})
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ================= 2. 중앙 그래프 캔버스 (라이트 화이트 / 다크 모드 완벽 지원) ================= */}
      <main
        className={`flex-1 relative overflow-hidden flex flex-col transition-colors duration-200 ${
          isDarkMode ? 'bg-[#0B0F19]' : 'bg-[#F8FAFC]'
        }`}
      >
        {/* 피그마 스타일 무한 도트 그리드 배경 + SK AX Red & Orange 앰비언트 라이트 */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: isDarkMode ? 0.35 : 0.7,
            backgroundImage: isDarkMode
              ? 'radial-gradient(#3B4963 1.2px, transparent 1.2px), radial-gradient(circle at 35% 40%, rgba(234, 0, 44, 0.11), transparent 55%), radial-gradient(circle at 70% 60%, rgba(244, 119, 37, 0.10), transparent 55%)'
              : 'radial-gradient(#CBD5E1 1.3px, transparent 1.3px), radial-gradient(circle at 35% 40%, rgba(234, 0, 44, 0.05), transparent 55%), radial-gradient(circle at 70% 60%, rgba(244, 119, 37, 0.06), transparent 55%)',
            backgroundSize: `${Math.max(12, Math.round(24 * zoom))}px ${Math.max(12, Math.round(24 * zoom))}px, 100% 100%, 100% 100%`,
            backgroundPosition: `${pan.x}px ${pan.y}px, 0 0, 0 0`
          }}
        />

        {/* 상단 헤더 1층: SK AX 공식 타이틀 + AI 자연어 검색바 + 라이트/다크 모드 스위치 */}
        <header
          className={`h-13 px-4 flex items-center justify-between gap-3 z-20 shrink-0 border-b backdrop-blur transition-colors ${
            isDarkMode
              ? 'border-[#242C40]/90 bg-[#0D121F]/95'
              : 'border-slate-200 bg-white/95 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-0.5 rounded bg-gradient-to-r from-[#EA002C] to-[#F47725] text-[10.5px] font-extrabold text-white tracking-wider shadow-[0_2px_8px_rgba(234,0,44,0.3)]">
              SK AX
            </span>
            <h1
              className={`text-sm font-bold tracking-tight whitespace-nowrap ${
                isDarkMode ? 'text-white' : 'text-slate-900'
              }`}
            >
              인재·프로젝트 지식 그래프 대시보드
            </h1>
          </div>

          {/* AI 기반 자연어 관계 & 예산 검색바 */}
          <form
            onSubmit={handleCustomAISearch}
            className="flex-1 max-w-lg relative flex items-center"
          >
            <Search className="w-3.5 h-3.5 text-[#F47725] absolute left-3 pointer-events-none" />
            <input
              type="text"
              aria-label="AI 관계 및 예산 질문 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="AI 관계·비용 검색 (예: 반도체 수율 비전AI 월 4,800만 이내 팀 추천)"
              className={`w-full pl-8 pr-20 py-1.5 text-xs border rounded-lg focus:outline-none focus:border-[#EA002C] transition-colors ${
                isDarkMode
                  ? 'bg-[#151D2E] border-[#2C3954] text-white placeholder:text-slate-400'
                  : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setAiSummaryBanner(null);
                }}
                className={`absolute right-14 text-[10px] ${
                  isDarkMode
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                초기화
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1 px-2.5 py-1 rounded bg-gradient-to-r from-[#EA002C] to-[#F47725] text-[10px] font-bold text-white flex items-center gap-1 hover:brightness-110 shadow-[0_2px_8px_rgba(234,0,44,0.28)]"
            >
              <Wand2 className="w-2.5 h-2.5" /> AI 편성
            </button>
          </form>

          {/* 우측 컨트롤: 깔끔한 화이트(라이트) / 다크 모드 전환 + 위치 초기화 */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`flex items-center p-0.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#141C2C] border-[#26334D]'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setIsDarkMode(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                  !isDarkMode
                    ? 'bg-white text-[#EA002C] shadow-xs border border-slate-200/80'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-[#F47725]" />
                라이트(화이트)
              </button>
              <button
                type="button"
                onClick={() => setIsDarkMode(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                다크 모드
              </button>
            </div>

            <button
              type="button"
              onClick={resetNodePositions}
              title="노드 배치 및 배율 초기화"
              className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                isDarkMode
                  ? 'bg-[#141C2C] border-[#26334D] text-slate-300 hover:text-white hover:border-[#F47725]'
                  : 'bg-white border-slate-200 text-slate-700 hover:text-[#EA002C] hover:border-[#F47725]'
              }`}
            >
              <RotateCcw className="w-3 h-3 text-[#F47725]" />
              정렬 초기화
            </button>
          </div>
        </header>

        {/* 상단 헤더 2층: SK AX 4대 산업 도메인 탭 + AI 추천 질의 프리셋 칩 */}
        <div
          className={`px-4 py-2 border-b flex items-center justify-between gap-2 z-20 shrink-0 transition-colors ${
            isDarkMode
              ? 'bg-[#101625]/95 border-[#222B3E]'
              : 'bg-slate-50/95 border-slate-200'
          }`}
        >
          {/* 도메인 전환 탭 */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSelectedDomain('ALL')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                selectedDomain === 'ALL'
                  ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white shadow-[0_2px_10px_rgba(234,0,44,0.28)]'
                  : isDarkMode
                    ? 'bg-[#172033] text-slate-300 hover:text-white border border-[#27344E]'
                    : 'bg-white text-slate-700 hover:text-[#EA002C] border border-slate-200'
              }`}
            >
              전체 도메인 (12명·4PJT)
            </button>
            {ALL_DOMAINS.map(dom => {
              const active = selectedDomain === dom;
              return (
                <button
                  key={dom}
                  onClick={() => {
                    setSelectedDomain(dom);
                    const prj = PROJECTS.find(p => p.domain === dom);
                    if (prj) setSelectedProjectId(prj.id);
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                    active
                      ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white shadow-[0_2px_10px_rgba(234,0,44,0.28)]'
                      : isDarkMode
                        ? 'bg-[#172033] text-slate-300 hover:text-white border border-[#27344E]'
                        : 'bg-white text-slate-700 hover:text-[#EA002C] border border-slate-200'
                  }`}
                >
                  {dom} AX
                </button>
              );
            })}
          </div>

          {/* 원클릭 AI 관계·비용 프리셋 칩 */}
          <div className="flex items-center gap-1 overflow-x-auto">
            <span
              className={`text-[10px] font-mono font-bold shrink-0 mr-0.5 ${
                isDarkMode ? 'text-[#FF8A3D]' : 'text-[#EA002C]'
              }`}
            >
              SK AX AI 질의:
            </span>
            {AI_QUERY_PRESETS.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyAIQueryPreset(preset)}
                className={`px-2 py-0.5 rounded-full text-[10.5px] border whitespace-nowrap transition-colors font-medium ${
                  isDarkMode
                    ? 'bg-[#1F1829] hover:bg-[#2E1E36] text-orange-200 border-[#F47725]/40'
                    : 'bg-white hover:bg-orange-50 text-slate-700 hover:text-[#EA002C] border-[#F47725]/40 shadow-2xs'
                }`}
              >
                ✨ {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 플로팅 배너 (AI 편성 결과 또는 이탈 리스크 경고) */}
        {(aiSummaryBanner || busFactorAlert) && (
          <div className="px-4 pt-2 flex items-start justify-between gap-3 z-20 pointer-events-none">
            {aiSummaryBanner ? (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border px-3 py-1.5 rounded-lg pointer-events-auto flex items-center gap-2 text-xs shadow-md ${
                  isDarkMode
                    ? 'bg-[#231524]/95 border-[#F47725]/60 text-slate-100'
                    : 'bg-white/95 border-[#F47725] text-slate-800'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5 text-[#EA002C] shrink-0" />
                <span className="font-medium">{aiSummaryBanner}</span>
                <button
                  onClick={() => setAiSummaryBanner(null)}
                  className="text-[10px] text-slate-400 hover:text-[#EA002C] ml-2 underline"
                >
                  닫기
                </button>
              </motion.div>
            ) : (
              <div />
            )}

            {busFactorAlert && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border px-3 py-1.5 rounded-lg shadow-md pointer-events-auto text-[11px] ${
                  isDarkMode
                    ? 'bg-[#2C1420]/95 border-[#EA002C]/60 text-rose-200'
                    : 'bg-rose-50/95 border-[#EA002C] text-slate-800'
                }`}
              >
                <div className="font-bold text-[#EA002C] flex items-center justify-between gap-3">
                  <span>
                    ⚠️ [{busFactorAlert.person.name} · 월 {busFactorAlert.person.monthlyRate.toLocaleString()}만] 이탈 시 고립 위험
                  </span>
                  <button
                    onClick={() => setRemovedPersonId(null)}
                    className="underline text-[10px]"
                  >
                    닫기
                  </button>
                </div>
                <div className="mt-0.5">
                  추천 대체자:{' '}
                  <strong className="text-[#F47725]">
                    {busFactorAlert.backups.map(b => `${b.name}(${b.monthlyRate}만)`).join(', ')}
                  </strong>
                  {busFactorAlert.replacementCostDiff !== null && (
                    <span className="ml-1.5 font-mono font-semibold text-[#EA002C]">
                      ({busFactorAlert.replacementCostDiff <= 0
                        ? `월 ${Math.abs(busFactorAlert.replacementCostDiff)}만원 절감`
                        : `월 +${busFactorAlert.replacementCostDiff}만원`})
                    </span>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* 그래프 캔버스 영역 (피그마 스타일 무한 드래그 Pan & 휠 Zoom 지원) */}
        <div
          onPointerDown={handleCanvasPointerDown}
          onPointerMove={handleCanvasPointerMove}
          onPointerUp={handleCanvasPointerUp}
          onPointerCancel={handleCanvasPointerUp}
          onWheel={handleCanvasWheel}
          className={`relative flex-1 w-full overflow-hidden ${
            isPanningCanvas
              ? 'cursor-grabbing'
              : canvasTool === 'hand'
                ? 'cursor-grab'
                : 'cursor-default'
          }`}
        >
          {/* 피그마 트랜스폼 스테이지 (Pan + Zoom 적용 레이어) */}
          <div
            className="w-full h-full relative origin-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`
            }}
          >
            {/* --- SVG 곡선 점선 엣지 레이어 (SK AX Orange & Red 하이라이트) --- */}
            <svg className="w-full h-full absolute inset-0 pointer-events-none overflow-visible">
              <defs>
                <marker
                  id="arrow-slate"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 0 1.5 L 8 5 L 0 8.5"
                    fill="none"
                    stroke={isDarkMode ? '#64748B' : '#94A3B8'}
                    strokeWidth="1.6"
                  />
                </marker>
                <marker
                  id="arrow-sk"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 0 1.5 L 8 5 L 0 8.5"
                    fill="none"
                    stroke="#F47725"
                    strokeWidth="1.8"
                  />
                </marker>
                <marker
                  id="arrow-amber"
                  viewBox="0 0 10 10"
                  refX="7"
                  refY="5"
                  markerWidth="5"
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path
                    d="M 0 1.5 L 8 5 L 0 8.5"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="1.8"
                  />
                </marker>
              </defs>

              {/* 1) 인재 -> 표준 프로젝트 곡선 점선 연결선 */}
              {filteredPeople.map(person => {
                const targetPrj = visibleProjects.find(
                  pr => pr.id === person.normProject
                );
                if (!targetPrj) return null;

                const personPos = positions[person.id] || person;
                const prjPos = positions[targetPrj.id] || targetPrj;

                const isLowConf =
                  person.jevConf < 0.65 && !approvedIds.includes(person.id);
                const isRemoved = removedPersonId === person.id;
                const isHighlighted =
                  selectedPersonId === person.id ||
                  selectedProjectId === targetPrj.id ||
                  hoveredNodeId === person.id ||
                  hoveredNodeId === targetPrj.id;

                const personHalfW = isCompactAllView ? 81 : 90;
                const prjHalfW = isCompactAllView ? 95 : 112;

                const isLeft = personPos.x < prjPos.x;
                const startX = isLeft
                  ? personPos.x + personHalfW
                  : personPos.x - personHalfW;
                const startY = personPos.y;
                const endX = isLeft
                  ? prjPos.x - prjHalfW
                  : prjPos.x + prjHalfW;
                const endY = prjPos.y;

                const ctrlX1 = startX + (endX - startX) * 0.45;
                const ctrlY1 = startY;
                const ctrlX2 = startX + (endX - startX) * 0.55;
                const ctrlY2 = endY;

                const pathData = `M ${startX} ${startY} C ${ctrlX1} ${ctrlY1}, ${ctrlX2} ${ctrlY2}, ${endX} ${endY}`;
                const labelX = (startX + endX) / 2;
                const labelY = (startY + endY) / 2;

                const labelText = isLowConf
                  ? `검수대기 (${person.jevConf})`
                  : person.edgeLabel;

                return (
                  <g key={`edge-${person.id}-${targetPrj.id}`}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={
                        isRemoved
                          ? '#EF4444'
                          : isLowConf
                            ? '#F59E0B'
                            : isHighlighted
                              ? '#F47725'
                              : isDarkMode
                                ? '#52627A'
                                : '#94A3B8'
                      }
                      strokeWidth={isHighlighted ? 2.2 : 1.5}
                      strokeDasharray="6 6"
                      className={isRemoved ? '' : 'animate-edge-flow'}
                      opacity={isRemoved ? 0.35 : 0.92}
                      markerEnd={
                        isLowConf
                          ? 'url(#arrow-amber)'
                          : isHighlighted
                            ? 'url(#arrow-sk)'
                            : 'url(#arrow-slate)'
                      }
                    />
                    {isHighlighted && !isRemoved && (
                      <circle
                        r="3.2"
                        fill={isLowConf ? '#F59E0B' : '#EA002C'}
                      >
                        <animateMotion
                          dur="2.1s"
                          repeatCount="indefinite"
                          path={pathData}
                        />
                      </circle>
                    )}
                    <rect
                      x={labelX - 34}
                      y={labelY - 8}
                      width="68"
                      height="16"
                      rx="4"
                      fill={isDarkMode ? '#0D121F' : '#FFFFFF'}
                      stroke={
                        isLowConf
                          ? '#F59E0B'
                          : isHighlighted
                            ? '#EA002C'
                            : isDarkMode
                              ? '#243046'
                              : '#CBD5E1'
                      }
                      strokeWidth="1"
                    />
                    <text
                      x={labelX}
                      y={labelY + 3}
                      textAnchor="middle"
                      className={`text-[9px] font-semibold ${
                        isLowConf
                          ? 'fill-amber-500'
                          : isHighlighted
                            ? isDarkMode
                              ? 'fill-[#FF9E5E]'
                              : 'fill-[#EA002C]'
                            : isDarkMode
                              ? 'fill-slate-300'
                              : 'fill-slate-600'
                      }`}
                    >
                      {labelText}
                    </text>
                  </g>
                );
              })}

              {/* 2) 드림팀 카트에 담긴 인원끼리 과거 같은 프로젝트 수행 시 '동료 시너지 ✓' 표시 */}
              {teamCart.length >= 2 &&
                (() => {
                  const cartMembers = filteredPeople.filter(p =>
                    teamCart.includes(p.id)
                  );
                  const byProject: Record<string, typeof cartMembers> = {};
                  cartMembers.forEach(m => {
                    if (!byProject[m.normProject])
                      byProject[m.normProject] = [];
                    byProject[m.normProject].push(m);
                  });

                  const lines: React.ReactNode[] = [];
                  Object.values(byProject).forEach(group => {
                    if (group.length < 2) return;
                    const sorted = [...group].sort((a, b) => {
                      const posA = positions[a.id] || a;
                      const posB = positions[b.id] || b;
                      return posA.y - posB.y;
                    });
                    for (let i = 0; i < sorted.length - 1; i++) {
                      const m1 = positions[sorted[i].id] || sorted[i];
                      const m2 = positions[sorted[i + 1].id] || sorted[i + 1];
                      const midX = (m1.x + m2.x) / 2;
                      const midY = (m1.y + m2.y) / 2;
                      lines.push(
                        <g key={`synergy-${sorted[i].id}-${sorted[i + 1].id}`}>
                          <line
                            x1={m1.x}
                            y1={m1.y}
                            x2={m2.x}
                            y2={m2.y}
                            stroke="#F47725"
                            strokeWidth="2.2"
                            strokeDasharray="5 5"
                            className="animate-edge-flow"
                          />
                          <rect
                            x={midX - 34}
                            y={midY - 8}
                            width="68"
                            height="16"
                            rx="8"
                            fill={isDarkMode ? '#26141F' : '#FFF1F2'}
                            stroke="#EA002C"
                          />
                          <text
                            x={midX}
                            y={midY + 3}
                            textAnchor="middle"
                            className={`text-[9px] font-bold ${
                              isDarkMode ? 'fill-[#FF9E5E]' : 'fill-[#EA002C]'
                            }`}
                          >
                            동료 시너지 ✓
                          </text>
                        </g>
                      );
                    }
                  });
                  return lines;
                })()}
            </svg>

            {/* --- 프로젝트 허브 카드 노드들 (4대 표준 프로젝트 허브) --- */}
            <AnimatePresence>
              {visibleProjects.map(prj => {
                const pos = positions[prj.id] || { x: prj.x, y: prj.y };
                const connectedCount = INITIAL_PEOPLE.filter(
                  p => p.normProject === prj.id
                ).length;
                const isHighlighted =
                  selectedProjectId === prj.id ||
                  selectedPerson.normProject === prj.id ||
                  hoveredNodeId === prj.id;

                const domainBadgeColor: Record<DomainType, string> = isDarkMode
                  ? {
                      금융: 'bg-[#EA002C]/20 text-[#FF8A9E] border-[#EA002C]/45',
                      반도체: 'bg-[#F47725]/20 text-[#FFB078] border-[#F47725]/45',
                      ERP: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
                      제조: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }
                  : {
                      금융: 'bg-rose-50 text-[#EA002C] border-[#EA002C]/35',
                      반도체: 'bg-orange-50 text-[#F47725] border-[#F47725]/40',
                      ERP: 'bg-amber-50 text-amber-700 border-amber-400/50',
                      제조: 'bg-emerald-50 text-emerald-700 border-emerald-400/50'
                    };

                return (
                  <motion.div
                    key={prj.id}
                    data-node-card="true"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    onPointerDown={e => handleNodePointerDown(e, prj.id)}
                    onPointerMove={e => handleNodePointerMove(e, prj.id)}
                    onPointerUp={e =>
                      handleNodePointerUp(e, prj.id, () => {
                        setSelectedProjectId(prj.id);
                        setSimDurationMonths(prj.durationMonths);
                      })
                    }
                    onMouseEnter={() => setHoveredNodeId(prj.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    whileHover={{ scale: 1.025 }}
                    style={{ left: pos.x, top: pos.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                      isCompactAllView ? 'w-[192px] p-2.5' : 'w-[235px] p-3.5'
                    } rounded-xl overflow-hidden ${
                      canvasTool === 'hand'
                        ? 'cursor-grab'
                        : 'cursor-grab active:cursor-grabbing'
                    } transition-all z-10 ${
                      isHighlighted
                        ? isDarkMode
                          ? 'bg-[#1D1B2F]/95 border-2 border-[#F47725] shadow-[0_0_28px_rgba(234,0,44,0.28)]'
                          : 'bg-white border-2 border-[#EA002C] shadow-[0_8px_24px_rgba(234,0,44,0.16)]'
                        : isDarkMode
                          ? 'bg-[#151C2E]/95 border border-[#2C3954] hover:border-[#F47725]/70'
                          : 'bg-white/95 border border-slate-200 hover:border-[#F47725] shadow-sm'
                    }`}
                  >
                    {/* 상단 SK AX Red-to-Orange 시그니처 스트라이프 */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#EA002C] via-[#F04E23] to-[#F47725]" />

                    <div
                      className={`flex items-center justify-between text-[9.5px] font-mono mb-1 mt-0.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      <span
                        className={`px-1.5 py-0.5 rounded border font-bold ${domainBadgeColor[prj.domain]}`}
                      >
                        {prj.domain} AX
                      </span>
                      <span className="truncate ml-1">{prj.client}</span>
                    </div>

                    <div
                      className={`text-[11.5px] font-bold leading-snug mb-1.5 ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {prj.name}
                    </div>

                    <div
                      className={`flex items-center justify-between text-[10px] mb-1.5 px-2 py-1 rounded border ${
                        isDarkMode
                          ? 'text-slate-300 bg-[#0F1422]/90 border-[#26334D]'
                          : 'text-slate-700 bg-slate-50 border-slate-200'
                      }`}
                    >
                      <span>
                        월 예산:{' '}
                        <strong
                          className={`font-mono ${
                            isDarkMode ? 'text-amber-300' : 'text-[#EA002C]'
                          }`}
                        >
                          {prj.monthlyBudget.toLocaleString()}만
                        </strong>
                      </span>
                      <span>
                        투입:{' '}
                        <strong
                          className={`font-mono ${
                            isDarkMode ? 'text-[#FF8A3D]' : 'text-[#F47725]'
                          }`}
                        >
                          {connectedCount}명
                        </strong>
                      </span>
                    </div>

                    {!isCompactAllView && (
                      <div
                        className={`border rounded-lg p-1.5 mb-2 ${
                          isDarkMode
                            ? 'bg-[#0F1422]/90 border-[#26334D]'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div
                          className={`text-[9.5px] mb-1 ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          표준 통합 이력 ({prj.rawVariants.length}건):
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {prj.rawVariants.map((v, i) => (
                            <span
                              key={i}
                              className={`text-[9px] font-mono border px-1 rounded ${
                                isDarkMode
                                  ? 'bg-[#1A2338] border-[#2E3E5C] text-slate-300'
                                  : 'bg-white border-slate-200 text-slate-600'
                              }`}
                            >
                              "{v}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      className={`flex flex-wrap gap-1 pt-1 border-t ${
                        isDarkMode ? 'border-[#26334D]' : 'border-slate-100'
                      }`}
                    >
                      {prj.reqSkills.map(s => (
                        <span
                          key={s}
                          className={`text-[9px] font-mono border px-1.5 py-0.5 rounded ${
                            isDarkMode
                              ? 'bg-[#241D30] text-orange-200 border-[#F47725]/25'
                              : 'bg-orange-50/80 text-[#EA002C] border-[#F47725]/30 font-semibold'
                          }`}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* --- 인물(Person) 치이카와·산리오 캐릭터 카드 노드들 --- */}
            <AnimatePresence>
              {filteredPeople.map((person, index) => {
                const pos =
                  positions[person.id] || { x: person.x, y: person.y };
                const isSelected = selectedPersonId === person.id;
                const inTeamCart = teamCart.includes(person.id);
                const isRemoved = removedPersonId === person.id;

                const statusBadge = {
                  Available: {
                    label: '가용',
                    dot: 'bg-emerald-500',
                    cls: isDarkMode
                      ? 'bg-[#12352E] text-emerald-300 border-emerald-500/40'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  },
                  RollOffSoon: {
                    label: '종료임박',
                    dot: 'bg-amber-500',
                    cls: isDarkMode
                      ? 'bg-[#362812] text-amber-300 border-amber-500/40'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  },
                  Busy: {
                    label: '바쁨',
                    dot: 'bg-rose-500',
                    cls: isDarkMode
                      ? 'bg-[#3B1A25] text-rose-300 border-rose-500/40'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }
                }[person.status];

                return (
                  <motion.div
                    key={person.id}
                    data-node-card="true"
                    role="button"
                    tabIndex={0}
                    aria-label={`${person.name} ${person.characterName} ${person.role} 상세 보기`}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: isRemoved ? 0.4 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{
                      duration: 0.25,
                      delay: index * 0.015,
                      ease: 'easeOut'
                    }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onPointerDown={e => handleNodePointerDown(e, person.id)}
                    onPointerMove={e => handleNodePointerMove(e, person.id)}
                    onPointerUp={e =>
                      handleNodePointerUp(e, person.id, () => {
                        setSelectedPersonId(person.id);
                        setSelectedProjectId(person.normProject);
                        setRightTab('profile');
                      })
                    }
                    onMouseEnter={() => setHoveredNodeId(person.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedPersonId(person.id);
                        setSelectedProjectId(person.normProject);
                        setRightTab('profile');
                      }
                    }}
                    style={{ left: pos.x, top: pos.y }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 ${
                      isCompactAllView ? 'w-[168px] p-2' : 'w-[188px] p-2.5'
                    } rounded-xl ${
                      canvasTool === 'hand'
                        ? 'cursor-grab'
                        : 'cursor-grab active:cursor-grabbing'
                    } transition-all z-10 text-center ${
                      isRemoved
                        ? isDarkMode
                          ? 'border-2 border-dashed border-rose-500 bg-[#162032] grayscale'
                          : 'border-2 border-dashed border-rose-400 bg-slate-100 grayscale'
                        : isSelected
                          ? isDarkMode
                            ? 'bg-[#211A2D] border-2 border-[#EA002C] shadow-[0_0_24px_rgba(234,0,44,0.32)]'
                            : 'bg-white border-2 border-[#EA002C] shadow-[0_8px_22px_rgba(234,0,44,0.18)]'
                          : isDarkMode
                            ? 'bg-[#151D2F]/95 border border-[#283650] hover:border-[#F47725]'
                            : 'bg-white/95 border border-slate-200 hover:border-[#F47725] shadow-sm'
                    }`}
                  >
                    {/* 드림팀 시뮬레이터 담기 버튼 */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleTeamMember(person.id);
                        setRightTab('teambuilder');
                      }}
                      aria-label={`${person.name} 드림팀 시뮬레이터 ${
                        inTeamCart ? '제거' : '추가'
                      }`}
                      title="드림팀 조합 및 비용 시뮬레이터에 추가/제거"
                      className={`absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[11px] border transition-transform hover:scale-110 ${
                        inTeamCart
                          ? 'bg-gradient-to-br from-[#EA002C] to-[#F47725] text-white border-[#F47725] font-bold shadow'
                          : isDarkMode
                            ? 'bg-[#172134] text-slate-300 border-[#334663] hover:border-[#F47725]'
                            : 'bg-white text-slate-600 border-slate-300 hover:border-[#EA002C] shadow-2xs'
                      }`}
                    >
                      {inTeamCart ? '✓' : '+'}
                    </button>

                    {/* 상단 산리오·치이카와 캐릭터 아바타 + 이름/캐릭터명/단가 */}
                    <div className="flex items-center gap-2 text-left mb-1">
                      <img
                        src={person.avatar}
                        alt={`${person.name} (${person.characterName})`}
                        draggable={false}
                        className={`${
                          isCompactAllView ? 'w-9 h-9' : 'w-11 h-11'
                        } rounded-full object-cover border-2 shrink-0 shadow-xs ${
                          isSelected
                            ? 'border-[#EA002C]'
                            : 'border-[#F47725]/70'
                        } ${isDarkMode ? 'bg-slate-900' : 'bg-orange-50/40'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[11.5px] font-bold truncate ${
                              isDarkMode ? 'text-white' : 'text-slate-900'
                            }`}
                          >
                            {person.name}
                          </span>
                          <span
                            className={`text-[8.5px] px-1 py-0.2 rounded border inline-flex items-center gap-0.5 shrink-0 font-semibold ${statusBadge.cls}`}
                          >
                            <span
                              className={`w-1 h-1 rounded-full ${statusBadge.dot}`}
                            />
                            {statusBadge.label}
                          </span>
                        </div>
                        <div
                          className={`text-[9px] font-semibold truncate ${
                            isDarkMode ? 'text-pink-300' : 'text-[#EA002C]'
                          }`}
                        >
                          {person.characterName}
                        </div>
                        <div
                          className={`text-[9px] font-mono font-semibold truncate ${
                            isDarkMode ? 'text-amber-300' : 'text-slate-600'
                          }`}
                        >
                          {person.grade} · {person.monthlyRate.toLocaleString()}만/월
                        </div>
                      </div>
                    </div>

                    {/* 스킬 태그 */}
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {person.skills.slice(0, 3).map(skill => (
                        <span
                          key={skill}
                          className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono ${
                            selectedSkills.includes(skill)
                              ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white font-bold'
                              : isDarkMode
                                ? 'bg-[#212E46] text-slate-200'
                                : 'bg-slate-100 text-slate-700 font-medium'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* --- 피그마(Figma) 스타일 하단 플로팅 줌/팬 컨트롤 바 --- */}
          <div
            data-canvas-toolbar="true"
            className={`absolute bottom-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 backdrop-blur-md border px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              isDarkMode
                ? 'bg-[#121828]/95 border-[#312942] shadow-[0_8px_30px_rgba(0,0,0,0.5)]'
                : 'bg-white/95 border-slate-200 shadow-[0_8px_24px_rgba(15,23,42,0.10)]'
            }`}
          >
            {/* 모드 전환: 노드 선택/드래그 vs 캔버스 손바닥 이동 */}
            <div
              className={`flex items-center p-0.5 rounded-lg border ${
                isDarkMode
                  ? 'bg-[#0B0F19] border-[#232D42]'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => setCanvasTool('select')}
                title="선택 및 카드 개별 이동 모드"
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold flex items-center gap-1 whitespace-nowrap transition-colors ${
                  canvasTool === 'select'
                    ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white font-bold shadow-xs'
                    : isDarkMode
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MousePointer className="w-3 h-3 shrink-0" /> 선택·노드이동
              </button>
              <button
                type="button"
                onClick={() => setCanvasTool('hand')}
                title="피그마 스타일 캔버스 전체 이동(Pan) 모드 (또는 빈 배경 드래그)"
                className={`px-2.5 py-1 rounded-md text-[10.5px] font-semibold flex items-center gap-1 whitespace-nowrap transition-colors ${
                  canvasTool === 'hand'
                    ? 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white font-bold shadow-xs'
                    : isDarkMode
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Hand className="w-3 h-3 shrink-0" /> 화면이동(Pan)
              </button>
            </div>

            <div
              className={`h-4 w-[1px] mx-0.5 shrink-0 ${
                isDarkMode ? 'bg-[#26334D]' : 'bg-slate-200'
              }`}
            />

            {/* 축소 / 배율 표시 / 확대 */}
            <button
              type="button"
              aria-label="캔버스 축소"
              onClick={() => adjustZoom(-0.15)}
              className={`p-1 rounded-lg border transition-colors shrink-0 ${
                isDarkMode
                  ? 'bg-[#182135] hover:bg-[#232F4A] text-slate-200 border-[#2A3956]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="축소 (Zoom Out)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span
              className={`text-[11px] font-mono font-bold min-w-[44px] text-center ${
                isDarkMode ? 'text-[#FF8A3D]' : 'text-[#EA002C]'
              }`}
            >
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              aria-label="캔버스 확대"
              onClick={() => adjustZoom(0.15)}
              className={`p-1 rounded-lg border transition-colors shrink-0 ${
                isDarkMode
                  ? 'bg-[#182135] hover:bg-[#232F4A] text-slate-200 border-[#2A3956]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
              title="확대 (Zoom In)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* 빠른 배율 프리셋 & 화면 맞춤 */}
            <button
              type="button"
              onClick={() => setZoom(0.8)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border whitespace-nowrap ${
                isDarkMode
                  ? 'bg-[#182135] hover:bg-[#232F4A] text-slate-300 border-[#2A3956]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              80%
            </button>
            <button
              type="button"
              onClick={() => setZoom(1.25)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono border whitespace-nowrap ${
                isDarkMode
                  ? 'bg-[#182135] hover:bg-[#232F4A] text-slate-300 border-[#2A3956]'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              125%
            </button>

            <button
              type="button"
              onClick={fitCanvasView}
              className={`px-2.5 py-1 rounded-lg text-[10.5px] font-semibold border flex items-center gap-1 whitespace-nowrap ${
                isDarkMode
                  ? 'bg-[#231826] hover:bg-[#332036] text-[#FF9E5E] border-[#F47725]/40'
                  : 'bg-orange-50 hover:bg-orange-100 text-[#EA002C] border-[#F47725]/40'
              }`}
              title="배율 100% 및 중앙 원점 복귀"
            >
              <Maximize2 className="w-3 h-3 shrink-0" /> 화면 맞춤
            </button>
          </div>
        </div>
      </main>

      {/* ================= 3. 우측 플로팅 SK AX 프로필 & 비용 의사결정 패널 ================= */}
      <aside
        className={`w-80 border-l p-3 flex flex-col shrink-0 z-20 transition-colors ${
          isDarkMode
            ? 'bg-[#0F1422] border-[#242C40]'
            : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        {/* 상단 모드 전환 탭 */}
        <div
          className={`grid grid-cols-3 gap-1 p-1 rounded-xl border text-[11px] font-semibold mb-3 shrink-0 ${
            isDarkMode
              ? 'bg-[#161E30] border-[#26334D]'
              : 'bg-slate-100 border-slate-200'
          }`}
        >
          <button
            onClick={() => setRightTab('profile')}
            className={`py-1.5 rounded-lg transition-all ${
              rightTab === 'profile'
                ? 'bg-gradient-to-r from-[#EA002C] via-[#F04E23] to-[#F47725] text-white shadow-xs font-bold'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            인재·단가 상세
          </button>
          <button
            onClick={() => setRightTab('teambuilder')}
            className={`py-1.5 rounded-lg transition-all ${
              rightTab === 'teambuilder'
                ? 'bg-gradient-to-r from-[#EA002C] via-[#F04E23] to-[#F47725] text-white shadow-xs font-bold'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            팀·비용 ({teamCart.length})
          </button>
          <button
            onClick={() => setRightTab('jev')}
            className={`py-1.5 rounded-lg transition-all ${
              rightTab === 'jev'
                ? 'bg-gradient-to-r from-[#EA002C] via-[#F04E23] to-[#F47725] text-white shadow-xs font-bold'
                : isDarkMode
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            데이터 검수 ({pendingReviewCount})
          </button>
        </div>

        {/* --- 탭 1: SK AX 시그니처 그라데이션 인재 프로필 + 투입 단가(MM) 카드 --- */}
        {rightTab === 'profile' && (
          <motion.div
            key={`profile-${selectedPerson.id}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`flex-1 border rounded-2xl overflow-hidden flex flex-col justify-between relative ${
              isDarkMode
                ? 'bg-[#161E30] border-[#2B3752] shadow-xl'
                : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div className="overflow-y-auto flex-1">
              {/* 상단 SK AX 공식 Red-Coral-Orange 그라데이션 헤더 배너 */}
              <div className="h-20 bg-gradient-to-r from-[#EA002C] via-[#F04E23] to-[#F47725] relative">
                <span className="absolute top-2.5 left-3 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/50 text-white border border-white/20">
                  SK AX · {selectedPerson.domain} · {selectedPerson.grade}
                </span>
                <button
                  onClick={() => setRightTab('teambuilder')}
                  title="팀·비용 빌더 보기"
                  className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md bg-slate-950/35 hover:bg-slate-950/60 text-white flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 중앙 오버랩 대형 원형 아바타 (산리오·치이카와 캐릭터) */}
              <div className="px-4 pb-4 -mt-10 relative text-center">
                <div
                  className={`inline-block rounded-full p-1 ${
                    isDarkMode ? 'bg-[#161E30]' : 'bg-white shadow-sm'
                  }`}
                >
                  <img
                    src={selectedPerson.avatar}
                    alt={`${selectedPerson.name} (${selectedPerson.characterName})`}
                    className={`w-18 h-18 rounded-full object-cover border-2 border-[#F47725] shadow-[0_0_16px_rgba(234,0,44,0.25)] ${
                      isDarkMode ? 'bg-slate-900' : 'bg-orange-50/40'
                    }`}
                  />
                </div>

                <div className="mt-1">
                  <span
                    className={`inline-block text-[10.5px] font-bold px-2.5 py-0.5 rounded-full border ${
                      isDarkMode
                        ? 'bg-[#EA002C]/15 text-[#FF9E5E] border-[#F47725]/40'
                        : 'bg-rose-50 text-[#EA002C] border-[#F47725]/40'
                    }`}
                  >
                    {selectedPerson.characterName}
                  </span>
                </div>

                <h2
                  className={`text-base font-bold mt-1 ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {selectedPerson.name} {selectedPerson.engName}
                </h2>
                <p
                  className={`text-xs ${
                    isDarkMode ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  {selectedPerson.dept} · {selectedPerson.role}
                </p>

                {/* 투입 단가 & 가용 상태 요약 박스 */}
                <div
                  className={`grid grid-cols-2 gap-2 mt-3 p-2.5 rounded-xl border ${
                    isDarkMode
                      ? 'bg-[#101625] border-[#26344E]'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="text-left">
                    <div
                      className={`text-[10px] ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      월 기준 투입단가(MM)
                    </div>
                    <div
                      className={`text-sm font-mono font-bold ${
                        isDarkMode ? 'text-amber-300' : 'text-[#EA002C]'
                      }`}
                    >
                      {selectedPerson.monthlyRate.toLocaleString()}만원
                    </div>
                  </div>
                  <div
                    className={`text-left border-l pl-2.5 ${
                      isDarkMode ? 'border-[#26344E]' : 'border-slate-200'
                    }`}
                  >
                    <div
                      className={`text-[10px] ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      6개월 투입 예상비
                    </div>
                    <div
                      className={`text-sm font-mono font-bold ${
                        isDarkMode ? 'text-[#FF8A3D]' : 'text-[#F47725]'
                      }`}
                    >
                      {formatKoreanCurrency(selectedPerson.monthlyRate * 6)}
                    </div>
                  </div>
                </div>

                {/* 경력 연차 & 주요 기술들 */}
                <div
                  className={`mt-3 pt-3 border-t text-left space-y-3 ${
                    isDarkMode ? 'border-[#26344E]' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }
                    >
                      경력 / 가용 일정
                    </span>
                    <span
                      className={`font-bold ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {selectedPerson.exp} · {selectedPerson.rollOff}
                    </span>
                  </div>

                  <div>
                    <div
                      className={`text-xs mb-1.5 ${
                        isDarkMode ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      주요 기술 스택
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPerson.skills.map((skill, idx) => (
                        <span
                          key={skill}
                          className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                            idx === 0
                              ? isDarkMode
                                ? 'bg-[#2C1522] text-[#FF8A9E] border border-[#EA002C]/45'
                                : 'bg-rose-50 text-[#EA002C] border border-[#EA002C]/35 font-semibold'
                              : idx === 1
                                ? isDarkMode
                                  ? 'bg-[#2B1F1B] text-[#FFB078] border border-[#F47725]/45'
                                  : 'bg-orange-50 text-[#F47725] border border-[#F47725]/35 font-semibold'
                                : isDarkMode
                                  ? 'bg-[#22304A] text-slate-200'
                                  : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 프로젝트 매칭 신뢰도 게이지 바 */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span
                        className={
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }
                      >
                        프로젝트 매칭 신뢰도
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isDarkMode ? 'text-[#FF8A3D]' : 'text-[#EA002C]'
                        }`}
                      >
                        {Math.round(selectedPerson.jevConf * 100)}%
                      </span>
                    </div>
                    <div
                      className={`w-full h-2 rounded-full p-0.5 flex items-center overflow-hidden ${
                        isDarkMode ? 'bg-[#0E1422]' : 'bg-slate-100'
                      }`}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.round(selectedPerson.jevConf * 100)}%`
                        }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-[#EA002C] via-[#F47725] to-[#FBBF24]"
                      />
                    </div>
                  </div>

                  {/* 수행 프로젝트 매핑 근거 박스 */}
                  <div
                    className={`border rounded-xl p-2.5 space-y-1 ${
                      isDarkMode
                        ? 'bg-[#101625] border-[#283650]'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div
                      className={`text-[11px] font-bold flex items-center gap-1 ${
                        isDarkMode ? 'text-[#FF8A3D]' : 'text-[#EA002C]'
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-[#EA002C]" /> 표준 프로젝트 매핑 이력
                    </div>
                    <div
                      className={`text-[11px] ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      기재 이력:{' '}
                      <span
                        className={`font-mono font-semibold ${
                          isDarkMode ? 'text-amber-300' : 'text-[#F47725]'
                        }`}
                      >
                        "{selectedPerson.rawProject}"
                      </span>
                    </div>
                    <div
                      className={`text-[11px] font-semibold flex items-center gap-1 ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      <FolderGit2 className="w-3 h-3 text-[#F47725] shrink-0" />
                      <span className="truncate">{selectedPersonProject.name}</span>
                    </div>
                  </div>

                  {/* 동일 프로젝트 검증된 동료 및 단가 비교 */}
                  <div>
                    <div
                      className={`text-[11px] font-bold mb-1.5 ${
                        isDarkMode ? 'text-slate-300' : 'text-slate-700'
                      }`}
                    >
                      동일 프로젝트 협업 동료 ({selectedPersonColleagues.length}명)
                    </div>
                    <div className="space-y-1.5">
                      {selectedPersonColleagues.map(col => (
                        <div
                          key={col.id}
                          onClick={() => setSelectedPersonId(col.id)}
                          className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                            isDarkMode
                              ? 'bg-[#101625] border-[#26344E] hover:border-[#F47725]'
                              : 'bg-slate-50 border-slate-200 hover:border-[#F47725]'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img
                              src={col.avatar}
                              alt={col.name}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <div
                              className={`text-xs font-semibold truncate ${
                                isDarkMode ? 'text-slate-200' : 'text-slate-800'
                              }`}
                            >
                              {col.name}{' '}
                              <span
                                className={`text-[10px] font-mono ${
                                  isDarkMode ? 'text-amber-300' : 'text-[#EA002C]'
                                }`}
                              >
                                ({col.grade}·{col.monthlyRate.toLocaleString()}만)
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 Assign to Project 액션 영역 */}
            <div
              className={`p-3 border-t space-y-1.5 ${
                isDarkMode
                  ? 'border-[#25324B] bg-[#12192B]'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                onClick={() => toggleTeamMember(selectedPerson.id)}
                className={`w-full py-2 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                  teamCart.includes(selectedPerson.id)
                    ? isDarkMode
                      ? 'bg-[#2C1624] text-[#FF9E5E] border border-[#F47725]/60'
                      : 'bg-rose-50 text-[#EA002C] border border-[#EA002C]/40'
                    : 'bg-gradient-to-r from-[#EA002C] via-[#F04E23] to-[#F47725] text-white hover:brightness-110'
                }`}
              >
                {teamCart.includes(selectedPerson.id) ? (
                  <>
                    <UserCheck className="w-4 h-4" /> 드림팀 포함됨 (월{' '}
                    {selectedPerson.monthlyRate.toLocaleString()}만)
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" /> Assign to Project (월{' '}
                    {selectedPerson.monthlyRate.toLocaleString()}만)
                  </>
                )}
              </button>
              <button
                onClick={() =>
                  setRemovedPersonId(
                    removedPersonId === selectedPerson.id ? null : selectedPerson.id
                  )
                }
                className={`w-full py-1.5 px-3 rounded-lg text-[11px] font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                  isDarkMode
                    ? 'text-slate-300 hover:text-white bg-[#1A2438] border-[#2C3B59]'
                    : 'text-slate-700 hover:text-[#EA002C] bg-white border-slate-200'
                }`}
              >
                <UserMinus className="w-3.5 h-3.5 text-[#EA002C]" />
                {removedPersonId === selectedPerson.id
                  ? '이탈 시뮬레이션 해제'
                  : '도메인 고립(Bus Factor) & 대체 단가 진단'}
              </button>
            </div>
          </motion.div>
        )}

        {/* --- 탭 2: 드림팀 조합 빌더 & 프로젝트 총비용 산정기 --- */}
        {rightTab === 'teambuilder' && (
          <motion.div
            key="teambuilder"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`flex-1 border rounded-2xl p-3.5 overflow-y-auto space-y-3.5 ${
              isDarkMode
                ? 'bg-[#161E30] border-[#2B3752]'
                : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            {/* 목표 배치 프로젝트 선택 & 투입 기간 슬라이더 */}
            <div
              className={`border p-3 rounded-xl space-y-2 ${
                isDarkMode
                  ? 'bg-[#101625] border-[#26344E]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div
                className={`flex items-center justify-between text-xs font-bold ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-[#F47725]" /> 목표 프로젝트 & 예산 기준
                </span>
                <span
                  className={`text-[10px] font-mono ${
                    isDarkMode ? 'text-amber-300' : 'text-[#EA002C]'
                  }`}
                >
                  월 한도 {activeTargetProject.monthlyBudget.toLocaleString()}만
                </span>
              </div>
              <select
                aria-label="비용 산정 대상 프로젝트"
                value={activeTargetProject.id}
                onChange={e => setSelectedProjectId(e.target.value)}
                className={`w-full text-xs p-1.5 border rounded-lg font-semibold ${
                  isDarkMode
                    ? 'bg-[#172136] border-[#2E3F5E] text-white'
                    : 'bg-white border-slate-300 text-slate-800'
                }`}
              >
                {PROJECTS.map(pr => (
                  <option key={pr.id} value={pr.id}>
                    [{pr.domain}] {pr.name} (월 예산 {pr.monthlyBudget.toLocaleString()}만)
                  </option>
                ))}
              </select>

              <div className="pt-1">
                <div
                  className={`flex items-center justify-between text-[11px] mb-1 ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  <span>예상 투입 기간 설정</span>
                  <span
                    className={`font-mono font-bold ${
                      isDarkMode ? 'text-[#FF8A3D]' : 'text-[#EA002C]'
                    }`}
                  >
                    {simDurationMonths}개월 (MM)
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={simDurationMonths}
                  onChange={e => setSimDurationMonths(Number(e.target.value))}
                  className={`w-full accent-[#EA002C] h-1.5 rounded-lg cursor-pointer ${
                    isDarkMode ? 'bg-[#1E293B]' : 'bg-slate-200'
                  }`}
                />
              </div>
            </div>

            {/* 인건비 총액 & 예산 대비 상태 카드 */}
            <div
              className={`p-3.5 rounded-xl border space-y-2 ${
                teamMetrics.isOverBudget
                  ? isDarkMode
                    ? 'bg-[#2C1420] border-[#EA002C]/60'
                    : 'bg-rose-50 border-[#EA002C]/50'
                  : isDarkMode
                    ? 'bg-gradient-to-br from-[#261726] to-[#1A2136] border-[#F47725]/45'
                    : 'bg-gradient-to-br from-rose-50/70 to-orange-50/70 border-[#F47725]/45'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  월 총 투입 인건비 ({teamMetrics.members.length}명)
                </span>
                <span
                  className={`text-base font-mono font-bold ${
                    isDarkMode ? 'text-amber-300' : 'text-[#EA002C]'
                  }`}
                >
                  {formatKoreanCurrency(teamMetrics.totalMonthlyCost)}/월
                </span>
              </div>

              <div
                className={`flex items-center justify-between text-xs pt-1 border-t ${
                  isDarkMode ? 'border-white/10' : 'border-slate-200'
                }`}
              >
                <span
                  className={isDarkMode ? 'text-slate-300' : 'text-slate-600'}
                >
                  {simDurationMonths}개월 총 사업 인건비
                </span>
                <span
                  className={`text-sm font-mono font-bold ${
                    isDarkMode ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {formatKoreanCurrency(teamMetrics.totalProjectCost)}
                </span>
              </div>

              {/* 예산 소진율 바 */}
              <div
                className={`w-full h-2 rounded-full overflow-hidden ${
                  isDarkMode ? 'bg-[#0B0F19]' : 'bg-white'
                }`}
              >
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        (teamMetrics.totalMonthlyCost /
                          activeTargetProject.monthlyBudget) *
                          100
                      )
                    )}%`
                  }}
                  className={`h-full ${
                    teamMetrics.isOverBudget
                      ? 'bg-[#EA002C]'
                      : 'bg-gradient-to-r from-[#EA002C] via-[#F47725] to-[#FBBF24]'
                  }`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <span
                  className={
                    teamMetrics.isOverBudget
                      ? 'text-[#EA002C] font-bold'
                      : isDarkMode
                        ? 'text-[#FF9E5E] font-semibold'
                        : 'text-[#EA002C] font-semibold'
                  }
                >
                  {teamMetrics.isOverBudget
                    ? `⚠️ 월 예산 ${Math.abs(teamMetrics.budgetDiff).toLocaleString()}만원 초과`
                    : `✓ 월 예산 내 (${teamMetrics.budgetDiff.toLocaleString()}만원 절감)`}
                </span>
                <span
                  className={`font-mono ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  시너지 {teamMetrics.synergyScore}점
                </span>
              </div>
            </div>

            {/* 구성된 팀원 리스트 + 개별 단가 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-xs font-bold ${
                    isDarkMode ? 'text-slate-200' : 'text-slate-800'
                  }`}
                >
                  배치된 팀원 및 월 단가 ({teamMetrics.members.length}명)
                </span>
                {teamMetrics.members.length > 0 && (
                  <button
                    onClick={() => setTeamCart([])}
                    className="text-[10px] text-slate-400 underline hover:text-[#EA002C]"
                  >
                    전체 비우기
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {teamMetrics.members.map(member => (
                  <div
                    key={member.id}
                    className={`p-2 border rounded-xl flex items-center justify-between ${
                      isDarkMode
                        ? 'bg-[#101625] border-[#26344E]'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold flex items-center gap-1 ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          <span>{member.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1 rounded ${
                              isDarkMode
                                ? 'bg-[#261A2B] text-amber-300'
                                : 'bg-orange-50 text-[#EA002C] border border-[#F47725]/30'
                            }`}
                          >
                            {member.grade} · {member.monthlyRate.toLocaleString()}만
                          </span>
                        </div>
                        <div
                          className={`text-[10px] truncate ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          [{member.domain}] {member.role} · {member.rollOff}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTeamMember(member.id)}
                      aria-label={`${member.name} 팀에서 제외`}
                      className="p-1 text-slate-400 hover:text-[#EA002C]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 요구 기술 커버리지 & 가성비 보완 인재 추천 */}
            <div
              className={`pt-2 border-t space-y-2.5 ${
                isDarkMode ? 'border-[#26344E]' : 'border-slate-200'
              }`}
            >
              <span
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isDarkMode ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-[#F47725]" /> [{activeTargetProject.domain}] 요구 기술 커버리지
              </span>

              <div
                className={`p-2.5 rounded-xl border space-y-2 ${
                  isDarkMode
                    ? 'bg-[#101625] border-[#26344E]'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex flex-wrap gap-1">
                  {activeTargetProject.reqSkills.map(skill => {
                    const isCovered = teamMetrics.coveredSkills.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          isCovered
                            ? isDarkMode
                              ? 'bg-[#261826] text-[#FF9E5E] border-[#F47725]/45'
                              : 'bg-orange-50 text-[#EA002C] border-[#F47725]/40 font-semibold'
                            : isDarkMode
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                        }`}
                      >
                        {isCovered ? '✓' : '!'} {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* 공백 기술 또는 가성비 추천 인재 */}
              <div className="space-y-1.5">
                <div
                  className={`text-[11px] font-bold ${
                    isDarkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  추가 영입 가능 인재 (단가순 추천)
                </div>
                {INITIAL_PEOPLE.filter(
                  p =>
                    !teamCart.includes(p.id) &&
                    (p.domain === activeTargetProject.domain ||
                      p.skills.some(s => teamMetrics.missingSkills.includes(s)))
                )
                  .sort((a, b) => a.monthlyRate - b.monthlyRate)
                  .slice(0, 3)
                  .map(rec => (
                    <div
                      key={rec.id}
                      className={`p-2 border rounded-xl flex items-center justify-between text-xs ${
                        isDarkMode
                          ? 'border-[#283650] bg-[#101625]'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div>
                        <div
                          className={`font-bold ${
                            isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {rec.name}{' '}
                          <span
                            className={`font-mono text-[10px] ${
                              isDarkMode ? 'text-amber-300' : 'text-[#EA002C]'
                            }`}
                          >
                            ({rec.grade} · {rec.monthlyRate.toLocaleString()}만/월)
                          </span>
                        </div>
                        <div
                          className={`text-[10px] ${
                            isDarkMode ? 'text-slate-400' : 'text-slate-500'
                          }`}
                        >
                          {rec.domain} AX · {rec.skills.slice(0, 3).join(', ')}
                        </div>
                      </div>
                      <button
                        onClick={() => toggleTeamMember(rec.id)}
                        className="px-2 py-1 bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white text-[10px] font-bold rounded-lg shrink-0"
                      >
                        + 영입
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* --- 탭 3: 데이터 검수 큐 (제조 최윤아 + 반도체 송우진) --- */}
        {rightTab === 'jev' && (
          <motion.div
            key="jev"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            className={`flex-1 border rounded-2xl p-3.5 overflow-y-auto space-y-3 ${
              isDarkMode
                ? 'bg-[#161E30] border-[#2B3752]'
                : 'bg-white border-slate-200 shadow-md'
            }`}
          >
            <div
              className={`border p-3 rounded-xl ${
                isDarkMode
                  ? 'bg-[#101625] border-[#26344E]'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div
                className={`text-xs font-bold flex items-center justify-between ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}
              >
                <span>프로젝트 이력 자동 매핑 검수</span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.5 border rounded ${
                    isDarkMode
                      ? 'bg-[#241623] text-[#FF8A3D] border-[#EA002C]/40'
                      : 'bg-orange-50 text-[#EA002C] border-[#F47725]/40'
                  }`}
                >
                  기준 65%
                </span>
              </div>
              <p
                className={`text-[11px] mt-1 leading-relaxed ${
                  isDarkMode ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                자유기재 프로젝트 이력을 표준 프로젝트 노드로 연결할 때 신뢰도가 65% 미만인 항목을 관리자가 최종 확인합니다.
              </p>
            </div>

            {lowConfPeople.map((person, idx) => {
              const isApproved = approvedIds.includes(person.id);
              const targetPrj =
                PROJECTS.find(pr => pr.id === person.normProject) || PROJECTS[0];

              return (
                <div
                  key={person.id}
                  className={`border border-[#F47725]/60 rounded-xl p-3 space-y-2.5 ${
                    isDarkMode ? 'bg-[#101625]' : 'bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      검수 #{idx + 1} · {person.name} ({person.domain} AX)
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        isApproved
                          ? isDarkMode
                            ? 'bg-[#123831] text-emerald-300 border-emerald-500/40'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : isDarkMode
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-amber-50 text-amber-700 border-amber-300'
                      }`}
                    >
                      {isApproved
                        ? '승인 완료 (100%)'
                        : `매칭률 ${Math.round(person.jevConf * 100)}%`}
                    </span>
                  </div>

                  <div
                    className={`p-2 rounded-lg border space-y-1.5 text-xs ${
                      isDarkMode
                        ? 'bg-[#161F33] border-[#263652]'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div>
                      <span
                        className={`text-[10px] block ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        원문 프로젝트명 (월 단가 {person.monthlyRate.toLocaleString()}만)
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isDarkMode ? 'text-amber-300' : 'text-[#EA002C]'
                        }`}
                      >
                        "{person.rawProject}"
                      </span>
                    </div>
                    <div
                      className={`flex items-center gap-1 text-[10px] font-semibold ${
                        isDarkMode ? 'text-[#FF8A3D]' : 'text-[#F47725]'
                      }`}
                    >
                      <ArrowRight className="w-3 h-3" /> 후보 표준 프로젝트 엔티티
                    </div>
                    <div>
                      <span
                        className={`font-bold block ${
                          isDarkMode ? 'text-white' : 'text-slate-900'
                        }`}
                      >
                        {targetPrj.name} ({targetPrj.client})
                      </span>
                      <span
                        className={`text-[10px] ${
                          isDarkMode ? 'text-slate-400' : 'text-slate-500'
                        }`}
                      >
                        핵심 스택({person.skills.slice(0, 3).join(', ')}) 및 수행 시기 일치
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        toggleApproveLowConf(person.id);
                        setSelectedPersonId(person.id);
                      }}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isApproved
                          ? isDarkMode
                            ? 'bg-[#123831] text-emerald-300'
                            : 'bg-emerald-100 text-emerald-800'
                          : 'bg-gradient-to-r from-[#EA002C] to-[#F47725] text-white shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isApproved ? '표준 엔티티 병합 승인됨' : '병합 승인 및 그래프 반영'}
                    </button>
                    {isApproved && (
                      <button
                        onClick={() => toggleApproveLowConf(person.id)}
                        title="검수 대기 상태로 되돌리기"
                        className={`p-1.5 border rounded-lg ${
                          isDarkMode
                            ? 'border-[#2A3D5C] text-slate-300 hover:text-white'
                            : 'border-slate-200 text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </aside>
    </div>
  );
}
