import { useState } from 'react';
import { Gift, Award, CheckCircle, Sparkles, Copy, ExternalLink, Filter, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { mockRewards } from '../data/mockRewards';
import { getDonorLevel, getLevelProgress, getNextLevel } from '../utils/pointsCalculator';
import LevelBadge from '../components/common/LevelBadge';

const CATEGORIES = [
  { id: 'all', label: 'All Rewards' },
  { id: 'merchandise', label: 'Merchandise' },
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'discount', label: 'Discounts & Food' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'certificate', label: 'Certificates' },
  { id: 'digital', label: 'Digital Badges' },
];

export default function Rewards() {
  const { user, redeemReward, addPoints } = useAuth();
  const { showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' | 'my-rewards' | 'how-to-earn'
  const [confirmModal, setConfirmModal] = useState(null); // reward object to confirm
  const [successVoucher, setSuccessVoucher] = useState(null); // voucher after redemption
  const [copiedCode, setCopiedCode] = useState(null);

  const points = user?.points || 0;
  const level = getDonorLevel(points);
  const nextLevel = getNextLevel(points);
  const progress = getLevelProgress(points);

  const filteredRewards = selectedCategory === 'all'
    ? mockRewards
    : mockRewards.filter(r => r.category === selectedCategory);

  const userRedeemed = (user?.redeemedRewards || []).map((red, idx) => {
    const rewardInfo = mockRewards.find(r => r.id === red.rewardId) || {
      title: 'Donor Reward',
      description: 'Exclusive BloodBridge partner voucher',
      category: 'general',
      icon: '🎁',
      points: 100
    };
    return {
      ...red,
      rewardInfo,
      code: `BB-${(red.rewardId || 'RWD').toUpperCase()}-${1000 + idx}`,
    };
  });

  const handleRedeemClick = (reward) => {
    if (!user) {
      showToast('Please sign in to redeem rewards', 'error');
      return;
    }
    if (points < reward.points) {
      showToast(`You need ${reward.points - points} more points for this reward`, 'error');
      return;
    }
    setConfirmModal(reward);
  };

  const executeRedeem = () => {
    if (!confirmModal) return;
    const ok = redeemReward(confirmModal.id, confirmModal.points);
    if (ok) {
      const code = `BB-${confirmModal.id.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      setSuccessVoucher({ reward: confirmModal, code });
      showToast(`Successfully redeemed "${confirmModal.title}"!`, 'success');
      setConfirmModal(null);
    } else {
      showToast('Redemption failed. Check your points balance.', 'error');
      setConfirmModal(null);
    }
  };

  const copyVoucherCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast('Voucher code copied to clipboard!', 'success');
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 20px 64px' }}>
      {/* Page Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #172033 0%, #2a1124 100%)',
        borderRadius: 20,
        padding: '36px 32px',
        color: 'white',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 220, height: 220,
          background: 'radial-gradient(circle, rgba(214,40,57,0.25) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 620 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '4px 12px', background: 'rgba(214,40,57,0.2)', border: '1px solid rgba(214,40,57,0.4)', borderRadius: 20, fontSize: 12, fontWeight: 700, color: '#fca5a5', marginBottom: 12 }}>
              <Sparkles size={14} /> Lifesaver Rewards & Perks
            </div>
            <h1 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }}>
              Redeem Rewards for Your Impact
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 15, lineHeight: 1.6 }}>
              Every blood donation saves up to 3 lives. We honor your selfless commitment with points, merchandise, health vouchers, and exclusive community badges.
            </p>
          </div>

          {/* User Points Card */}
          {user ? (
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: '20px 24px',
              minWidth: 260,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Your Balance</span>
                <LevelBadge level={level} size="sm" />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: '#fbbf24', fontFamily: 'Plus Jakarta Sans' }}>
                  {points.toLocaleString()}
                </span>
                <span style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>PTS</span>
              </div>
              {nextLevel && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>
                    <span>Next: {nextLevel.name}</span>
                    <span>{nextLevel.min - points} pts to go</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, #D62839, #f59e0b)', borderRadius: 3 }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              padding: '20px 24px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, color: '#e2e8f0', marginBottom: 10 }}>Sign in to start earning points</p>
              <a href="/login" className="btn btn-primary" style={{ padding: '8px 20px', fontSize: 13, textDecoration: 'none' }}>
                Sign In Now
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid #e2e8f0', marginBottom: 28, overflowX: 'auto', paddingBottom: 2 }}>
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            color: activeTab === 'browse' ? '#D62839' : '#64748B',
            borderBottom: activeTab === 'browse' ? '3px solid #D62839' : '3px solid transparent',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Gift size={16} /> Browse Rewards ({mockRewards.length})
        </button>
        <button
          onClick={() => setActiveTab('my-rewards')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            color: activeTab === 'my-rewards' ? '#D62839' : '#64748B',
            borderBottom: activeTab === 'my-rewards' ? '3px solid #D62839' : '3px solid transparent',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <ShoppingBag size={16} /> My Redeemed ({userRedeemed.length})
        </button>
        <button
          onClick={() => setActiveTab('how-to-earn')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            color: activeTab === 'how-to-earn' ? '#D62839' : '#64748B',
            borderBottom: activeTab === 'how-to-earn' ? '3px solid #D62839' : '3px solid transparent',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Award size={16} /> How to Earn Points
        </button>
      </div>

      {/* Tab 1: Browse Rewards */}
      {activeTab === 'browse' && (
        <>
          {/* Category Filter Pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: selectedCategory === cat.id ? '#D62839' : '#f1f5f9',
                  color: selectedCategory === cat.id ? 'white' : '#475569',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedCategory === cat.id ? '0 2px 8px rgba(214,40,57,0.25)' : 'none',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Rewards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: 24,
          }}>
            {filteredRewards.map(reward => {
              const canAfford = points >= reward.points;
              return (
                <div
                  key={reward.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: 22,
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--card-shadow, 0 1px 3px rgba(0,0,0,0.05))';
                  }}
                >
                  <div>
                    {/* Top row: Icon and Stock badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 14,
                        background: '#fef2f2', border: '1px solid #fee2e2',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 26,
                      }}>
                        {reward.icon}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6,
                          background: reward.stock === 'unlimited' ? '#f0fdf4' : '#eff6ff',
                          color: reward.stock === 'unlimited' ? '#16a34a' : '#2563eb',
                        }}>
                          {reward.stock === 'unlimited' ? 'Always in Stock' : `${reward.stock} Left`}
                        </span>
                        {reward.estimatedValue && (
                          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                            Valued at {reward.estimatedValue}
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#172033', marginBottom: 8, lineHeight: 1.3 }}>
                      {reward.title}
                    </h3>

                    <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.5, marginBottom: 16 }}>
                      {reward.description}
                    </p>

                    {/* Tags */}
                    {reward.tags && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                        {reward.tags.map(t => (
                          <span key={t} style={{ fontSize: 11, background: '#f8fafc', color: '#64748B', padding: '2px 8px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Points & Action Button */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>COST</div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#D62839' }}>{reward.points}</span>
                        <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>pts</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRedeemClick(reward)}
                      disabled={!canAfford}
                      className={canAfford ? "btn btn-primary" : "btn"}
                      style={{
                        padding: '8px 18px',
                        fontSize: 13,
                        fontWeight: 700,
                        borderRadius: 10,
                        cursor: canAfford ? 'pointer' : 'not-allowed',
                        opacity: canAfford ? 1 : 0.55,
                        background: canAfford ? 'linear-gradient(135deg, #D62839, #b91c1c)' : '#e2e8f0',
                        color: canAfford ? 'white' : '#64748b',
                        border: 'none',
                        transition: 'all 0.2s',
                      }}
                    >
                      {canAfford ? 'Redeem Now' : 'Need Points'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tab 2: My Redeemed Rewards */}
      {activeTab === 'my-rewards' && (
        <div>
          {userRedeemed.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 16,
              border: '1px solid #e2e8f0', maxWidth: 500, margin: '0 auto',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎁</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#172033', marginBottom: 8 }}>
                No Rewards Redeemed Yet
              </h3>
              <p style={{ color: '#64748B', fontSize: 14, marginBottom: 20 }}>
                Donate blood or participate in community challenges to earn points, then redeem vouchers and gifts here.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: 13 }}
              >
                Browse Rewards Store
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
              {userRedeemed.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'white',
                    borderRadius: 16,
                    border: '1px solid #e2e8f0',
                    padding: 24,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 12,
                      background: '#fef2f2', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 24,
                    }}>
                      {item.rewardInfo?.icon || '🎁'}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 16, fontWeight: 700, color: '#172033', margin: 0 }}>
                        {item.rewardInfo?.title}
                      </h4>
                      <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>
                        Redeemed on {new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    background: '#f8fafc',
                    borderRadius: 10,
                    padding: '12px 14px',
                    border: '1px dashed #cbd5e1',
                    marginBottom: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                    <div>
                      <span style={{ fontSize: 11, color: '#64748B', display: 'block', fontWeight: 600 }}>VOUCHER CODE</span>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#172033', letterSpacing: 1, fontFamily: 'monospace' }}>
                        {item.code}
                      </span>
                    </div>
                    <button
                      onClick={() => copyVoucherCode(item.code)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 6,
                        border: '1px solid #cbd5e1',
                        background: copiedCode === item.code ? '#dcfce7' : 'white',
                        color: copiedCode === item.code ? '#16a34a' : '#475569',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      {copiedCode === item.code ? <CheckCircle size={13} /> : <Copy size={13} />}
                      {copiedCode === item.code ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#64748B' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#16a34a', fontWeight: 600 }}>
                      <CheckCircle size={14} /> Active & Valid
                    </span>
                    <span>Cost: {item.rewardInfo?.points} pts</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: How to Earn Points */}
      {activeTab === 'how-to-earn' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {[
            {
              icon: '🩸',
              title: 'Donate Blood',
              points: '+100 Points',
              desc: 'Donate blood at any registered camp or in response to a BloodBridge receiver request.',
              extra: 'Verified via hospital/camp confirmation',
            },
            {
              icon: '⚡',
              title: 'Critical Emergency Donation',
              points: '+150 Points',
              desc: 'Respond to urgent and critical requests within 2 hours to help trauma and surgery patients.',
              extra: 'Bonus 50 points on top of standard donation',
            },
            {
              icon: '🎯',
              title: 'Donation Milestones',
              points: '+50 to +200 Points',
              desc: 'Reach lifetime donation milestones: 5 donations (+50 pts), 10 donations (+100 pts), 25 donations (+200 pts).',
              extra: 'Unlocks exclusive level badges',
            },
            {
              icon: '👤',
              title: 'Complete Profile & Health Card',
              points: '+20 Points',
              desc: 'Add your blood group, verified phone number, location, and past donation history.',
              extra: 'One-time onboarding bonus',
            },
            {
              icon: '📢',
              title: 'Community Awareness',
              points: '+30 Points',
              desc: 'Share verified blood requests to social channels to recruit more donors to active cases.',
              extra: 'Helps find rare negative blood groups fast',
            },
            {
              icon: '🌟',
              title: 'High Reliability Rating',
              points: '+25 Points',
              desc: 'Maintain a 100% response rate on emergency requests accepted through the portal.',
              extra: 'Monthly recurring booster',
            },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: 16,
                border: '1px solid #e2e8f0',
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{card.icon}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#172033', margin: 0 }}>{card.title}</h3>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#D62839' }}>{card.points}</span>
              </div>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: 12 }}>
                {card.desc}
              </p>
              <div style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                ℹ️ {card.extra}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 20, maxWidth: 440, width: '100%',
            padding: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>{confirmModal.icon}</div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#172033', marginBottom: 8 }}>
              Confirm Redemption
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.5, marginBottom: 20 }}>
              Are you sure you want to redeem <strong>{confirmModal.title}</strong> for <strong style={{ color: '#D62839' }}>{confirmModal.points} points</strong>?
            </p>
            <div style={{ background: '#f8fafc', borderRadius: 12, padding: 14, marginBottom: 24, fontSize: 13, color: '#475569', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>Current Balance:</span>
                <strong>{points} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, color: '#D62839' }}>
                <span>Points to Deduct:</span>
                <strong>-{confirmModal.points} pts</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: 6, fontWeight: 700 }}>
                <span>Remaining Balance:</span>
                <strong>{points - confirmModal.points} pts</strong>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setConfirmModal(null)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid #cbd5e1',
                  background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={executeRedeem}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #D62839, #b91c1c)', color: 'white', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Yes, Redeem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successVoucher && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20,
        }}>
          <div style={{
            background: 'white', borderRadius: 20, maxWidth: 460, width: '100%',
            padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%', background: '#dcfce7',
              color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <CheckCircle size={32} />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: '#172033', marginBottom: 6 }}>
              Congratulations!
            </h3>
            <p style={{ fontSize: 14, color: '#64748B', marginBottom: 20 }}>
              You redeemed <strong>{successVoucher.reward.title}</strong>. Your voucher code is ready:
            </p>

            <div style={{
              background: '#f8fafc', borderRadius: 12, padding: 16, border: '2px dashed #D62839',
              marginBottom: 20,
            }}>
              <span style={{ fontSize: 11, color: '#64748B', display: 'block', fontWeight: 700, marginBottom: 4 }}>
                REDEEM CODE
              </span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#D62839', letterSpacing: 2, fontFamily: 'monospace' }}>
                {successVoucher.code}
              </span>
            </div>

            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.5, marginBottom: 24 }}>
              Present this code at participating partner outlets or enter it on checkout. You can also view this anytime under "My Redeemed".
            </p>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => copyVoucherCode(successVoucher.code)}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10, border: '1px solid #cbd5e1',
                  background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}
              >
                <Copy size={14} /> Copy Code
              </button>
              <button
                onClick={() => { setSuccessVoucher(null); setActiveTab('my-rewards'); }}
                style={{
                  flex: 1, padding: '10px 16px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #D62839, #b91c1c)', color: 'white', fontWeight: 700, cursor: 'pointer',
                }}
              >
                View My Rewards
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
