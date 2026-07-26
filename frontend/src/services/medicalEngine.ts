/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  NutriFlow-AI — Clinical Medical Decision Engine
 *  ═══════════════════════════════════════════════════════════════════════════
 *
 *  Based on published guidelines from:
 *  • AHA/ACC 2017/2018 — Hypertension, Cardiovascular Risk
 *  • ADA 2024 — Diabetes Standards of Medical Care
 *  • WHO 2023 — Global NCD Guidelines
 *  • ESC 2021 — Cardiovascular Prevention Guidelines
 *  • ICMR 2023 — Indian Clinical Practice Guidelines
 *  • KDIGO 2021 — Chronic Kidney Disease
 *  • AHA/AHA 2022 — Heart Failure
 *  • PCOS Society of India 2022 — PCOS Management
 *  • NCEP ATP III + AHA 2019 — Cholesterol Guidelines
 *  • Sleep Foundation / AASM — Sleep & Heart Rate
 *
 *  NOTE: This is a rule-based clinical expert system encoding evidence-based
 *  guidelines. It is NOT a real-time physiological sensor. Results are for
 *  health awareness only. Clinical diagnosis requires a licensed physician.
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ─── Vital Input ──────────────────────────────────────────────────────────────

export interface VitalInput {
  systolicBP?:   number;  // mmHg
  diastolicBP?:  number;  // mmHg
  bloodSugar?:   number;  // mg/dL (fasting)
  heartRate?:    number;  // bpm
  spo2?:         number;  // %
  cholesterol?:  number;  // mg/dL total
  bmi?:          number;  // kg/m²
  age?:          number;  // years
  gender?:       'male' | 'female' | 'other';
  diseases?:     string[]; // existing diagnosed conditions
}

// ─── Assessment Result ────────────────────────────────────────────────────────

export type RiskLevel = 'optimal' | 'normal' | 'borderline' | 'high' | 'critical';

export interface VitalAssessment {
  vital:          string;
  value:          number;
  unit:           string;
  level:          RiskLevel;
  label:          string;       // e.g. "Stage 1 Hypertension"
  guideline:      string;       // e.g. "AHA/ACC 2018"
  context:        string;       // Why this level for THIS user
  recommendation: string;       // What to do
  foodWarning?:   string;       // Foods to avoid
  urgency:        'none' | 'watch' | 'soon' | 'urgent' | 'emergency';
}

export interface CombinedRiskAssessment {
  overallScore:   number;       // 0–100 (100 = perfect health)
  overallLevel:   RiskLevel;
  vitals:         VitalAssessment[];
  combinedAlerts: CombinedAlert[];
  foodsToAvoid:   string[];
  foodsSafe:      string[];
  summary:        string;
}

export interface CombinedAlert {
  title:   string;
  detail:  string;
  urgency: 'watch' | 'soon' | 'urgent' | 'emergency';
  source:  string;
}

// ─── Disease Detection Helper ─────────────────────────────────────────────────

const hasDx = (diseases: string[], ...keywords: string[]): boolean =>
  keywords.some(kw => diseases.some(d => d.toLowerCase().includes(kw.toLowerCase())));

// ─── ══════════════════════════════════════════════════════════════════════════
//     BLOOD PRESSURE ENGINE
//     Sources: AHA/ACC 2018, ESC/ESH 2018, ICMR 2023, JNC 8, NICE 2019
// ═══════════════════════════════════════════════════════════════════════════════

