import React, { useState, useEffect, useMemo } from 'react';
import * as ReactDOM from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, addDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Building2, LayoutDashboard, Users, Download, Printer, X, Edit3, CheckCircle2, Calendar, Clock, Phone, Info, Tag, ClipboardList, Save, Banknote, FileText, Unlock, Lock, Loader2, MapPin, Trash2, Cloud, CreditCard, Copy, Wrench, LogOut, UserCheck } from 'lucide-react';

const ACCESS_PIN = "933979"; 
const firebaseConfig = {
  apiKey: "AIzaSyASTtm9rgugCwKhcRC27j5ugJHFWbhM_8k",
  authDomain: "chalitsorn-s-workspace.firebaseapp.com",
  projectId: "chalitsorn-s-workspace",
  storageBucket: "chalitsorn-s-workspace.firebasestorage.app",
  messagingSenderId: "823661781920",
  appId: "1:823661781920:web:c92e026e81478b4ff63ac5",
  measurementId: "G-MNDRJYD1MD"
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const appId = 'apartcloud-pro-chalitsorn';

const STATUS_CONFIG = {
  available: { label: 'พร้อมขาย', color: 'bg-emerald-500', icon: <CheckCircle2 className="w-4 h-4" /> },
  maintenance: { label: 'รอซ่อมบำรุง', color: 'bg-orange-600', icon: <Wrench className="w-4 h-4" /> },
  appointment: { label: 'นัดดูห้อง', color: 'bg-sky-400', icon: <Clock className="w-4 h-4" /> },
  booked: { label: 'จองแล้ว', color: 'bg-rose-500', icon: <Tag className="w-4 h-4" /> },
  notice: { label: 'แจ้งออก', color: 'bg-amber-500', icon: <LogOut className="w-4 h-4" /> },
  occupied: { label: 'มีผู้เช่า', color: 'bg-blue-600', icon: <UserCheck className="w-4 h-4" /> },
};

const PROPERTIES = [
  { id: 'mangmee', name: 'บ้านมั่งมีทวีสุข', bankInfo: "ธนาคารกสิกรไทย 051-1-88802-6 นายชวนันท์ สุขพรชัยรัก", floors: [{ level: 6, price: "5,900", rooms: Array.from({ length: 18 }, (_, i) => `6${String(i + 1).padStart(2, '0')}`) }, { level: 5, price: "5,900", rooms: Array.from({ length: 18 }, (_, i) => `5${String(i + 1).padStart(2, '0')}`) }, { level: 4, price: "5,500", rooms: Array.from({ length: 18 }, (_, i) => `4${String(i + 1).padStart(2, '0')}`) }, { level: 3, price: "5,500", rooms: Array.from({ length: 18 }, (_, i) => `3${String(i + 1).padStart(2, '0')}`) }, { level: 2, price: "5,000", rooms: Array.from({ length: 18 }, (_, i) => `2${String(i + 1).padStart(2, '0')}`) }] },
  { id: 'mytree', name: 'บ้านมายทรี 48', bankInfo: "ธนาคารไทยพาณิชย์ 039-232971-2 บริษัท มายทรี 48 จำกัด", floors: [{ level: 5, price: "4,500", rooms: ['501', '502', '503', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515'] }, { level: 4, price: "4,500", rooms: ['401', '402', '403', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415'] }, { level: 3, price: "4,500", rooms: ['301', '302', '303', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315'] }, { level: 2, price: "4,500", rooms: ['201', '202', '203', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215'] }, { level: 1, price: "4,000", rooms: Array.from({ length: 11 }, (_, i) => `1${String(i + 1).padStart(2, '0')}`) }] },
  { id: 'khunluang', name: 'บ้านคุณหลวง', bankInfo: "ธนาคารออมสิน 020-2-2690349-8 นายชวนันท์ สุขพรชัยรัก", floors: [{ level: 4, rooms: Array.from({ length: 6 }, (_, i) => `4/${i + 1}`), customPrices: { '4/1': '4,000', '4/2': '4,000', '4/3': '3,800', '4/4': '4,000', '4/5': '4,000', '4/6': '5,000' } }, { level: 3, rooms: Array.from({ length: 12 }, (_, i) => `3/${i + 1}`), customPrices: { '3/1': '3,800', '3/2': '3,800', '3/3': '3,800', '3/4': '3,800', '3/5': '3,800', '3/6': '3,500', '3/7': '3,800', '3/8': '3,800', '3/9': '3,800', '3/10': '3,800', '3/11': '3,800', '3/12': '3,800' } }, { level: 2, rooms: Array.from({ length: 12 }, (_, i) => `2/${i + 1}`), customPrices: { '2/10': '3,500', '2/1': '3,800', '2/2': '3,800', '2/3': '3,800', '2/4': '3,800', '2/5': '3,800', '2/6': '3,800', '2/7': '3,800', '2/8': '3,800', '2/9': '3,800', '2/11': '3,800', '2/12': '3,800' } }, { level: 1, rooms: Array.from({ length: 18 }, (_, i) => `1/${i + 1}`), customPrices: { '1/1': '4,500', '1/2': '4,500', '1/3': '4,500', '1/4': '4,500', '1/5': '4,500', '1/6': '4,500', '1/7': '4,500', '1/8': '4,500', '1/9': '4,500', '1/10': '4,500', '1/11': '4,500', '1/12': '4,200', '1/13': '4,800', '1/14': '4,800', '1/15': '4,800', '1/16': '4,800', '1/17': '4,800', '1/18': '4,800' } }] },
  { id: 'meesap', name: 'อพาร์ทเม้นท์มีทรัพย์', bankInfo: "ธนาคารอาคารสงเคราะห์ 206-1-10007-54-2 Chawanan Sukpornchairak", floors: Array.from({ length: 5 }, (_, i) => ({ level: 5 - i, price: "4,800", rooms: Array.from({ length: 6 }, (_, j) => `${5 - i}.${j + 1}`) })) },
  { id: 'meethong', name: 'อพาร์ทเม้นท์มีทอง', bankInfo: "บัญชีธนาคารกรุงไทย 017-046047-9 บริษัท ม.ทวีทอง จำกัด", floors: Array.from({ length: 5 }, (_, i) => { const lv = 5 - i; return { level: lv, price: "4,500", rooms: lv === 1 ? Array.from({ length: 11 }, (_, j) => `${102 + j}`) : Array.from({ length: 13 }, (_, j) => `${lv}${String(j + 1).padStart(2, '0')}`) }; }) }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [activePropertyId, setActivePropertyId] = useState(() => localStorage.getItem('apt_last_property') || PROPERTIES[0].id);
  const [roomStates, setRoomStates] = useState({});
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);
  const [view, setView] = useState(() => localStorage.getItem('apt_last_view') || 'dashboard');
  const [isSaving, setIsSaving] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => localStorage.getItem('apt_unlocked') === 'true');
  const [pinInput, setPinInput] = useState("");

  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error(err));
    onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user || !isUnlocked) return;
    const unsubRooms = onSnapshot(collection(db, 'apartments', appId, 'rooms'), (snapshot) => {
      const data = {}; snapshot.forEach(doc => { data[doc.id] = doc.data(); });
      setRoomStates(data);
    });
    const unsubLogs = onSnapshot(collection(db, 'apartments', appId, 'logs'), (snapshot) => {
      const logs = []; snapshot.forEach(doc => { logs.push({ id: doc.id, ...doc.data() }); });
      setVisitorLogs(logs.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    });
    return () => { unsubRooms(); unsubLogs(); };
  }, [user, isUnlocked]);

  const activeProperty = PROPERTIES.find(p => p.id === activePropertyId);
  const statusSummary = useMemo(() => {
    const summary = { available: [], maintenance: [], appointment: [], booked: [], notice: [], occupied: [] };
    Object.entries(roomStates).forEach(([key, info]) => {
      const [pId, rNo] = key.split('_');
      if (summary[info.status]) {
        summary[info.status].push({ ...info, roomNo: rNo, propertyName: PROPERTIES.find(p => p.id === pId)?.name || 'N/A' });
      }
    });
    return summary;
  }, [roomStates]);

  const handleUpdate = async (e) => {
    e.preventDefault(); setIsSaving(true);
    const formData = new FormData(e.target);
    const docId = `${activePropertyId}_${selectedRoom}`;
    const data = {
      status: tempStatus,
      price: formData.get('customPrice') || "",
      lastVisitor: formData.get('visitorName') || "",
      lastPhone: formData.get('visitorPhone') || "",
      date: formData.get('actionDate') || "",
      time: formData.get('actionTime') || "",
      repairNote: formData.get('repairNote') || "",
      refund: formData.get('refund') || "",
      updatedAt: Date.now()
    };
    try {
      await setDoc(doc(db, 'apartments', appId, 'rooms', docId), data, { merge: true });
      if (data.lastVisitor || data.repairNote) {
        await addDoc(collection(db, 'apartments', appId, 'logs'), {
          name: data.lastVisitor || "ระบบ",
          roomNo: selectedRoom,
          propertyName: activeProperty.name,
          statusLabel: STATUS_CONFIG[tempStatus].label,
          phone: data.lastPhone || "-",
          createdAt: Date.now()
        });
      }
      setSelectedRoom(null);
    } catch (err) { console.error(err); } finally { setIsSaving(false); }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <form onSubmit={(e) => { e.preventDefault(); if(pinInput === ACCESS_PIN){ setIsUnlocked(true); localStorage.setItem('apt_unlocked','true'); } }} className="bg-white p-10 rounded-[3rem] text-center space-y-6">
          <Lock className="mx-auto w-12 h-12 text-indigo-600" />
          <h2 className="text-2xl font-black">ApartCloud PRO</h2>
          <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full p-4 bg-slate-100 rounded-2xl text-center text-2xl font-bold outline-none" placeholder="PIN" />
          <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold">UNLOCK</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Prompt']">
      <nav className="bg-white/80 backdrop-blur-md border-b p-4 sticky top-0 z-40 flex justify-between items-center no-print">
        <div className="font-black text-indigo-600 italic flex items-center gap-2"><Building2/> ApartCloud PRO</div>
        <div className="flex gap-2 font-bold text-xs">
          <button onClick={() => setView('dashboard')} className={`px-4 py-2 rounded-xl ${view==='dashboard'?'bg-indigo-600 text-white':'text-slate-400'}`}>แดชบอร์ด</button>
          <button onClick={() => setView('summary')} className={`px-4 py-2 rounded-xl ${view==='summary'?'bg-indigo-600 text-white':'text-slate-400'}`}>สรุปรายการ</button>
          <button onClick={() => setView('history')} className={`px-4 py-2 rounded-xl ${view==='history'?'bg-indigo-600 text-white':'text-slate-400'}`}>ประวัติ</button>
          <button onClick={() => { setIsUnlocked(false); localStorage.removeItem('apt_unlocked'); }} className="p-2 text-slate-300"><Unlock className="w-4 h-4"/></button>
        </div>
      </nav>

      <main className="p-4 max-w-7xl mx-auto space-y-8">
        {view === 'dashboard' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 no-print">
              {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                <div key={k} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                  <div className={`w-8 h-8 rounded-xl ${v.color} flex items-center justify-center text-white mb-2`}>{v.icon}</div>
                  <p className="text-[10px] text-slate-400 font-black uppercase">{v.label}</p>
                  <p className="text-2xl font-black">{statusSummary[k]?.length || 0}</p>
                </div>
              ))}
            </div>
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar no-print">
              {PROPERTIES.map(p => (
                <button key={p.id} onClick={() => setActivePropertyId(p.id)} className={`px-6 py-2 rounded-2xl border-2 font-black whitespace-nowrap transition-all ${activePropertyId === p.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-100'}`}>{p.name}</button>
              ))}
            </div>
            {activeProperty.floors.map(floor => (
              <div key={floor.level} className="space-y-4">
                <h3 className="font-black text-slate-400 text-sm">ชั้น {floor.level}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-3">
                  {floor.rooms.map(roomNo => {
                    const info = roomStates[`${activePropertyId}_${roomNo}`] || { status: 'available' };
                    const price = info.price || (floor.customPrices ? floor.customPrices[roomNo] : floor.price);
                    return (
                      <button key={roomNo} onClick={() => { setSelectedRoom(roomNo); setTempStatus(info.status); }} className={`p-4 rounded-[2rem] font-black text-center shadow-sm border-b-4 border-black/10 transition-all hover:scale-105 ${STATUS_CONFIG[info.status].color} ${STATUS_CONFIG[info.status].text}`}>
                        <div className="text-xl leading-none mb-1">{roomNo}</div>
                        <div className="text-[9px] font-bold py-0.5 px-2 rounded-full bg-black/10 inline-block">฿{price}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : view === 'summary' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['booked', 'appointment'].map(st => (
              <div key={st} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
                <h4 className={`font-black uppercase mb-6 flex items-center gap-2 ${st==='booked'?'text-rose-500':'text-sky-500'}`}>{STATUS_CONFIG[st].icon} {STATUS_CONFIG[st].label}</h4>
                <div className="space-y-4">
                  {statusSummary[st].length === 0 ? <p className="text-slate-300 italic text-sm">ไม่มีรายการ</p> : statusSummary[st].map((item, i) => (
                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div><p className="font-black text-lg">{item.roomNo}</p><p className="text-[10px] text-slate-400 uppercase font-black">{item.propertyName}</p></div>
                      <div className="text-right"><p className="font-black text-sm">{item.lastVisitor || '-'}</p><p className="text-indigo-600 font-black text-xs">{item.lastPhone}</p><p className="text-[10px] text-slate-400 mt-1 font-bold">{item.date} {item.time}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-8 space-y-2">
            {visitorLogs.map(log => (
              <div key={log.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center font-bold border border-slate-100">
                <div><p className="text-slate-800">{log.roomNo} - {log.name}</p><p className="text-[10px] text-slate-400 uppercase font-black">{log.propertyName} • {log.statusLabel}</p></div>
                <button onClick={() => deleteDoc(doc(db, 'apartments', appId, 'logs', log.id))} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 no-print">
          <form onSubmit={handleUpdate} className="bg-white rounded-[3rem] w-full max-w-lg p-8 space-y-6 overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center">
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activeProperty.name}</p><h3 className="text-3xl font-black italic tracking-tighter leading-none">Room {selectedRoom}</h3></div>
              <button type="button" onClick={() => setSelectedRoom(null)}><X/></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                <button type="button" key={k} onClick={() => setTempStatus(k)} className={`p-3 rounded-2xl border-2 text-[9px] font-black uppercase flex flex-col items-center gap-1 transition-all ${tempStatus===k?'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md':'border-slate-50 text-slate-300 hover:border-slate-200'}`}>{v.icon}{v.label}</button>
              ))}
            </div>
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-4">
              {tempStatus !== 'notice' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2">ราคาพิเศษ</label>
                  <input name="customPrice" placeholder="ระบุราคา..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.price || ""} className="w-full p-4 rounded-2xl outline-none font-bold" />
                </div>
              )}
              {tempStatus === 'maintenance' && (
                <>
                  <textarea name="repairNote" placeholder="รายละเอียดการซ่อม..." className="w-full p-4 rounded-2xl font-bold h-24" />
                  <input type="date" name="actionDate" className="w-full p-4 rounded-2xl font-bold" />
                </>
              )}
              {(tempStatus === 'appointment' || tempStatus === 'booked' || tempStatus === 'occupied') && (
                <>
                  <input name="visitorName" placeholder="ชื่อลูกค้า..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.lastVisitor || ""} className="w-full p-4 rounded-2xl font-bold" />
                  <input name="visitorPhone" placeholder="เบอร์โทร..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.lastPhone || ""} className="w-full p-4 rounded-2xl font-bold" />
                  {tempStatus !== 'occupied' && (
                    <div className="grid grid-cols-2 gap-2">
                      <input type="date" name="actionDate" className="p-4 rounded-2xl font-bold" />
                      <input name="actionTime" placeholder="เวลา (ระบุเอง)" className="p-4 rounded-2xl font-bold" />
                    </div>
                  )}
                  {(tempStatus === 'appointment' || tempStatus === 'booked') && (
                    <div className="bg-indigo-600 p-4 rounded-2xl text-white space-y-2">
                      <p className="text-[9px] font-black uppercase opacity-70">บัญชีโอนจอง</p>
                      <p className="text-xs font-bold leading-relaxed">{activeProperty.bankInfo}</p>
                      <button type="button" onClick={() => navigator.clipboard.writeText(activeProperty.bankInfo)} className="text-[9px] bg-white/20 px-2 py-1 rounded-lg w-full font-black">COPY</button>
                    </div>
                  )}
                </>
              )}
              {tempStatus === 'notice' && (
                <>
                  <input name="refund" placeholder="ยอดคืนเงินประกัน..." className="w-full p-4 rounded-2xl font-bold text-rose-500" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" name="actionDate" className="p-4 rounded-2xl font-bold" />
                    <input name="actionTime" placeholder="เวลาออก" className="p-4 rounded-2xl font-bold" />
                  </div>
                </>
              )}
            </div>
            <button disabled={isSaving} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl shadow-2xl">
              {isSaving ? <Loader2 className="animate-spin mx-auto"/> : "UPDATE CLOUD"}
            </button>
          </form>
        </div>
      )}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;700;900&display=swap'); body { -webkit-font-smoothing: antialiased; } .no-scrollbar::-webkit-scrollbar { display: none; } @media print { .no-print { display: none !important; } }`}</style>
    </div>
  );
}

// --- ชุดคำสั่ง Render ---
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(<App />);
}