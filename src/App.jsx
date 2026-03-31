import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, addDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { Building2, X, CheckCircle2, Clock, Tag, ClipboardList, Lock, Unlock, Trash2, Wrench, LogOut, UserCheck, CreditCard, Calendar, ClipboardCheck, Calculator } from 'lucide-react';

// --- Firebase Config ---
const ACCESS_PIN = "933979"; 
const firebaseConfig = {
  apiKey: "AIzaSyASTtm9rgugCwKhcRC27j5ugJHFWbhM_8k",
  authDomain: "chalitsorn-s-workspace.firebaseapp.com",
  projectId: "chalitsorn-s-workspace",
  storageBucket: "chalitsorn-s-workspace.firebasestorage.app",
  messagingSenderId: "823661781920",
  appId: "1:823661781920:web:c92e026e81478b4ff63ac5",
};

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const appId = 'apartcloud-pro-chalitsorn';

const STATUS_CONFIG = {
  available: { label: 'พร้อมขาย', color: 'bg-emerald-500', icon: <CheckCircle2 size={16} /> },
  maintenance: { label: 'รอซ่อมบำรุง', color: 'bg-orange-600', icon: <Wrench size={16} /> },
  appointment: { label: 'นัดดูห้อง', color: 'bg-sky-400', icon: <Clock size={16} /> },
  booked: { label: 'จองแล้ว', color: 'bg-rose-500', icon: <Tag size={16} /> },
  notice: { label: 'แจ้งออก', color: 'bg-amber-500', icon: <LogOut size={16} /> },
  occupied: { label: 'มีผู้เช่า', color: 'bg-blue-600', icon: <UserCheck size={16} /> },
};

