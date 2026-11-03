import { useState } from 'react';
import { CheckCircle, MapPin, Award, ArrowRight } from 'lucide-react';
import { VolunteerCourierIcon } from '../components/common/CustomIcons';
import { useAuth } from '../context/AuthContext';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('open'); // 'open' | 'my_missions'
  const [toastMessage, setToastMessage] = useState(null);

  const [tasks, setTasks] = useState([
    {
      id: 'task-01',
      title: 'Emergency Platelet Courier Run: Red Cross -> Manipal Whitefield',
      task_type: 'blood_courier',
      urgency: 'emergency',
      pickup_location: 'Indian Red Cross Blood Centre, Race Course Road',
      pickup_locality: 'Bengaluru Central',
      dropoff_location: 'Manipal Hospital ICU, Whitefield',
      dropoff_locality: 'Whitefield',
      contact_person: 'Dr. Sunita Rao (Duty Officer)',
      contact_phone: '+91 80 2502 9111',
      notes: 'Handle insulated cold-chain box with care. Maintain vertical orientation.',
      status: 'open',
      claimed_at: null,
      created_at: '2026-11-03 18:30'
    },
    {
      id: 'task-02',
      title: 'Cross-Match Blood Sample Pickup: Apollo BG Road -> Victoria Blood Centre',
      task_type: 'sample_pickup',
      urgency: 'high',
      pickup_location: 'Apollo Hospital Emergency Lab, Bannerghatta Road',
      pickup_locality: 'Jayanagar',
      dropoff_location: 'Victoria Hospital Immunohematology Lab',
      dropoff_locality: 'K.R. Road',
      contact_person: 'Technician Naveen',
      contact_phone: '+91 80 2630 4050',
      notes: 'Urgent recipient pre-transfusion EDTA sample tubes.',
      status: 'open',
      claimed_at: null,
      created_at: '2026-11-03 17:45'
    },
    {
      id: 'task-03',
      title: 'Pediatric Thalassemia Patient Hospital Escort',
      task_type: 'patient_escort',
      urgency: 'routine',
      pickup_location: 'Indiranagar Metro Station Exit B',
      pickup_locality: 'Indiranagar',
      dropoff_location: 'Manipal Hospital Daycare Transfusion Wing',
      dropoff_locality: 'Whitefield',
      contact_person: 'Priya Varma (Parent)',
      contact_phone: '+91 98765 43215',
      notes: 'Assistance for 11-year-old child attending recurring transfusion cycle.',
      status: 'claimed',
      claimed_at: '2026-11-03 16:00',
      created_at: '2026-11-03 15:30'
    }
  ]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClaimTask = (taskId) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: 'claimed', claimed_at: 'Just now' };
      }
      return t;
    }));
    showToast('Mission accepted! Navigation instructions and contact desk unlocked.');
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks(tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
    showToast(newStatus === 'completed'
      ? 'Mission completed! Clinical handoff verified. Impact score updated.'
      : 'Mission status updated to In-Transit.'
    );
  };

  const openTasks = tasks.filter(t => t.status === 'open');
  const myTasks = tasks.filter(t => t.status === 'claimed' || t.status === 'in_transit' || t.status === 'completed');

  return (
    <div style={{ background: '#f8fafc', minHeight: '90vh', padding: '32px 20px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Toast */}
        {toastMessage && (
          <div style={{
            position: 'fixed', top: 80, right: 24, zIndex: 1000,
            background: '#1e293b', color: 'white', padding: '14px 20px', borderRadius: 10,
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 10,
            fontSize: 14, fontWeight: 500, borderLeft: '4px solid #10b981'
          }}>
            <CheckCircle size={18} color="#10b981" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '28px 32px',
          border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 20,
          marginBottom: 24
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <div style={{
                background: '#fef3c7', color: '#b45309', padding: '6px 12px', borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700
              }}>
                <VolunteerCourierIcon size={16} color="#b45309" />
                <span>Volunteer Rapid Field Responder</span>
              </div>
              <span style={{ fontSize: 12, background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                Verified Life-Saver
              </span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {user?.name || 'Sanjay Hegde'}
            </h1>
            <p style={{ color: '#64748b', fontSize: 14, margin: '4px 0 0' }}>
              Malleshwaram Central Response Zone • Emergency Rapid Transit Network
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748b' }}>Hero Rank</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#b45309', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Award size={20} />
              <span>Silver Volunteer Responder</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Completed Missions</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>7</div>
            <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>100% On-time delivery rate</div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Emergency Runs</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#b91c1c', marginTop: 4 }}>4</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>Critical ICU platelet deliveries</div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Hours Volunteered</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>10.5 hrs</div>
            <div style={{ fontSize: 12, color: '#2563eb', marginTop: 4 }}>Estimated 14 lives impacted</div>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Active Missions in City</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginTop: 4 }}>
              {openTasks.length} <span style={{ fontSize: 14, fontWeight: 500, color: '#64748b' }}>open</span>
            </div>
            <div style={{ fontSize: 12, color: '#d97706', marginTop: 4 }}>Requires community support</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
          <button
            onClick={() => setActiveTab('open')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'open' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'open' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            Available Rescue Missions ({openTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('my_missions')}
            style={{
              padding: '12px 20px', background: 'none', border: 'none',
              borderBottom: activeTab === 'my_missions' ? '3px solid #D62839' : '3px solid transparent',
              fontWeight: 700, fontSize: 14, color: activeTab === 'my_missions' ? '#D62839' : '#64748b',
              cursor: 'pointer'
            }}
          >
            My Active Missions ({myTasks.length})
          </button>
        </div>

        {/* TAB 1: OPEN MISSIONS */}
        {activeTab === 'open' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {openTasks.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 12, padding: '48px 24px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <CheckCircle size={36} color="#16a34a" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>All Missions Currently Assigned</h3>
                <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Thank you! No open emergency transport tasks pending right now.</p>
              </div>
            ) : (
              openTasks.map(task => {
                const isEmergency = task.urgency === 'emergency';

                return (
                  <div
                    key={task.id}
                    style={{
                      background: isEmergency ? '#fff5f5' : 'white',
                      borderRadius: 12, padding: '24px',
                      border: isEmergency ? '2px solid #ef4444' : '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 14 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{task.title}</span>
                          {isEmergency ? (
                            <span style={{ fontSize: 11, background: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: 4, fontWeight: 800 }}>
                              EMERGENCY
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 4, fontWeight: 700 }}>
                              HIGH PRIORITY
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>
                          Posted: {task.created_at} • Mission Type: <strong style={{ textTransform: 'capitalize' }}>{task.task_type.replace('_', ' ')}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaimTask(task.id)}
                        style={{
                          background: isEmergency ? '#ef4444' : '#D62839',
                          color: 'white', border: 'none', borderRadius: 8,
                          padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                          boxShadow: '0 2px 6px rgba(214,40,57,0.3)', display: 'flex', alignItems: 'center', gap: 6
                        }}
                      >
                        Accept Mission <ArrowRight size={16} />
                      </button>
                    </div>

                    {/* Route Box */}
                    <div style={{ background: '#f8fafc', padding: '16px', borderRadius: 10, marginBottom: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                          Pickup Point
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={16} color="#2563eb" /> {task.pickup_location}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginLeft: 22 }}>Zone: {task.pickup_locality}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 2 }}>
                          Delivery Destination
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <MapPin size={16} color="#16a34a" /> {task.dropoff_location}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748b', marginLeft: 22 }}>Zone: {task.dropoff_locality}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: 13, color: '#334155' }}>
                      <strong>Transit Protocol:</strong> {task.notes}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 2: MY MISSIONS */}
        {activeTab === 'my_missions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {myTasks.map(task => (
              <div key={task.id} style={{ background: 'white', borderRadius: 12, padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>{task.title}</h3>
                    <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                      Accepted: {task.claimed_at} • Status: <strong style={{ color: task.status === 'completed' ? '#16a34a' : '#2563eb', textTransform: 'uppercase' }}>{task.status.replace('_', ' ')}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10 }}>
                    {task.status === 'claimed' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'in_transit')}
                        style={{
                          background: '#2563eb', color: 'white', border: 'none', borderRadius: 6,
                          padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Start Transit
                      </button>
                    )}
                    {task.status === 'in_transit' && (
                      <button
                        onClick={() => handleUpdateStatus(task.id, 'completed')}
                        style={{
                          background: '#16a34a', color: 'white', border: 'none', borderRadius: 6,
                          padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                      >
                        Confirm Delivery Handoff
                      </button>
                    )}
                    {task.status === 'completed' && (
                      <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CheckCircle size={16} /> Mission Fulfilled
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, fontSize: 13, color: '#334155', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <strong>Contact Desk:</strong> {task.contact_person} • <a href={`tel:${task.contact_phone}`} style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>{task.contact_phone}</a>
                  </div>
                  <div>
                    <strong>Notes:</strong> {task.notes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