function assessBloodPressure(v: VitalInput): VitalAssessment | null {
  const s = v.systolicBP;
  const d = v.diastolicBP;
  if (!s) return null;

  const age      = v.age || 40;
  const diseases = v.diseases || [];
  const hasDM    = hasDx(diseases, 'diabetes', 'diabetic', 'type 2', 'type 1');
  const hasCKD   = hasDx(diseases, 'kidney', 'ckd', 'renal');
  const hasHF    = hasDx(diseases, 'heart failure', 'hf');
  const hasCAD   = hasDx(diseases, 'heart disease', 'cardiac', 'coronary', 'cad');
  const hasStroke= hasDx(diseases, 'stroke', 'tia');
  const isElderly= age >= 65;

  /**
   * Context-aware BP targets (AHA/ESC/ADA):
   * - General adult: <130/80 (AHA 2018)
   * - Elderly ≥65: 130-139 systolic acceptable (AHA 2019)
   * - Diabetics: <130/80 (ADA 2024)
   * - CKD non-dialysis: <120/80 (KDIGO 2021)
   * - Heart failure: 120-130 (AHA 2022)
   * - Post-stroke: <130/80 (AHA 2021)
   * - Hypotension: <90/<60 (AHA)
   */

  // Adjust target based on comorbidities
  let targetSystolic = 130;
  let targetContext  = 'General adult target (AHA/ACC 2018)';

  if (hasDM) {
    targetSystolic = 130;
    targetContext  = 'Diabetics target: <130/80 mmHg (ADA 2024)';
  }
  if (hasCKD) {
    targetSystolic = 120;
    targetContext  = 'CKD target: <120/80 mmHg (KDIGO 2021)';
  }
  if (hasHF) {
    targetSystolic = 130;
    targetContext  = 'Heart Failure target: 120–130 mmHg (AHA 2022)';
  }
  if (isElderly && !hasCKD && !hasDM) {
    targetSystolic = 130;
    targetContext  = 'Elderly ≥65: SBP <130 mmHg (AHA 2019 Older Adults)';
  }

  // Hypotension check (low BP is also dangerous)
  if (s < 90) {
    return {
      vital: 'Blood Pressure', value: s, unit: 'mmHg',
      level: 'critical', label: 'Hypotension',
      guideline: 'AHA — Hypotension Criteria',
      context: `Systolic BP of ${s} mmHg is below 90 — this is clinically low. ${
        hasDM ? 'Diabetics on insulin/medications are at high hypotension risk.' : ''
      } ${v.gender === 'female' ? 'Women may experience symptomatic hypotension at higher thresholds.' : ''}`,
      recommendation: 'Sit or lie down immediately. Increase fluid/salt intake if advised by doctor. Seek medical attention if symptomatic (dizziness, fainting).',
      foodWarning: 'Avoid diuretics, alcohol, large meals (all can worsen hypotension)',
      urgency: 'urgent',
    };
  }

  // Hypertensive Emergency
  if (s >= 180 || (d && d >= 120)) {
    return {
      vital: 'Blood Pressure', value: s, unit: 'mmHg',
      level: 'critical', label: 'Hypertensive Emergency',
      guideline: 'AHA/ACC 2018 — Hypertensive Emergency (Stage 3)',
      context: `Systolic BP of ${s} mmHg${d ? ` / ${d}` : ''} mmHg is a HYPERTENSIVE EMERGENCY. ${
        hasStroke ? 'Your history of stroke places you at extreme cerebrovascular risk.' : ''
      } ${hasCAD ? 'This level dramatically elevates your risk of heart attack.' : ''} ` +
        'This requires IMMEDIATE emergency medical care.',
      recommendation: '🚨 CALL EMERGENCY SERVICES IMMEDIATELY. Do NOT eat anything until stabilized.',
      foodWarning: 'Nothing by mouth — go to emergency room NOW',
      urgency: 'emergency',
    };
  }

  // Stage 2 Hypertension
  if (s >= 140 || (d && d >= 90)) {
    return {
      vital: 'Blood Pressure', value: s, unit: 'mmHg',
      level: 'high', label: 'Stage 2 Hypertension',
      guideline: 'AHA/ACC 2018 — Stage 2 Hypertension (≥140/90 mmHg)',
      context: `Systolic BP ${s} mmHg exceeds the Stage 2 threshold of 140 mmHg. ${
        hasDM ? `Diabetics with BP ≥140 have 2× the risk of cardiovascular events (ADA 2024).` : ''
      } ${hasCKD ? `CKD patients with BP ≥140 have accelerated kidney decline (KDIGO 2021).` : ''
      } ${isElderly ? `In elderly patients ≥65, SBP ≥140 significantly increases stroke risk.` : ''}`,
      recommendation: `Consult your doctor for medication review. Target: <${targetSystolic} mmHg. ${targetContext}`,
      foodWarning: 'Strictly avoid: high-sodium foods (>1500mg/day), processed meat, pickles, soy sauce, cheese, canned soups, fast food, alcohol, caffeine excess',
      urgency: 'urgent',
    };
  }

  // Stage 1 Hypertension
  if (s >= 130 || (d && d >= 80)) {
    return {
      vital: 'Blood Pressure', value: s, unit: 'mmHg',
      level: 'borderline', label: 'Stage 1 Hypertension',
      guideline: 'AHA/ACC 2018 — Stage 1 Hypertension (130–139/80–89 mmHg)',
      context: `BP of ${s}/${d ?? '?'} mmHg is Stage 1 Hypertension. ${
        hasDM || hasCKD
          ? `For your condition (${diseases.slice(0, 2).join(', ')}), the target is <${targetSystolic}/80 mmHg.`
          : 'Lifestyle changes are first-line treatment. Medication may be needed if risk is high.'
      }`,
      recommendation: 'DASH diet, reduce sodium to <2300mg/day, exercise 150min/week, reduce alcohol, lose weight if BMI >25.',
      foodWarning: 'Reduce: salt, sodium-heavy foods, processed snacks, alcohol, red meat',
      urgency: 'soon',
    };
  }

  // Elevated (AHA 2018 — replaces "prehypertension")
  if (s >= 120 && s <= 129 && (!d || d < 80)) {
    return {
      vital: 'Blood Pressure', value: s, unit: 'mmHg',
      level: 'borderline', label: 'Elevated Blood Pressure',
      guideline: 'AHA/ACC 2018 — Elevated BP Category (120–129/<80 mmHg)',
      context: `Systolic BP of ${s} mmHg is in the "Elevated" category. While not yet Stage 1 HT, risk of progression to hypertension is high. ${
        hasDM ? 'Diabetics in this range should pursue active BP reduction (ADA 2024).' : ''
      }`,
      recommendation: 'Lifestyle modification: reduce sodium, increase potassium (bananas, potatoes), aerobic exercise, lose weight.',
      foodWarning: 'Limit: processed and packaged foods, salt, caffeine, alcohol',
      urgency: 'watch',
    };
  }

  // Optimal / Normal
  if (s >= targetSystolic - 10 && s < targetSystolic) {
    return {
      vital: 'Blood Pressure', value: s, unit: 'mmHg',
      level: 'normal', label: 'Normal Blood Pressure',
      guideline: 'AHA/ACC 2018',
      context: `BP of ${s}/${d ?? '?'} mmHg is within normal range. ${targetContext}`,
      recommendation: 'Maintain current lifestyle. Continue DASH diet principles.',
      urgency: 'none',
    };
  }

  return {
    vital: 'Blood Pressure', value: s, unit: 'mmHg',
    level: 'optimal', label: 'Optimal Blood Pressure',
    guideline: 'AHA/ACC 2018',
    context: `Excellent BP of ${s}/${d ?? '?'} mmHg. Well within optimal range. ${targetContext}`,
    recommendation: 'Keep it up! Maintain low-sodium, high-potassium diet.',
    urgency: 'none',
  };
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     BLOOD SUGAR ENGINE
//     Sources: ADA 2024, WHO 2023, ICMR 2023, IDF 2023
// ═══════════════════════════════════════════════════════════════════════════════

function assessBloodSugar(v: VitalInput): VitalAssessment | null {
  const bs       = v.bloodSugar;
  if (!bs) return null;

  const diseases = v.diseases || [];
  const hasDM    = hasDx(diseases, 'diabetes', 'diabetic');
  const hasPCOS  = hasDx(diseases, 'pcos', 'pcod');
  const hasPancr = hasDx(diseases, 'pancreat');
  const age      = v.age || 40;
  const gender   = v.gender || 'other';

  /**
   * ADA 2024 Fasting Glucose Standards:
   * - Normal:          <100 mg/dL
   * - Prediabetes:     100–125 mg/dL (IFG = Impaired Fasting Glucose)
   * - Diabetes:        ≥126 mg/dL (confirmed on 2 occasions)
   * - Hypoglycemia:    <70 mg/dL (severe: <54 mg/dL)
   *
   * For KNOWN diabetics on medication (ADA 2024 Glycemic Targets):
   * - Fasting target:  80–130 mg/dL
   * - Post-meal:       <180 mg/dL
   * - HbA1c target:    <7% (≈154 mg/dL avg)
   *
   * ICMR 2023 India-specific: Indians develop diabetes at lower BMI
   * PCOS: insulin resistance → pre-DM common even in young women
   */

  // Severe hypoglycemia
  if (bs < 54) {
    return {
      vital: 'Blood Sugar (Fasting)', value: bs, unit: 'mg/dL',
      level: 'critical', label: 'Severe Hypoglycemia',
      guideline: 'ADA 2024 — Level 3 Severe Hypoglycemia (<54 mg/dL)',
      context: `Fasting blood sugar of ${bs} mg/dL is CRITICALLY LOW. ${
        hasDM ? 'In diabetics on insulin/sulfonylureas, this can cause seizures or unconsciousness.' : ''
      }`,
      recommendation: '🚨 Immediate: consume 15g fast-acting carbs (glucose tablet, juice, sugar). Repeat in 15 min if no improvement. Seek emergency care.',
      foodWarning: 'Eat glucose or fast carbs NOW — this is a medical emergency',
      urgency: 'emergency',
    };
  }

  // Mild hypoglycemia
  if (bs < 70) {
    return {
      vital: 'Blood Sugar (Fasting)', value: bs, unit: 'mg/dL',
      level: 'high', label: 'Hypoglycemia',
      guideline: 'ADA 2024 — Level 1 Hypoglycemia (<70 mg/dL)',
      context: `Blood sugar of ${bs} mg/dL is below the safety threshold of 70 mg/dL. ${
        hasDM ? 'Medication dose or meal timing may need adjustment.' : 'May be due to prolonged fasting or excessive exercise.'
      }`,
      recommendation: 'Eat 15g of fast carbs immediately. Check sugar again in 15 minutes.',
      urgency: 'urgent',
    };
  }

  // Known diabetic — assess against their specific target
  if (hasDM) {
    if (bs <= 130) {
      return {
        vital: 'Blood Sugar (Fasting)', value: bs, unit: 'mg/dL',
        level: 'optimal', label: 'Well-Controlled Diabetes',
        guideline: 'ADA 2024 — Glycemic Target for Diabetics (80–130 mg/dL fasting)',
        context: `Blood sugar of ${bs} mg/dL is within the ADA 2024 fasting target of 80–130 mg/dL for adults with diabetes. HbA1c is likely below 7%.`,
        recommendation: 'Excellent control! Continue current medication, diet, and physical activity.',
        urgency: 'none',
      };
    }
    if (bs <= 180) {
      return {
        vital: 'Blood Sugar (Fasting)', value: bs, unit: 'mg/dL',
        level: 'borderline', label: 'Sub-Optimal Diabetic Control',
        guideline: 'ADA 2024 — Fasting Target >130 mg/dL indicates suboptimal control',
        context: `Fasting glucose ${bs} mg/dL exceeds the ADA target of 130 mg/dL. ${
          age >= 65 ? 'Older adults may have a more relaxed target of <150 (ADA 2024 Older Adults).' : ''
        }`,
        recommendation: 'Review medication timing, carb intake, and meal composition with your doctor. Aim for <130 fasting.',
        foodWarning: 'Avoid: white rice, maida, sugar, fruit juice, sweets, refined carbs, high-GI foods',
        urgency: 'soon',
      };
    }
    return {
      vital: 'Blood Sugar (Fasting)', value: bs, unit: 'mg/dL',
      level: 'critical', label: 'Poorly Controlled Diabetes',
      guideline: 'ADA 2024 — Fasting >180 mg/dL is poor glycemic control',
      context: `Fasting glucose of ${bs} mg/dL is critically elevated. Sustained levels above 180 mg/dL increase risk of diabetic complications: neuropathy, nephropathy, retinopathy, cardiovascular disease.`,
      recommendation: '🚨 Contact your endocrinologist/diabetologist urgently. Medication adjustment likely needed.',
      foodWarning: 'STRICTLY avoid: all sugars, refined carbs, fruit juices, sweets, white rice, maida/white bread, processed foods, alcohol',
      urgency: 'urgent',
    };
  }

  // Non-diabetic assessments
  if (bs >= 126) {
    return {
      vital: 'Blood Sugar (Fasting)', value: bs, unit: 'mg/dL',
      level: 'critical', label: 'Diabetic Range',
      guideline: 'ADA 2024 — Diabetes Diagnosis Criterion: Fasting ≥126 mg/dL',
      context: `Fasting glucose of ${bs} mg/dL meets the ADA 2024 diagnostic criterion for Diabetes Mellitus (≥126 mg/dL). ${
        hasPCOS ? 'PCOS significantly increases the risk of T2DM in women — insulin resistance is the mechanism.' : ''
      } ${hasPancr ? 'Pancreatic conditions can cause secondary diabetes.' : ''
      } Diagnosis requires confirmation on a second separate day.`,
      recommendation: 'See a doctor immediately for HbA1c, OGTT, and full metabolic panel. Do not self-diagnose without clinical confirmation.',
      foodWarning: 'Strictly avoid: all high-GI foods, sugars, refined carbs, white rice, packaged snacks, sweetened drinks',
      urgency: 'urgent',
    };
  }

  if (bs >= 100) {
    return {
      vital: 'Blood Sugar (Fasting)', value: bs, unit: 'mg/dL',
      level: 'borderline', label: 'Prediabetes (IFG)',
      guideline: 'ADA 2024 / WHO 2023 — Prediabetes: 100–125 mg/dL (IFG)',
      context: `Fasting glucose of ${bs} mg/dL is in the prediabetic range (IFG = Impaired Fasting Glucose). ${
        hasPCOS ? 'PCOS causes insulin resistance — women with PCOS at this range have a 40% chance of developing T2DM within 5 years.' : ''
      } ${v.gender === 'female' && (v.age || 40) > 45 ? 'Post-menopausal women have higher T2DM risk at this glucose level.' : ''
      } Indians/South Asians develop T2DM at lower BMI and glucose (ICMR 2023).`,
      recommendation: 'Lifestyle intervention can reverse prediabetes. 150 min/week moderate exercise reduces progression by 58% (DPP trial). Reduce refined carbs, sugar, and lose 5–7% body weight if overweight.',
      foodWarning: 'Limit: sugar, white rice, maida, sweets, fruit juice, packaged snacks. Prefer: whole grains, millets, vegetables, legumes.',
      urgency: 'soon',
    };
  }

  // Normal
  if (bs >= 70) {
    return {
      vital: 'Blood Sugar (Fasting)', value: bs, unit: 'mg/dL',
      level: 'optimal', label: 'Normal Fasting Glucose',
      guideline: 'ADA 2024 / WHO 2023 — Normal: 70–99 mg/dL',
      context: `Excellent fasting glucose of ${bs} mg/dL. Well within normal range.`,
      recommendation: 'Maintain balanced diet with low GI foods and regular physical activity.',
      urgency: 'none',
    };
  }

  return null;
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     HEART RATE ENGINE
//     Sources: AHA 2022, ESC 2021, ACSM 2020
// ═══════════════════════════════════════════════════════════════════════════════

function assessHeartRate(v: VitalInput): VitalAssessment | null {
  const hr       = v.heartRate;
  if (!hr) return null;

  const diseases = v.diseases || [];
  const age      = v.age || 40;
  const hasFib   = hasDx(diseases, 'atrial fib', 'afib', 'arrhythmia');
  const hasHF    = hasDx(diseases, 'heart failure');
  const hasCAD   = hasDx(diseases, 'heart disease', 'cardiac', 'coronary');
  const hasDM    = hasDx(diseases, 'diabetes', 'diabetic');
  const onBeta   = hasDx(diseases, 'beta blocker', 'metoprolol', 'atenolol', 'bisoprolol');

  // Max predicted HR = 220 - age (ACSM)
  const maxHR = 220 - age;

  /**
   * AHA Normal Resting HR: 60–100 bpm (adults)
   * Athletes: 40–60 bpm (physiological bradycardia — AHA)
   * Bradycardia with symptoms: <60, concerning if <50 in non-athletes
   * Tachycardia: >100 bpm at rest
   * AF target rate: <110 bpm at rest (AHA 2014 AF Guidelines)
   * HF with reduced EF: HR target <70 bpm (ESC 2021)
   * DM autonomic neuropathy: can cause resting tachycardia ~90-100
   */

  // Very severe bradycardia
  if (hr < 40) {
    return {
      vital: 'Heart Rate', value: hr, unit: 'bpm',
      level: 'critical', label: 'Severe Bradycardia',
      guideline: 'AHA 2022 — Bradyarrhythmia: HR <40 bpm',
      context: `Resting HR of ${hr} bpm is critically low. Even trained athletes rarely go below 40 bpm at rest. ${onBeta ? 'Beta-blockers can cause excessive bradycardia — medication review may be needed.' : ''}`,
      recommendation: '🚨 Seek immediate cardiac evaluation. Check for heart block, sick sinus syndrome, or medication toxicity.',
      urgency: 'urgent',
    };
  }

  // Mild bradycardia
  if (hr < 60) {
    const isAthlete = !hasDM && !hasHF && !hasCAD;
    if (isAthlete) {
      return {
        vital: 'Heart Rate', value: hr, unit: 'bpm',
        level: 'optimal', label: 'Athletic Bradycardia',
        guideline: 'AHA — Physiological Bradycardia in Athletes (40–60 bpm)',
        context: `Resting HR of ${hr} bpm may reflect athletic conditioning. Endurance athletes commonly have lower resting HR due to increased stroke volume.`,
        recommendation: 'No action needed if asymptomatic. Monitor for dizziness or fainting.',
        urgency: 'none',
      };
    }
    return {
      vital: 'Heart Rate', value: hr, unit: 'bpm',
      level: 'borderline', label: 'Bradycardia',
      guideline: 'AHA 2022 — Bradycardia: HR <60 bpm',
      context: `Resting HR of ${hr} bpm is below normal. ${onBeta ? 'Beta-blockers appropriately lower HR — this may be expected.' : `${hasHF ? 'In HF, target HR is <70 bpm (ESC 2021) so this may be acceptable.' : 'Could indicate hypothyroidism, heart block, or medication effect.'}`}`,
      recommendation: `${onBeta ? 'Inform your doctor at next visit.' : 'Consult cardiologist if symptomatic (fatigue, dizziness).'}`,
      urgency: onBeta ? 'watch' : 'soon',
    };
  }

  // Optimal range
  if (hr <= 80) {
    return {
      vital: 'Heart Rate', value: hr, unit: 'bpm',
      level: 'optimal', label: 'Excellent Resting Heart Rate',
      guideline: 'AHA 2022 — Optimal Resting HR: 60–80 bpm',
      context: `Resting HR of ${hr} bpm is in the optimal zone. Lower resting HR is associated with lower cardiovascular mortality (Framingham Heart Study).`,
      recommendation: 'Maintain regular aerobic exercise to keep HR in this optimal range.',
      urgency: 'none',
    };
  }

  if (hr <= 100) {
    return {
      vital: 'Heart Rate', value: hr, unit: 'bpm',
      level: 'normal', label: 'Normal Heart Rate',
      guideline: 'AHA 2022 — Normal Resting HR: 60–100 bpm',
      context: `Resting HR of ${hr} bpm is within normal range, though on the higher end. ${hasDM ? 'Diabetic autonomic neuropathy can cause resting tachycardia in the 90–100 range.' : ''}`,
      recommendation: 'Regular aerobic exercise can bring resting HR lower, reducing long-term cardiovascular risk.',
      urgency: 'none',
    };
  }

  // Tachycardia > 100
  if (hr <= 120) {
    return {
      vital: 'Heart Rate', value: hr, unit: 'bpm',
      level: 'borderline', label: 'Resting Tachycardia',
      guideline: 'AHA 2022 — Tachycardia: HR >100 bpm at rest',
      context: `Resting HR of ${hr} bpm meets the tachycardia threshold (>100 bpm). ${
        hasFib ? 'In atrial fibrillation, rate control target is <110 bpm (AHA 2014 AF Guidelines).' : ''
      } ${hasHF ? 'In heart failure, elevated HR worsens cardiac output — ESC 2021 target is <70 bpm.' : ''
      } Causes: anemia, dehydration, hyperthyroidism, fever, anxiety, caffeine, or cardiac arrhythmia.`,
      recommendation: `${hasFib ? 'Discuss rate control medications with cardiologist.' : 'Rule out thyroid issues, anemia, and dehydration. Reduce caffeine. 12-lead ECG recommended.'}`,
      foodWarning: 'Avoid: excess caffeine (coffee, energy drinks, tea), alcohol, stimulants',
      urgency: hasFib || hasHF ? 'urgent' : 'soon',
    };
  }

  return {
    vital: 'Heart Rate', value: hr, unit: 'bpm',
    level: 'critical', label: 'Severe Tachycardia',
    guideline: 'AHA 2022 — Severe Resting Tachycardia >120 bpm',
    context: `Resting HR of ${hr} bpm at rest is significantly elevated. This requires urgent evaluation. ${hasFib ? 'In known AF, this is above the acceptable rate control target.' : 'Rule out SVT, ventricular tachycardia, or severe systemic cause.'}`,
    recommendation: '🚨 Seek immediate cardiac evaluation — ECG, cardiac monitoring needed.',
    foodWarning: 'Avoid all stimulants, caffeine, alcohol immediately',
    urgency: 'urgent',
  };
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     SpO2 ENGINE
//     Sources: WHO 2023, BTS 2017, ATS 2020, COVID-19 WHO Pulse Ox Guidelines
// ═══════════════════════════════════════════════════════════════════════════════

function assessSpO2(v: VitalInput): VitalAssessment | null {
  const spo2     = v.spo2;
  if (!spo2) return null;

  const diseases = v.diseases || [];
  const hasCOPD  = hasDx(diseases, 'copd', 'chronic obstructive', 'emphysema', 'bronchitis');
  const hasAsthma= hasDx(diseases, 'asthma');
  const hasSleep = hasDx(diseases, 'sleep apnea', 'osa');

  /**
   * WHO / BTS / ATS SpO2 Standards:
   * - Normal: 95–100%
   * - Acceptable in COPD: 88–92% (BTS 2017 — higher O2 can suppress respiratory drive)
   * - Mild hypoxemia: 91–94%
   * - Moderate hypoxemia: 86–90%
   * - Severe hypoxemia: <86% (ICU threshold)
   * - Critical: <85%
   */

  if (spo2 >= 95) {
    return {
      vital: 'Oxygen Saturation (SpO2)', value: spo2, unit: '%',
      level: 'optimal', label: 'Normal SpO2',
      guideline: 'WHO 2023 / BTS 2017 — Normal Oxygen Saturation: ≥95%',
      context: `SpO2 of ${spo2}% is normal. Adequate tissue oxygenation. ${hasCOPD ? 'COPD patients have a different target (88–92%) — yours is actually above normal.' : ''}`,
      recommendation: 'Normal. Maintain respiratory health with regular breathing exercises.',
      urgency: 'none',
    };
  }

  if (spo2 >= 91 && hasCOPD) {
    return {
      vital: 'Oxygen Saturation (SpO2)', value: spo2, unit: '%',
      level: 'normal', label: 'Acceptable for COPD',
      guideline: 'BTS 2017 — COPD SpO2 Target: 88–92%',
      context: `SpO2 of ${spo2}% is within the BTS 2017 recommended target of 88–92% for COPD patients. Higher O2 targets in COPD can suppress hypoxic respiratory drive.`,
      recommendation: 'Within COPD target range. Continue prescribed O2 therapy if applicable. Monitor symptoms.',
      urgency: 'watch',
    };
  }

  if (spo2 >= 91) {
    return {
      vital: 'Oxygen Saturation (SpO2)', value: spo2, unit: '%',
      level: 'borderline', label: 'Mild Hypoxemia',
      guideline: 'WHO / ATS 2020 — Mild Hypoxemia: 91–94%',
      context: `SpO2 of ${spo2}% indicates mild hypoxemia. ${hasAsthma ? 'Asthma exacerbation can lower SpO2 — assess for wheeze or dyspnea.' : ''} ${hasSleep ? 'Sleep apnea patients may have daytime SpO2 dips.' : ''} Common causes: poor perfusion of finger, anemia, early respiratory infection.`,
      recommendation: 'Recheck with better circulation (warm the finger). If consistently below 94%, seek medical evaluation.',
      urgency: 'soon',
    };
  }

  if (spo2 >= 86) {
    return {
      vital: 'Oxygen Saturation (SpO2)', value: spo2, unit: '%',
      level: 'high', label: 'Moderate Hypoxemia',
      guideline: 'WHO / BTS — Moderate Hypoxemia: 86–90%',
      context: `SpO2 of ${spo2}% is in the moderate hypoxemia range. ${hasAsthma ? 'This SpO2 with asthma indicates a moderate-severe asthma attack requiring immediate bronchodilator.' : ''} This level indicates significant oxygen deficit and requires urgent evaluation.`,
      recommendation: '🚨 Seek immediate medical care. Consider supplemental oxygen.',
      urgency: 'urgent',
    };
  }

  return {
    vital: 'Oxygen Saturation (SpO2)', value: spo2, unit: '%',
    level: 'critical', label: 'Severe Hypoxemia',
    guideline: 'WHO / ICU Threshold — Severe Hypoxemia: <86%',
    context: `SpO2 of ${spo2}% is critically low. This is an EMERGENCY — severe hypoxemia can cause organ damage within minutes.`,
    recommendation: '🚨 CALL EMERGENCY SERVICES IMMEDIATELY. Apply supplemental oxygen if available.',
    urgency: 'emergency',
  };
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     CHOLESTEROL ENGINE
//     Sources: ACC/AHA 2019, NCEP ATP III, ESC/EAS 2019, ICMR 2023
// ═══════════════════════════════════════════════════════════════════════════════

function assessCholesterol(v: VitalInput): VitalAssessment | null {
  const chol     = v.cholesterol;
  if (!chol) return null;

  const diseases = v.diseases || [];
  const hasCAD   = hasDx(diseases, 'heart disease', 'cardiac', 'coronary', 'cad', 'heart attack', 'mi');
  const hasDM    = hasDx(diseases, 'diabetes', 'diabetic');
  const hasCKD   = hasDx(diseases, 'kidney', 'ckd');
  const hasStroke= hasDx(diseases, 'stroke');
  const hasFH    = hasDx(diseases, 'familial hypercholesterol', 'fh');

  /**
   * ACC/AHA 2019 Cholesterol Guidelines (Total Cholesterol):
   * - Desirable:    <200 mg/dL
   * - Borderline:   200–239 mg/dL
   * - High:         ≥240 mg/dL
   *
   * HIGH-RISK patients (CAD, DM, stroke) — LDL target <70 mg/dL
   * LDL can be estimated as: Total - HDL - (TG/5) (Friedewald)
   * We only have total cholesterol, so use conservative total thresholds.
   *
   * ICMR 2023 India-specific: Indians have dyslipidemia at lower BMI
   * ESC/EAS 2019: very high-risk patients need LDL <55 mg/dL
   */

  const isHighRisk = hasCAD || hasStroke || hasFH;
  const isModRisk  = hasDM || hasCKD;

  if (isHighRisk && chol >= 160) {
    return {
      vital: 'Cholesterol (Total)', value: chol, unit: 'mg/dL',
      level: 'critical', label: 'High Cholesterol (Very High Risk Patient)',
      guideline: 'ESC/EAS 2019 / ACC/AHA 2019 — Very High CV Risk: LDL <55 mg/dL, Total should be <160',
      context: `Total cholesterol of ${chol} mg/dL is concerning for a patient with ${diseases.slice(0, 2).join(', ')}. For very high-risk patients (known cardiovascular disease or stroke), the ESC/EAS 2019 target is LDL <55 mg/dL, translating to total cholesterol ideally <160 mg/dL.`,
      recommendation: '🚨 Contact your cardiologist for lipid management review. High-intensity statin therapy likely needed. PCSK9 inhibitor may be indicated.',
      foodWarning: 'STRICTLY avoid: trans fats (vanaspati, dalda), full-fat dairy, fatty meats, processed foods, fried foods, coconut oil, palm oil',
      urgency: 'urgent',
    };
  }

  if (chol < 200) {
    return {
      vital: 'Cholesterol (Total)', value: chol, unit: 'mg/dL',
      level: 'optimal', label: 'Desirable Cholesterol',
      guideline: 'NCEP ATP III / ACC/AHA 2019 — Desirable Total Cholesterol: <200 mg/dL',
      context: `Total cholesterol of ${chol} mg/dL is in the desirable range. ${isModRisk ? `For diabetics/CKD patients, LDL should be <100 mg/dL (ACC/AHA 2019) — full lipid panel needed.` : ''}`,
      recommendation: 'Maintain heart-healthy diet. Get a full lipid panel annually.',
      urgency: 'none',
    };
  }

  if (chol <= 239) {
    return {
      vital: 'Cholesterol (Total)', value: chol, unit: 'mg/dL',
      level: 'borderline', label: 'Borderline High Cholesterol',
      guideline: 'NCEP ATP III — Borderline High: 200–239 mg/dL',
      context: `Total cholesterol of ${chol} mg/dL is borderline high. ${isModRisk ? 'For diabetics, ACC/AHA 2019 recommends statin therapy regardless of baseline LDL if aged 40–75 with 10-year CV risk >7.5%.' : 'Get a full lipid panel to assess LDL, HDL, and triglycerides separately.'}`,
      recommendation: 'Mediterranean/DASH diet, increase soluble fiber (oats, psyllium), reduce saturated fats. Full lipid panel needed.',
      foodWarning: 'Limit: full-fat dairy, red meat, fried foods, trans fats, refined carbs (raise TG)',
      urgency: 'soon',
    };
  }

  return {
    vital: 'Cholesterol (Total)', value: chol, unit: 'mg/dL',
    level: 'high', label: 'High Cholesterol',
    guideline: 'NCEP ATP III — High Total Cholesterol: ≥240 mg/dL',
    context: `Total cholesterol of ${chol} mg/dL is in the high-risk category. This doubles the risk of heart disease vs <200 mg/dL (Framingham Study). ${hasFH ? 'Familial hypercholesterolemia requires aggressive statin + possible PCSK9 inhibitor therapy.' : ''}`,
    recommendation: 'Consult doctor for statin therapy evaluation. Full lipid panel, 10-year ASCVD risk calculation needed.',
    foodWarning: 'Avoid: trans fats, saturated fats, fried foods, full-fat dairy, red meat, processed snacks, coconut/palm oil. Increase: oats, flaxseed, nuts (walnuts, almonds), omega-3 rich fish',
    urgency: 'urgent',
  };
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     BMI ENGINE
//     Sources: WHO 2000, ICMR 2023 (India-specific cutoffs), NIH
// ═══════════════════════════════════════════════════════════════════════════════

function assessBMI(v: VitalInput): VitalAssessment | null {
  const bmi      = v.bmi;
  if (!bmi) return null;

  const age      = v.age || 40;
  const gender   = v.gender || 'other';
  const diseases = v.diseases || [];
  const hasDM    = hasDx(diseases, 'diabetes');
  const hasPCOS  = hasDx(diseases, 'pcos', 'pcod');

  /**
   * WHO BMI Classification (General):
   * <18.5: Underweight
   * 18.5–24.9: Normal
   * 25–29.9: Overweight
   * 30–34.9: Obese Class I
   * 35–39.9: Obese Class II
   * ≥40: Obese Class III (Morbid)
   *
   * ICMR / WHOAPRO India-specific 2023 cutoffs for Asians:
   * <18.5: Underweight
   * 18.5–22.9: Normal
   * 23–24.9: Overweight (at risk)
   * 25–29.9: Obese I
   * ≥30: Obese II
   * (Indians carry more visceral fat at lower BMI)
   *
   * Gender: Women naturally have higher body fat % — same BMI is more concerning in men for metabolic risk
   */

  // Using India-specific cutoffs (ICMR 2023)
  if (bmi < 16) {
    return {
      vital: 'BMI', value: bmi, unit: 'kg/m²',
      level: 'critical', label: 'Severe Underweight',
      guideline: 'WHO — Severe Thinness: BMI <16',
      context: `BMI of ${bmi} is severely underweight. Risk of malnutrition, muscle wasting, immunosuppression, anemia, and bone loss.`,
      recommendation: '🚨 Nutritional rehabilitation needed. Consult dietitian and doctor urgently.',
      urgency: 'urgent',
    };
  }

  if (bmi < 18.5) {
    return {
      vital: 'BMI', value: bmi, unit: 'kg/m²',
      level: 'borderline', label: 'Underweight',
      guideline: 'WHO — Underweight: BMI <18.5',
      context: `BMI of ${bmi} is underweight. ${gender === 'female' ? 'In women, low BMI can affect menstrual health and bone density (PCOS women are often not overweight).' : ''} Risk of nutritional deficiency.`,
      recommendation: 'Increase caloric intake with nutrient-dense foods. Protein target: 1.2–1.6g/kg body weight. Strength training helps.',
      urgency: 'watch',
    };
  }

  // India-specific normal (ICMR 2023)
  if (bmi <= 22.9) {
    return {
      vital: 'BMI', value: bmi, unit: 'kg/m²',
      level: 'optimal', label: 'Normal Weight',
      guideline: 'ICMR 2023 / WHO — Normal BMI for South Asians: 18.5–22.9',
      context: `BMI of ${bmi} is in the healthy range for South Asians (ICMR 2023 cutoff: <23). Lowest metabolic risk zone.`,
      recommendation: 'Maintain current weight through balanced diet and regular exercise.',
      urgency: 'none',
    };
  }

  // At-risk (India-specific "overweight")
  if (bmi <= 24.9) {
    return {
      vital: 'BMI', value: bmi, unit: 'kg/m²',
      level: 'borderline', label: 'At Risk (Asian Overweight)',
      guideline: 'ICMR / WHOAPRO 2023 — South Asians "At Risk": BMI 23–24.9',
      context: `BMI of ${bmi} is above the ICMR 2023 cutoff of 23 for South Asians. Indians carry more visceral fat at lower BMI, increasing risk of diabetes and cardiovascular disease at this range. ${hasDM || hasPCOS ? 'Your existing condition increases the metabolic risk at this BMI.' : ''}`,
      recommendation: 'Target BMI <23. 5% weight loss significantly reduces metabolic risk. Reduce refined carbs, increase physical activity.',
      urgency: 'watch',
    };
  }

  if (bmi <= 29.9) {
    return {
      vital: 'BMI', value: bmi, unit: 'kg/m²',
      level: 'high', label: 'Obese Class I (Asian Classification)',
      guideline: 'ICMR 2023 — Asian Obesity Class I: BMI 25–29.9',
      context: `BMI of ${bmi} is classified as Obese Class I in ICMR 2023 criteria for South Asians (vs WHO cutoff of 30). This significantly increases risk of T2DM, hypertension, sleep apnea, and NAFLD. ${hasDM ? 'Weight loss of 5–10% reduces HbA1c by 0.5–1% and improves insulin sensitivity.' : ''} ${hasPCOS ? 'Weight loss of 5% in PCOS can restore menstrual cycles and reduce androgen levels.' : ''}`,
      recommendation: '5–10% weight loss is the first-line intervention. Calorie deficit of 500–750 kcal/day. 150–300 min/week aerobic exercise (AHA/ADA).',
      foodWarning: 'Reduce: refined carbs, sugary beverages, fried foods, processed snacks, ultra-processed foods',
      urgency: 'soon',
    };
  }

  if (bmi <= 39.9) {
    return {
      vital: 'BMI', value: bmi, unit: 'kg/m²',
      level: 'critical', label: 'Obese Class II–III',
      guideline: 'WHO / ICMR — Obese Class II: BMI 30–39.9',
      context: `BMI of ${bmi} is in the high-risk obesity range. Associated with high risk of T2DM, hypertension, heart disease, sleep apnea, NAFLD, and certain cancers. ${hasCAD(diseases) ? 'Morbid obesity combined with cardiac disease requires specialized care.' : ''}`,
      recommendation: 'Medical weight management: dietitian + physician supervision. Consider bariatric medicine evaluation. Target: 10–20% weight loss.',
      foodWarning: 'Strict dietary intervention required — consult registered dietitian',
      urgency: 'urgent',
    };
  }

  return {
    vital: 'BMI', value: bmi, unit: 'kg/m²',
    level: 'critical', label: 'Morbid Obesity',
    guideline: 'WHO — Morbid Obesity: BMI ≥40',
    context: `BMI of ${bmi} is morbidly obese — this is associated with markedly reduced life expectancy and high prevalence of metabolic syndrome, T2DM, severe sleep apnea, and musculoskeletal disease.`,
    recommendation: '🚨 Bariatric surgery evaluation recommended. Intensive medical management required.',
    urgency: 'urgent',
  };
}

// Helper to check disease names
function hasCAD(diseases: string[]): boolean {
  return hasDx(diseases, 'heart disease', 'cardiac', 'coronary', 'cad');
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     COMBINED RISK ENGINE
//     Detects dangerous combinations that are worse than individual values alone
// ═══════════════════════════════════════════════════════════════════════════════

function detectCombinedAlerts(v: VitalInput): CombinedAlert[] {
  const alerts: CombinedAlert[] = [];
  const s  = v.systolicBP;
  const bs = v.bloodSugar;
  const hr = v.heartRate;
  const diseases = v.diseases || [];
  const hasDM    = hasDx(diseases, 'diabetes', 'diabetic');
  const hasHT    = hasDx(diseases, 'hypertension', 'blood pressure', 'bp');

  // Metabolic Syndrome: High BP + High Sugar + High BMI (NCEP ATP III / IDF 2006)
  if (s && bs && v.bmi &&
      s >= 130 && bs >= 100 && v.bmi >= 23) {
    alerts.push({
      title:   'Metabolic Syndrome Detected',
      detail:  `You have 3 of 5 metabolic syndrome criteria: Elevated BP (${s} mmHg), elevated fasting glucose (${bs} mg/dL), and high BMI (${v.bmi}). Metabolic syndrome triples heart attack risk and quintuples T2DM risk (IDF/NCEP 2006).`,
      urgency: 'urgent',
      source:  'NCEP ATP III / IDF 2006 — Metabolic Syndrome Criteria',
    });
  }

  // Cardiometabolic double jeopardy: both BP and sugar are elevated
  if (s && bs && s >= 140 && bs >= 126) {
    alerts.push({
      title:   'Cardiometabolic Emergency',
      detail:  `Both BP (${s} mmHg) AND blood sugar (${bs} mg/dL) are at critical levels simultaneously. This combination dramatically elevates risk of stroke, heart attack, and acute kidney injury. Immediate multi-disciplinary medical intervention required.`,
      urgency: 'emergency',
      source:  'ADA 2024 + AHA/ACC 2018 — Cardiometabolic Risk Compounding',
    });
  }

  // High HR + High BP = risk of hypertensive urgency with sympathetic overdrive
  if (s && hr && s >= 140 && hr >= 100) {
    alerts.push({
      title:   'Hypertension with Tachycardia',
      detail:  `High BP (${s} mmHg) combined with elevated resting heart rate (${hr} bpm) suggests sympathetic nervous system overdrive. This combination is associated with higher risk of adverse cardiac events. Thyroid disease, adrenal tumor (pheochromocytoma), or severe anxiety must be ruled out.`,
      urgency: 'urgent',
      source:  'ESC 2021 — Sympathetic Activation in Hypertension',
    });
  }

  // DM + HT combination (much higher CV risk)
  if ((hasDM || (bs && bs >= 126)) && (hasHT || (s && s >= 130))) {
    if (!alerts.some(a => a.title.includes('Metabolic'))) {
      alerts.push({
        title:   'Diabetes + Hypertension: High CV Risk',
        detail:  `The combination of diabetes and hypertension multiplies cardiovascular risk by 4–8× compared to either condition alone (Steno-2 study, ACCORD trial). ADA 2024 recommends BP target <130/80 mmHg for all diabetics, and statin therapy for most diabetics age 40–75.`,
        urgency: 'soon',
        source:  'ADA 2024 / ACCORD Trial / Steno-2 Study',
      });
    }
  }

  // Elderly + very high BP risk
  if (s && (v.age || 0) >= 75 && s >= 150) {
    alerts.push({
      title:   'Elderly Patient with Very High BP',
      detail:  `For patients ≥75 years, BP ≥150 mmHg significantly increases risk of stroke (2× at each 20mmHg increment — Lewington et al., Lancet). SPRINT trial showed intensive BP control to <120 mmHg reduces mortality in older adults. Discuss benefits/risks with your cardiologist.`,
      urgency: 'urgent',
      source:  'SPRINT Trial (NEJM 2015) / Lewington Meta-analysis (Lancet 2002)',
    });
  }

  return alerts;
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     FOOD RISK ENGINE
//     Disease + Vital based food warnings with specific evidence
// ═══════════════════════════════════════════════════════════════════════════════

function computeFoodGuidance(v: VitalInput): { avoid: string[]; safe: string[] } {
  const avoid: string[] = [];
  const safe:  string[] = [];
  const s        = v.systolicBP;
  const bs       = v.bloodSugar;
  const chol     = v.cholesterol;
  const diseases = v.diseases || [];
  const hasDM    = hasDx(diseases, 'diabetes', 'diabetic');
  const hasHT    = hasDx(diseases, 'hypertension', 'bp');
  const hasHeart = hasDx(diseases, 'heart disease', 'cardiac', 'coronary');
  const hasPCOS  = hasDx(diseases, 'pcos', 'pcod');
  const hasKidney= hasDx(diseases, 'kidney', 'ckd', 'renal');
  const hasGerd  = hasDx(diseases, 'acid reflux', 'gerd', 'acidity');
  const hasFatty = hasDx(diseases, 'fatty liver', 'nafld');

  if (s && s >= 130 || hasHT) {
    avoid.push('Table salt & high-sodium foods (limit <1500mg/day — AHA for HT)');
    avoid.push('Processed meats: salami, sausage, deli meat (1200–2400mg sodium/serving)');
    avoid.push('Canned soups, instant noodles (800–1200mg sodium/serving)');
    avoid.push('Pickles, soy sauce, fish sauce, ketchup');
    avoid.push('Fast food, pizza, burgers (>1000mg sodium typical)');
    avoid.push('Alcohol (raises BP by 3-4 mmHg — ESC 2021)');
    safe.push('Potassium-rich foods: banana, sweet potato, spinach, lentils (lower BP — DASH study)');
    safe.push('DASH diet foods: low-fat dairy, fish, nuts, whole grains, fruits, vegetables');
    safe.push('Beets, garlic, watermelon (natural nitrates lower BP — Cochrane review)');
  }

  if (bs && bs >= 100 || hasDM) {
    avoid.push('Sugar, jaggery, honey, glucose in all forms');
    avoid.push('White rice, maida/white flour, white bread (GI 70+)');
    avoid.push('Packaged fruit juices, sodas, sweetened drinks (concentrated glucose)');
    avoid.push('Sweets: ladoo, gulab jamun, kheer, ice cream');
    avoid.push('Potatoes (baked/fried), refined breakfast cereals');
    safe.push('Millets (bajra, jowar, ragi) — low GI (25–55) — ICMR recommendation for Indians');
    safe.push('Legumes & dal — high fiber, low GI, good protein');
    safe.push('Non-starchy vegetables: broccoli, spinach, cucumber, tomato, karela (bitter gourd lowers sugar)');
    safe.push('Methi (fenugreek): fiber slows sugar absorption — ICMR 2023');
    safe.push('Nuts (almonds, walnuts): improve insulin sensitivity');
  }

  if (chol && chol >= 200 || hasHeart) {
    avoid.push('Trans fats: vanaspati, dalda, partially hydrogenated oils (raise LDL, lower HDL)');
    avoid.push('Full-fat dairy: cream, ghee in excess, paneer in large quantity');
    avoid.push('Fatty red meat: beef, lamb, pork (saturated fat >20g/day)');
    avoid.push('Fried foods: pakoras, puri, samosa, chips');
    avoid.push('Coconut oil, palm oil (high saturated fat)');
    safe.push('Oats & oat bran: beta-glucan lowers LDL by 5–10% (FDA 1997 heart-health claim)');
    safe.push('Walnuts, almonds: omega-3 & plant sterols lower LDL (AHA)');
    safe.push('Fatty fish (salmon, sardines, mackerel): omega-3 lowers triglycerides 20–50%');
    safe.push('Soluble fiber: psyllium, beans, lentils, apples, pears');
    safe.push('Olive oil (extra-virgin): MUFA + polyphenols — PREDIMED trial');
  }

  if (hasPCOS) {
    avoid.push('High-GI foods (trigger insulin spikes that worsen PCOS hormonal imbalance)');
    avoid.push('Dairy in excess: may increase IGF-1 and androgen levels in PCOS');
    avoid.push('Alcohol (worsens liver metabolism of hormones)');
    safe.push('Low-GI carbs: millets, lentils, oats, quinoa');
    safe.push('Anti-inflammatory foods: turmeric, ginger, omega-3 rich fish, flaxseed');
    safe.push('Spearmint tea: clinical evidence for reducing testosterone in PCOS (Grant, 2010)');
    safe.push('Inositol (found in beans, citrus): improves insulin signaling in PCOS');
  }

  if (hasKidney) {
    avoid.push('High-potassium foods if K+ is elevated: banana, orange, tomato, potato');
    avoid.push('High-phosphorus: colas/dark sodas, dairy excess, nuts, whole grains (for advanced CKD)');
    avoid.push('High-sodium (worsens fluid retention, BP in CKD)');
    avoid.push('Excess protein (>0.8g/kg for CKD stages 3–5 without dialysis — KDIGO 2021)');
    safe.push('Low-potassium fruits: apple, berries, grapes, watermelon');
    safe.push('Egg whites (good protein, low phosphorus)');
    safe.push('Controlled portions of white rice, white bread (lower potassium/phosphorus than whole grain for CKD)');
  }

  if (hasGerd) {
    avoid.push('Spicy foods, tomato-based sauces (lower LES tone)');
    avoid.push('Coffee, tea, alcohol (relax lower esophageal sphincter)');
    avoid.push('Chocolate, mint/peppermint (relax LES)');
    avoid.push('Fried/fatty foods (delay gastric emptying, worsen reflux)');
    safe.push('Alkaline foods: bananas, oatmeal, ginger, fennel');
    safe.push('Small, frequent meals — avoid large meals within 3h of sleep');
  }

  if (hasFatty) {
    avoid.push('Alcohol (directly toxic to liver — #1 factor in alcoholic fatty liver)');
    avoid.push('Fructose (high-fructose corn syrup, sodas) — directly drives hepatic fat synthesis');
    avoid.push('Saturated fats, fried foods');
    avoid.push('Refined carbs, white bread, maida products');
    safe.push('Coffee (2 cups/day reduces liver enzyme elevation — Hepatology 2007)');
    safe.push('Omega-3 fatty acids (reduce liver triglycerides — EASL 2016)');
    safe.push('Vitamin E-rich foods: sunflower seeds, almonds, spinach (reduces inflammation in NASH)');
  }

  return {
    avoid: [...new Set(avoid)],
    safe:  [...new Set(safe)],
  };
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     HEALTH SCORE ENGINE (Multi-factor, Evidence-Based)
// ═══════════════════════════════════════════════════════════════════════════════

function computeHealthScore(assessments: VitalAssessment[], combinedAlerts: CombinedAlert[]): number {
  let score = 100;

  for (const a of assessments) {
    switch (a.level) {
      case 'optimal':    score -= 0; break;
      case 'normal':     score -= 3; break;
      case 'borderline': score -= 8; break;
      case 'high':       score -= 18; break;
      case 'critical':   score -= 30; break;
    }
  }

  // Combined risk penalties
  for (const alert of combinedAlerts) {
    switch (alert.urgency) {
      case 'watch':     score -= 3; break;
      case 'soon':      score -= 8; break;
      case 'urgent':    score -= 15; break;
      case 'emergency': score -= 25; break;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// ─── ══════════════════════════════════════════════════════════════════════════
//     MAIN EXPORT — Full Clinical Assessment
// ═══════════════════════════════════════════════════════════════════════════════

export function runClinicalAssessment(v: VitalInput): CombinedRiskAssessment {
  const rawAssessments = [
    assessBloodPressure(v),
    assessBloodSugar(v),
    assessHeartRate(v),
    assessSpO2(v),
    assessCholesterol(v),
    assessBMI(v),
  ].filter(Boolean) as VitalAssessment[];

  const combinedAlerts   = detectCombinedAlerts(v);
  const { avoid, safe }  = computeFoodGuidance(v);
  const overallScore     = computeHealthScore(rawAssessments, combinedAlerts);

  const overallLevel: RiskLevel =
    overallScore >= 90 ? 'optimal' :
    overallScore >= 75 ? 'normal' :
    overallScore >= 55 ? 'borderline' :
    overallScore >= 35 ? 'high' : 'critical';

  const hasCritical = rawAssessments.some(a => a.level === 'critical') ||
    combinedAlerts.some(a => a.urgency === 'emergency');
  const hasHigh     = rawAssessments.some(a => a.level === 'high') ||
    combinedAlerts.some(a => a.urgency === 'urgent');

  const summary =
    hasCritical ? '🚨 Critical vitals detected. Seek immediate medical attention.' :
    hasHigh     ? '⚠️ Some vitals need urgent medical attention. Contact your doctor soon.' :
    overallScore >= 85 ? '✅ Excellent overall health! Keep maintaining these habits.' :
    overallScore >= 70 ? '👍 Good health overall, but some areas need attention.' :
    '📊 Multiple areas need improvement. Review recommendations below.';

  return {
    overallScore,
    overallLevel,
    vitals: rawAssessments,
    combinedAlerts,
    foodsToAvoid: avoid,
    foodsSafe: safe,
    summary,
  };
}

/**
 * Lightweight version for food risk checking in Marketplace —
 * Returns urgency level for a given meal based on current vitals
 */
export function getMealRiskFromVitals(v: VitalInput): {
  highBP: boolean;
  critBP: boolean;
  highSugar: boolean;
  critSugar: boolean;
  highChol: boolean;
  details: Record<string, string>;
} {
  const s  = v.systolicBP || 0;
  const bs = v.bloodSugar || 0;
  const ch = v.cholesterol || 0;
  const diseases = v.diseases || [];

  const hasHT = hasDx(diseases, 'hypertension', 'blood pressure', 'bp') || s >= 130;
  const hasDM = hasDx(diseases, 'diabetes', 'diabetic') || bs >= 126;

  return {
    highBP:    s >= 130 || hasHT,
    critBP:    s >= 140,
    highSugar: bs >= 100 || hasDM,
    critSugar: bs >= 126,
    highChol:  ch >= 200,
    details: {
      bp:    s ? `${s} mmHg (${s >= 140 ? 'Stage 2 HT — AHA' : s >= 130 ? 'Stage 1 HT — AHA' : 'Elevated'})` : '',
      sugar: bs ? `${bs} mg/dL (${bs >= 126 ? 'Diabetic range — ADA' : bs >= 100 ? 'Pre-diabetic — ADA' : 'Normal'})` : '',
      chol:  ch ? `${ch} mg/dL (${ch >= 240 ? 'High — NCEP ATP III' : ch >= 200 ? 'Borderline high' : 'Desirable'})` : '',
    },
  };
}
