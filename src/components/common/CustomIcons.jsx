/**
 * BloodBridge Bespoke Healthcare & Clinical Vector Iconography
 * Custom designed SVG icons replacing generic AI tropes (like Sparkles and emojis)
 * with authentic, professional medical and logistical symbols.
 */

// 1. Signature Brand Logo: Blood droplet with integrated cardiogram heartbeat & lifeline
export function BloodBridgeLogoIcon({ size = 24, color = "currentColor", className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="bb-drop-grad" x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E63946" />
          <stop offset="1" stopColor="#9B111E" />
        </linearGradient>
      </defs>
      {/* Dynamic Blood Droplet Silhouette */}
      <path
        d="M16 2.5C16 2.5 5 14.8 5 21.2C5 26.6 9.9 30 16 30C22.1 30 27 26.6 27 21.2C27 14.8 16 2.5 16 2.5Z"
        fill="url(#bb-drop-grad)"
      />
      {/* Integrated ECG Cardiogram Lifeline in Clean White */}
      <path
        d="M8.5 21.5H11.5L13.5 17L15.5 25.5L18 15L20 23.5L21.5 21.5H23.5"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// 2. Blood Bank Cold Storage Vault Icon: Dual-chamber cryo storage with cold-chain lock
export function BloodBankVaultIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="18" height="20" rx="3" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <circle cx="16" cy="7" r="1.5" fill={color} />
      <circle cx="16" cy="17" r="1.5" fill={color} />
      <path d="M7 6H11" />
      <path d="M7 8H9" />
      <path d="M7 16H11" />
      <path d="M7 18H9" />
      <path d="M8 2V4" strokeWidth="1.5" />
      <path d="M16 2V4" strokeWidth="1.5" />
    </svg>
  );
}

// 3. Hospital Clinical Ward Icon: Medical cross within acute care facility
export function HospitalClinicalIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
      <path d="M3 21h18" />
      {/* Prominent Medical Cross Badge */}
      <path d="M12 7v6" strokeWidth="2.5" />
      <path d="M9 10h6" strokeWidth="2.5" />
      <rect x="8" y="17" width="3" height="4" />
      <rect x="13" y="17" width="3" height="4" />
    </svg>
  );
}

// 4. Clinical Shortage Forecaster Icon: Predictive telemetry & algorithmic trend curve (No generic stars/sparkles!)
export function ForecasterAlgorithmIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      {/* Predictive ascending neural trend curve */}
      <path d="M7 16l4-5 3 3 6-8" />
      {/* Statistical projection node */}
      <circle cx="20" cy="6" r="2" fill={color} />
      <circle cx="11" cy="11" r="1.5" fill={color} />
      <circle cx="7" cy="16" r="1.5" fill={color} />
      <path d="M17 6h3v3" strokeWidth="1.5" />
    </svg>
  );
}

// 5. Rapid Medical Courier Dispatch Icon: Speed delivery of insulated blood box
export function VolunteerCourierIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Cold Chain Bio-box */}
      <rect x="5" y="8" width="14" height="13" rx="2" />
      <path d="M9 8V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v3" />
      {/* Medical Cross on box */}
      <path d="M12 12v5" strokeWidth="2" />
      <path d="M9.5 14.5h5" strokeWidth="2" />
      {/* Motion / Speed telemetry lines */}
      <path d="M1 10h2" strokeWidth="1.5" />
      <path d="M1 14h2" strokeWidth="1.5" />
      <path d="M21 10h2" strokeWidth="1.5" />
      <path d="M21 14h2" strokeWidth="1.5" />
    </svg>
  );
}

// 6. Surplus Exchange Icon: Inter-bank circular transfer preventing expiry
export function SurplusExchangeIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8L17 4V7H8C5.2 7 3 9.2 3 12" />
      <path d="M3 16L7 20V17H16C18.8 17 21 14.8 21 12" />
      {/* Central preservation hour counter */}
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 10.5V12L13 13" strokeWidth="1.5" />
    </svg>
  );
}

// 7. Recurring Transfusion Lifecycle Icon: Continuous patient support loop
export function RecurringTransfusionIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10" strokeDasharray="3 2" />
      <path d="M20 7L22 12H17L19 7Z" fill={color} />
      {/* Red cell cluster in center */}
      <path d="M12 7C12 7 8 11.5 8 14C8 16.2 9.8 18 12 18C14.2 18 16 16.2 16 14C16 11.5 12 7 12 7Z" fill={color} />
    </svg>
  );
}

// 8. Rare Phenotype Antibody Icon: Immunohematology diamond with Bombay hh helix
export function RarePhenotypeIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L21 8V16L12 22L3 16V8L12 2Z" />
      {/* Rare molecular diamond center */}
      <path d="M12 7L16 12L12 17L8 12L12 7Z" fill={color} fillOpacity="0.2" />
      <circle cx="12" cy="12" r="1.5" fill={color} />
    </svg>
  );
}

// 9. Grievance & Patient Care Support Icon: Caring medical stethoscope with dialogue pulse
export function GrievanceSupportIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      {/* Heartbeat pulse inside chat */}
      <path d="M8 12h2l1-2 2 4 1-2h2" strokeWidth="1.8" />
    </svg>
  );
}

// 10. Intelligent Medical Matcher Icon: Precision clinical target alignment (replaces emoji 🤖)
export function ClinicalMatchIcon({ size = 18, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  );
}