const PROPERTIES = [
  { id: 'mangmee', name: 'บ้านมั่งมีทวีสุข', bankInfo: "กสิกรไทย 051-1-88802-6 นายชวนันท์ สุขพรชัยรัก", floors: [{ level: 6, price: "5,900", rooms: Array.from({ length: 18 }, (_, i) => `6${String(i + 1).padStart(2, '0')}`) }, { level: 5, price: "5,900", rooms: Array.from({ length: 18 }, (_, i) => `5${String(i + 1).padStart(2, '0')}`) }, { level: 4, price: "5,500", rooms: Array.from({ length: 18 }, (_, i) => `4${String(i + 1).padStart(2, '0')}`) }, { level: 3, price: "5,500", rooms: Array.from({ length: 18 }, (_, i) => `3${String(i + 1).padStart(2, '0')}`) }, { level: 2, price: "5,000", rooms: Array.from({ length: 18 }, (_, i) => `2${String(i + 1).padStart(2, '0')}`) }] },
  { id: 'mytree', name: 'บ้านมายทรี 48', bankInfo: "ไทยพาณิชย์ 039-232971-2 บริษัท มายทรี 48 จำกัด", floors: [{ level: 5, price: "4,500", rooms: ['501', '502', '503', '505', '506', '507', '508', '509', '510', '511', '512', '513', '514', '515'] }, { level: 4, price: "4,500", rooms: ['401', '402', '403', '405', '406', '407', '408', '409', '410', '411', '412', '413', '414', '415'] }, { level: 3, price: "4,500", rooms: ['301', '302', '303', '305', '306', '307', '308', '309', '310', '311', '312', '313', '314', '315'] }, { level: 2, price: "4,500", rooms: ['201', '202', '203', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215'] }, { level: 1, price: "4,000", rooms: Array.from({ length: 11 }, (_, i) => `1${String(i + 1).padStart(2, '0')}`) }] },
  { id: 'khunluang', name: 'บ้านคุณหลวง', bankInfo: "ออมสิน 020-2-2690349-8 นายชวนันท์ สุขพรชัยรัก", floors: [{ level: 4, price: "4,000", rooms: Array.from({ length: 6 }, (_, i) => `4/${i + 1}`), customPrices: { '4/6': '5,000' } }, { level: 3, price: "3,800", rooms: Array.from({ length: 12 }, (_, i) => `3/${i + 1}`), customPrices: { '3/6': '3,500' } }, { level: 2, price: "3,800", rooms: Array.from({ length: 12 }, (_, i) => `2/${i + 1}`), customPrices: { '2/10': '3,500' } }, { level: 1, price: "4,500", rooms: Array.from({ length: 18 }, (_, i) => `1/${i + 1}`), customPrices: { '1/12': '4,200' } }] },
  { id: 'meesap', name: 'อพาร์ทเม้นท์มีทรัพย์', bankInfo: "ธอส. 206-1-10007-54-2 Chawanan Sukpornchairak", floors: Array.from({ length: 5 }, (_, i) => ({ level: 5 - i, price: "4,800", rooms: Array.from({ length: 6 }, (_, j) => `${5 - i}.${j + 1}`) })) },
  { id: 'meethong', name: 'อพาร์ทเม้นท์มีทอง', bankInfo: "กรุงไทย 017-046047-9 บริษัท ม.ทวีทอง จำกัด", floors: Array.from({ length: 5 }, (_, i) => { const lv = 5 - i; return { level: lv, price: "4,500", rooms: lv === 1 ? Array.from({ length: 11 }, (_, j) => `${102 + j}`) : Array.from({ length: 13 }, (_, j) => `${lv}${String(j + 1).padStart(2, '0')}`) }; }) }
];

const QC_CATEGORIES = [
  { id: 'door', label: '1. หมวดประตู-หน้าต่าง', items: ['กลอนและกุญแจ', 'บานพับ', 'หน้าต่าง (ฉีดน้ำเช็คซึม)', 'ช่องว่างขอบแนบสนิท'] },
  { id: 'elec', label: '2. หมวดระบบไฟฟ้า', items: ['แสงสว่าง (ไม่กระพริบ)', 'เต้ารับ (ปลั๊กไฟ)', 'แอร์ (เย็นฉ่ำ/น้ำไม่หยด)', 'ตู้ไฟ/เบรกเกอร์ (มีป้ายบอก)'] },
  { id: 'wall', label: '3. หมวดพื้นและผนัง', items: ['เคาะกระเบื้อง (ไม่กลวง)', 'ความลาดเอียง (น้ำไม่ขัง)', 'ยาแนวร่องเต็ม', 'ผนังเรียบ (ไม่ร้าว)', 'สีสม่ำเสมอ'] },
  { id: 'furn', label: '4. หมวดเฟอร์นิเจอร์', items: ['หน้าบาน/ลิ้นชักลื่น', 'บานพับ/มือจับแน่น', 'เตียง (ไม่ดัง/ไม่มีคม)', 'โต๊ะเก้าอี้ (ไม่กระดก)', 'ม่าน (ไม่ขาด/รูดลื่น)', 'ฟูก (ไม่เปื้อน/ไม่ยุบ)'] },
  { id: 'plumb', label: '5. หมวดสุขาภิบาล', items: ['ชักโครก (ลงเร็ว/ไม่รั่ว)', 'ยาแนวสุขภัณฑ์สนิท', 'ก๊อก/ฝักบัวแรง', 'ท่อ (ไม่เหม็นย้อน)', 'ฝ้าเพดาน (ไม่ซึม)'] },
  { id: 'balcony', label: '6. หมวดระเบียง', items: ['ราวกันตกแน่น', 'ก๊อกซักล้าง (ระบายดี)'] }
];

export default function App() {
  const [user, setUser] = useState(null);
  const [isUnlocked, setIsUnlocked] = useState(false); 
  const [pinInput, setPinInput] = useState("");
  const [activePropertyId, setActivePropertyId] = useState(PROPERTIES[0].id);
  const [roomStates, setRoomStates] = useState({});
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [tempStatus, setTempStatus] = useState(null);
  const [view, setView] = useState('dashboard');
  const [deduction, setDeduction] = useState(0);

  useEffect(() => {
    // 1. ล็อกอินเงียบๆ เพื่อขอสิทธิ์
    signInAnonymously(auth).then(() => {
      
      // 2. ดึงข้อมูลสถานะห้อง (ตัวการที่ทำให้ข้อมูลไม่หาย)
      // ต้องมั่นใจว่า path ตรงกับ: apartments > apartcloud-pro-chalitsorn > rooms
      const unsubRooms = onSnapshot(collection(db, 'apartments', appId, 'rooms'), (snap) => {
        const data = {};
        snap.forEach(d => { 
          data[d.id] = d.data(); 
        });
        setRoomStates(data); // <--- บรรทัดนี้จะทำให้ข้อมูลที่เคยบันทึกไว้เด้งกลับมา
      });

      // 3. ดึงประวัติการบันทึก
      const unsubLogs = onSnapshot(collection(db, 'apartments', appId, 'logs'), (snap) => {
        const logs = [];
        snap.forEach(d => { logs.push({ id: d.id, ...d.data() }); });
        setVisitorLogs(logs.sort((a,b) => (b.createdAt || 0) - (a.createdAt || 0)));
      });

      return () => { unsubRooms(); unsubLogs(); };
    });
  }, []);

  const activeProperty = useMemo(() => PROPERTIES.find(p => p.id === activePropertyId), [activePropertyId]);

  const dashboardStats = useMemo(() => {
    const stats = { available: 0, maintenance: 0, appointment: 0, booked: 0, notice: 0, occupied: 0 };
    if (!activeProperty) return stats;
    activeProperty.floors.forEach(f => {
      f.rooms.forEach(r => {
        const info = roomStates[`${activePropertyId}_${r}`] || { status: 'available' };
        if (stats[info.status] !== undefined) stats[info.status]++;
      });
    });
    return stats;
  }, [roomStates, activePropertyId, activeProperty]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const docId = `${activePropertyId}_${selectedRoom}`;
    const timestamp = Date.now();
    
    const qcData = {};
    QC_CATEGORIES.forEach(cat => {
      cat.items.forEach(item => {
        qcData[`qc_${cat.id}_${item}`] = formData.get(`qc_${cat.id}_${item}`) === 'on';
      });
    });

    const data = {
      status: tempStatus,
      price: formData.get('price') || "",
      lastVisitor: formData.get('name') || "",
      lastPhone: formData.get('phone') || "",
      date: formData.get('date') || "",
      time: formData.get('time') || "",
      note: formData.get('note') || "",
      deposit: formData.get('deposit') || "",
      insurance: formData.get('insurance') || "",
      paymentOnMoveIn: formData.get('paymentOnMoveIn') || "",
      qcResults: qcData,
      updatedAt: timestamp
    };
    
    setSelectedRoom(null);
    setDeduction(0);
    await setDoc(doc(db, 'apartments', appId, 'rooms', docId), data, { merge: true });
    await addDoc(collection(db, 'apartments', appId, 'logs'), {
      ...data, roomNo: selectedRoom, propertyName: activeProperty.name, 
      statusLabel: STATUS_CONFIG[tempStatus].label, createdAt: timestamp
    });
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 text-center" style={{fontFamily: 'Prompt, sans-serif'}}>
        <form onSubmit={(e) => { e.preventDefault(); pinInput === ACCESS_PIN ? setIsUnlocked(true) : alert('PIN ผิด!'); }} className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm space-y-6">
          <Lock className="mx-auto text-indigo-600" size={48} />
          <h2 className="text-2xl font-black italic tracking-tighter leading-none">ApartCloud PRO</h2>
          <input type="password" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full p-4 bg-slate-100 rounded-2xl text-center text-4xl font-bold border-2 focus:border-indigo-500 outline-none" placeholder="PIN" autoFocus />
          <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black">UNLOCK</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-10 font-['Prompt'] text-slate-800" style={{fontFamily: 'Prompt, sans-serif'}}>
      <nav className="bg-white border-b p-4 sticky top-0 z-40 flex justify-between items-center shadow-sm no-print">
        <div className="font-black text-indigo-600 italic flex items-center gap-2"><Building2 size={20}/> ApartCloud PRO</div>
        <div className="flex gap-1 font-bold text-[9px]">
          {['dashboard', 'summary', 'history'].map(v => (
            <button key={v} onClick={() => setView(v)} className={`px-3 py-2 rounded-xl transition-all ${view === v ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'}`}>{v.toUpperCase()}</button>
          ))}
          <button onClick={() => setIsUnlocked(false)}><Unlock size={16}/></button>
        </div>
      </nav>

      <main className="p-4 max-w-7xl mx-auto space-y-6">
        {view === 'dashboard' ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                <div key={k} className="bg-white p-4 rounded-3xl border shadow-sm text-center">
                  <div className={`w-8 h-8 rounded-xl ${v.color} flex items-center justify-center text-white mb-2 mx-auto`}>{v.icon}</div>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{v.label}</p>
                  <p className="text-2xl font-black text-slate-800">{dashboardStats[k]}</p>
                </div>
              ))}
            </div>

            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
              {PROPERTIES.map(p => (
                <button key={p.id} onClick={() => setActivePropertyId(p.id)} className={`px-6 py-2 rounded-2xl border-2 font-black whitespace-nowrap transition-all ${activePropertyId === p.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-white text-slate-50 border-slate-100'}`}>{p.name}</button>
              ))}
            </div>

            {activeProperty?.floors.map(floor => (
              <div key={floor.level} className="space-y-4">
                <h3 className="font-black text-slate-400 text-xs uppercase pl-2 tracking-widest">ชั้น {floor.level}</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-9 gap-3">
                  {floor.rooms.map(roomNo => {
                    const info = roomStates[`${activePropertyId}_${roomNo}`] || { status: 'available' };
                    const displayPrice = info.price || floor.customPrices?.[roomNo] || floor.price;
                    return (
                      <button key={roomNo} onClick={() => { setSelectedRoom(roomNo); setTempStatus(info.status); }} className={`p-4 rounded-[1.8rem] font-black text-center shadow-sm border-b-4 border-black/10 transition-all active:scale-95 ${STATUS_CONFIG[info.status].color} text-white`}>
                        <div className="text-xl leading-none mb-1">{roomNo}</div>
                        <div className="text-[9px] font-bold py-0.5 px-2 rounded-full bg-black/10 inline-block">฿{displayPrice}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : view === 'summary' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
             {['booked', 'appointment', 'notice'].map(st => (
               <div key={st} className="bg-white rounded-[2rem] p-6 shadow-sm border">
                 <h4 className={`font-black uppercase text-xs mb-6 flex items-center gap-2 ${st==='booked'?'text-rose-500':st==='notice'?'text-amber-500':'text-sky-500'}`}>{STATUS_CONFIG[st].icon} {STATUS_CONFIG[st].label}</h4>
                 <div className="space-y-3">
                   {Object.entries(roomStates).filter(([_, val]) => val.status === st).map(([key, item]) => (
                     <div key={key} className="p-4 bg-slate-50 rounded-2xl border flex justify-between items-start text-xs">
                        <div>
                          <p className="font-black text-lg text-indigo-600">{key.split('_')[1]}</p>
                          <p className="font-bold text-slate-400 uppercase">{PROPERTIES.find(p => p.id === key.split('_')[0])?.name}</p>
                          {item.insurance && <p className="text-rose-500 font-black mt-2 underline">เงินประกัน: ฿{item.insurance}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-black text-slate-800">{item.lastVisitor || '-'}</p>
                          <p className="text-indigo-600 font-bold">{item.lastPhone}</p>
                          <p className="text-[9px] text-slate-400 mt-2 font-bold">{item.date} {item.time}</p>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-8 space-y-4 shadow-sm animate-in fade-in">
            <h2 className="text-xl font-black italic flex items-center gap-2 text-slate-800"><ClipboardList/> Activity Logs</h2>
            {visitorLogs.slice(0,50).map(log => (
              <div key={log.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center text-xs border border-slate-100">
                <div><p className="font-bold">{log.roomNo} - {log.name}</p><p className="text-[9px] text-slate-400 font-black uppercase">{log.propertyName} • {log.statusLabel}</p></div>
                <button onClick={() => deleteDoc(doc(db, 'apartments', appId, 'logs', log.id))} className="text-rose-400 p-2 hover:text-rose-600"><Trash2 size={16}/></button>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedRoom && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-4 no-print">
          <form onSubmit={handleUpdate} className="bg-white rounded-[3rem] w-full max-w-2xl p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[95vh] animate-in slide-in-from-bottom">
            <div className="flex justify-between items-center border-b pb-4">
              <div><h3 className="text-3xl font-black italic">Room {selectedRoom}</h3><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeProperty.name}</p></div>
              <button type="button" onClick={() => {setSelectedRoom(null); setDeduction(0);}}><X size={24}/></button>
            </div>
            
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {Object.entries(STATUS_CONFIG).map(([k,v]) => (
                <button type="button" key={k} onClick={() => setTempStatus(k)} className={`p-3 rounded-2xl border-2 text-[9px] font-black flex flex-col items-center gap-1 transition-all ${tempStatus===k?'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md':'border-slate-50 text-slate-300'}`}>{v.icon}{v.label}</button>
              ))}
            </div>

            <div className="bg-slate-50 p-6 rounded-[2rem] border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="price" placeholder="ตั้งราคาพิเศษ..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.price || ""} className="w-full p-4 rounded-xl font-bold border bg-white outline-none" />
                {(tempStatus !== 'available' && tempStatus !== 'maintenance') && (
                  <input name="name" placeholder="ชื่อลูกค้า/ผู้เช่า..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.lastVisitor || ""} className="w-full p-4 rounded-xl font-bold border bg-white outline-none" />
                )}
              </div>

              {tempStatus === 'maintenance' && (
                <>
                  <input type="date" name="date" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.date || ""} className="w-full p-4 rounded-xl font-bold border outline-none" />
                  <textarea name="note" placeholder="รายละเอียดการซ่อม..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.note || ""} className="w-full p-4 rounded-xl font-bold border outline-none h-24" />
                </>
              )}

              {(tempStatus === 'appointment' || tempStatus === 'booked' || tempStatus === 'notice') && (
                <>
                  <input name="phone" placeholder="เบอร์โทร..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.lastPhone || ""} className="w-full p-4 rounded-xl font-bold border bg-white outline-none" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" name="date" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.date || ""} className="p-4 rounded-xl font-bold border outline-none bg-white" />
                    <input name="time" placeholder="เวลา (พิมพ์เอง)..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.time || ""} className="p-4 rounded-xl font-bold border outline-none bg-white text-xs" />
                  </div>
                  {tempStatus === 'booked' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                       <div><p className="text-[9px] font-black uppercase text-indigo-400">เงินมัดจำ/จอง</p><input name="deposit" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.deposit || ""} className="w-full p-2 rounded-lg font-black border bg-white" /></div>
                       <div><p className="text-[9px] font-black uppercase text-indigo-400">เงินประกัน</p><input name="insurance" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.insurance || ""} className="w-full p-2 rounded-lg font-black border bg-white" /></div>
                       <div><p className="text-[9px] font-black uppercase text-indigo-400">ยอดวันเข้า</p><input name="paymentOnMoveIn" defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.paymentOnMoveIn || ""} className="w-full p-2 rounded-lg font-black border bg-white" /></div>
                    </div>
                  )}
                  {/* 🔥 แก้ไขจุดนี้: โชว์เลขบัญชีเสมอในสถานะนัดดูและจอง */}
                  <div className="bg-indigo-600 p-5 rounded-[1.8rem] text-white shadow-lg">
                    <p className="text-[10px] font-black opacity-70 uppercase mb-2 flex items-center gap-2"><CreditCard size={14}/> บัญชีสำหรับโอนจอง</p>
                    <p className="text-md font-black tracking-tight leading-tight">{activeProperty.bankInfo}</p>
                  </div>
                </>
              )}

              {tempStatus === 'notice' && (
                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-4">
                  <h4 className="font-black text-amber-700 flex items-center gap-2 italic"><Calculator size={18}/> ระบบคืนเงินประกัน</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-2xl border shadow-sm text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase">เงินประกัน</p>
                       <p className="text-xl font-black text-indigo-600">฿{roomStates[`${activePropertyId}_${selectedRoom}`]?.insurance || "0"}</p>
                    </div>
                    <div className="bg-white p-4 rounded-2xl border shadow-sm text-center">
                       <p className="text-[10px] font-black text-slate-400 uppercase">หักค่าเสียหาย</p>
                       <input type="number" onChange={(e) => setDeduction(Number(e.target.value))} placeholder="0" className="text-xl font-black text-rose-500 w-full outline-none text-center" />
                    </div>
                  </div>
                  <div className="bg-emerald-500 p-3 rounded-2xl text-white text-center shadow-lg">
                    <p className="text-[10px] font-black opacity-80 uppercase">ยอดคืนจริง</p>
                    <p className="text-2xl font-black">฿{(Number(roomStates[`${activePropertyId}_${selectedRoom}`]?.insurance || 0) - deduction).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {(tempStatus === 'booked' || tempStatus === 'notice') && (
                <div className="space-y-6 pt-4 border-t">
                  <div className="flex items-center gap-2 font-black text-slate-400 italic"><ClipboardCheck/> Checklist 6 หมวด</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {QC_CATEGORIES.map(cat => (
                      <div key={cat.id} className="bg-white p-4 rounded-3xl border shadow-sm space-y-2">
                        <h5 className="font-black text-[10px] text-indigo-600 uppercase border-b pb-1 mb-2">{cat.label}</h5>
                        {cat.items.map(item => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer group">
                             <input type="checkbox" name={`qc_${cat.id}_${item}`} defaultChecked={roomStates[`${activePropertyId}_${selectedRoom}`]?.qcResults?.[`qc_${cat.id}_${item}`]} className="w-4 h-4 rounded-md accent-indigo-600" />
                             <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600 transition-all">{item}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                  <textarea name="note" placeholder="ข้อเสนอแนะเพิ่มเติม..." defaultValue={roomStates[`${activePropertyId}_${selectedRoom}`]?.note || ""} className="w-full p-4 rounded-2xl border outline-none bg-white h-24 text-xs font-bold shadow-inner" />
                </div>
              )}
            </div>
            
            <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black text-xl shadow-xl active:scale-95 transition-all">UPDATE CLOUD</button>
          </form>
        </div>
      )}
    </div>
  );
}