import type { CSSProperties } from 'react';

export type Role = 'org' | 'staff' | 'mod' | 'student';
export type ReportStatus = 'Open' | 'Reviewed' | 'Dismissed';

// Mirrors the Postgres enum public.reaction_type, which the react endpoints accept.
export const REACTIONS = ['like', 'love', 'haha', 'sad', 'angry', 'care'] as const;
export type ReactionType = typeof REACTIONS[number];

/** Emoji + Thai label for each reaction, in picker order. */
export const REACTION_LOOK: Record<ReactionType, { icon: string; label: string }> = {
  like: { icon: '👍', label: 'ถูกใจ' },
  love: { icon: '❤️', label: 'รักเลย' },
  haha: { icon: '😄', label: 'ฮา' },
  sad: { icon: '😢', label: 'เศร้า' },
  angry: { icon: '😠', label: 'โกรธ' },
  care: { icon: '🤗', label: 'ห่วงใย' },
};

export interface Media { type: 'image' | 'video'; label: string }

export interface Post {
  id: string;
  important: boolean;
  name: string;
  time: string;
  initials: string;
  title: string;
  body: string;
  role: Role;
  cats: string[];
  likes: number;
  media?: Media[];
  notified?: number;
  reports?: number;
  edited?: string;

  // belows are out of scope for now.
  type?: 'announce' | 'question' | 'story' | 'market';
  priority?: 'urgent' | 'notice' | null;
  meta?: string;
  tint?: number;
}

export interface Reply { id: string; a: string; i: string; t: number; time: string; text: string; likes?: number }
export interface Comment extends Reply { r: Role; likes: number; replies: Reply[] }

export function updateCommentLikesById(
  comments: Record<string, Comment[]>,
  cid: string,
  like_count: number,
): Comment | Reply | undefined {
  for (const postComments of Object.values(comments)) {
    for (const comment of postComments) {
      if (comment.id === cid) {
        comment.likes = like_count;
        return comment;
      }

      const reply = comment.replies.find((item) => item.id === cid);
      if (reply) {
        reply.likes = like_count;
        return reply;
      }
    }
  }
  return undefined;
}

export const TINTS: [string, string][] = [
  ['#eadff7', '#3e2259'], ['#f8dde8', '#66324a'], ['#e1eecc', '#3d472b'],
  ['#dbe7f5', '#2c3f57'], ['#fbeccd', '#5c4718'], ['#f7ddd6', '#6b2f1c'],
];

// Category rows are seeded by the dev team only (CategoryName + Priority).
export const CATS: { id: any; name: string; pri: number; dot: string }[] = [
    { id: 1, name: 'ประกาศ / Announcements', pri: 1, dot: '#7d50a8' },
    { id: 2, name: 'คำถาม / Q&A', pri: 2, dot: '#cd7e9f' },
    { id: 3, name: 'ของหาย / Lost & Found', pri: 2, dot: '#c9603f' },
    { id: 4, name: 'หอพัก / Housing', pri: 3, dot: '#5f8f5a' },
    { id: 5, name: 'เรียน / Academics', pri: 3, dot: '#3f7ea8' },
    { id: 6, name: 'งาน/ทุน / Careers', pri: 3, dot: '#c9913f' },
    { id: 7, name: 'ซื้อขาย / Marketplace', pri: 4, dot: '#9b73c4' },
    { id: 8, name: 'ชีวิตในมอ / Campus life', pri: 5, dot: '#a2988f' },
];

export const REASONS = [
  'ข้อมูลเท็จ / Misinformation', 'เปิดเผยข้อมูลส่วนบุคคล (PDPA)',
  'คุกคามหรือใช้ถ้อยคำรุนแรง', 'สแปมหรือโฆษณา', 'อื่น ๆ',
];

export const STATUSES: ReportStatus[] = ['Open', 'Reviewed', 'Dismissed'];
export const QA = 'คำถาม / Q&A';
export const ANNOUNCE_CAT = 'ประกาศ / Announcements';

// User.Role carries only isCMUP / isMod — office accounts are CMU Personnel with an office DisplayName.
export const ROLE_LABEL: Record<Role, string> = { org: 'บุคลากร', staff: 'บุคลากร', mod: 'ผู้ดูแล', student: 'นักศึกษา' };
export const ROLE_STYLE: Record<Role, CSSProperties> = {
  org: { background: 'var(--color-accent-200)', color: 'var(--color-accent-800)' },
  staff: { background: 'var(--color-accent-2-200)', color: 'var(--color-accent-2-800)' },
  mod: { background: '#e1eecc', color: '#3d472b' },
  student: { background: 'var(--color-neutral-200)', color: 'var(--color-neutral-800)' },
};

export const ME = { name: 'Natphisit Pintha', meta: 'Software Engineering ปี 3 · natphisit.p@cmu.ac.th', initials: 'NP', tint: 0 };

export const NOTIFS = [
  { text: 'ประกาศด่วน: งดจ่ายน้ำ หอพัก 40 ปี อาคาร 3 และ 4', time: '25 นาที', go: 'p1' },
  { text: 'ประกาศ: PM2.5 เกินมาตรฐาน งดกิจกรรมกลางแจ้ง', time: '2 ชั่วโมง', go: 'p2' },
  { text: 'ประกาศในหมวดที่คุณสนใจ: เปลี่ยนห้องสอบ SE212', time: 'เมื่อวาน', go: 'p3' },
];

export const POSTS: Post[] = [
  { id: 'p1', important: true, type: 'announce', priority: 'urgent', role: 'org',
    name: 'สำนักงานหอพักนักศึกษา มช.', meta: 'บุคลากร · งานหอพัก', time: '25 นาทีที่แล้ว', initials: 'หอ', tint: 5,
    title: 'งดจ่ายน้ำประปา หอพัก 40 ปี อาคาร 3 และ 4 · 12–14 ก.ย.',
    body: 'ซ่อมท่อเมนหลังอาคาร 5 จะไม่มีน้ำใช้ช่วง 22:00–05:00 ทั้งสามคืน กรุณาสำรองน้ำล่วงหน้า · No water supply 22:00–05:00 for three nights. Please store water in advance.',
    cats: ['ประกาศ / Announcements', 'หอพัก / Housing'],
    likes: 342, notified: 1204 },
  { id: 'p2', important: true, type: 'announce', priority: 'notice', role: 'org',
    name: 'กองพัฒนานักศึกษา มช.', meta: 'บุคลากร · กองพัฒนานักศึกษา', time: '2 ชั่วโมงที่แล้ว', initials: 'กพ', tint: 0,
    title: 'PM2.5 เกินมาตรฐาน งดกิจกรรมกลางแจ้งวันนี้',
    body: 'ค่าฝุ่นหน้าหอประชุมวัดได้ 94 µg/m³ ขอความร่วมมืองดกิจกรรมกลางแจ้งและสวมหน้ากากเมื่อออกนอกอาคาร จุดแจกหน้ากากอยู่ที่ศาลาธรรม',
    cats: ['ประกาศ / Announcements'], likes: 211, notified: 1204 },
  { id: 'p3', important: true, type: 'announce', priority: null, role: 'staff',
    name: 'อาจารย์ปรีดา ว.', meta: 'บุคลากร · สำนักทะเบียน', time: 'เมื่อวาน 16:40', initials: 'ปว', tint: 3,
    title: 'เปลี่ยนห้องสอบกลางภาค SE212 เป็น RB5-301',
    body: 'คณะวิศวกรรมศาสตร์แจ้งเปลี่ยนห้องสอบกลางภาควิชา SE212 เป็น RB5-301 เวลาเดิม นักศึกษาที่ลงทะเบียนทุกคนได้รับแจ้งเตือนแล้ว',
    cats: ['ประกาศ / Announcements', 'เรียน / Academics'],
    likes: 442, notified: 210 },
  { id: 'p4', important: true, type: 'announce', priority: null, role: 'org',
    name: 'CMU Transit', meta: 'บุคลากร · งานขนส่ง', time: '2 วันที่แล้ว', initials: 'CT', tint: 2,
    title: 'ปรับตารางรถไฟฟ้าขนส่งภายในมหาวิทยาลัย',
    body: 'สายสีแดงเพิ่มรอบช่วง 07:30–09:00 และลดรอบหลัง 19:00 มีผลตั้งแต่วันจันทร์นี้ ดูตารางเต็มได้ที่ป้ายจอดทุกจุด',
    media: [{ type: 'image', label: 'ตารางเดินรถสายสีแดง' }, { type: 'image', label: 'ตารางสายสีเขียว' }, { type: 'image', label: 'แผนผังจุดจอด' }],
    cats: ['ประกาศ / Announcements'],
    likes: 175, notified: 1204 },
  { id: 'p12', important: true, type: 'announce', priority: 'notice', role: 'staff',
    name: 'อาจารย์ปรีดา ว.', meta: 'บุคลากร · สำนักทะเบียน', time: '4 ชั่วโมงที่แล้ว', initials: 'ปว', tint: 3,
    title: 'เปิดลงทะเบียนเพิ่ม SE212 รอบพิเศษ 40 ที่นั่ง · ปิดรับ 19 ก.ย.',
    body: 'คณะเปิดที่นั่งเพิ่มสำหรับนักศึกษาที่ลงทะเบียนไม่ทันรอบปกติ ลงชื่อในระบบ CMU SIS ได้ถึงวันศุกร์ 16:00 เรียงตามลำดับการลงชื่อ ถ้ามีคำถามเรื่องวิชาบังคับก่อนถามไว้ในความเห็นได้เลย จะตอบรวมทุกวัน',
    cats: ['ประกาศ / Announcements', 'เรียน / Academics'],
    likes: 2649, notified: 1204 },

  { id: 'p5', important: false, type: 'question', priority: null, role: 'student',
    name: 'Ploy Sriwan', meta: 'Software Engineering ปี 3', time: '3 ชั่วโมงที่แล้ว', initials: 'PS', tint: 1,
    title: 'รายงาน Lab SE212 ยังส่งได้อยู่ไหมถ้าเลยกำหนด',
    body: 'อยากรู้ว่าถ้าส่งช้ากว่ากำหนดยังได้คะแนนบางส่วนไหม แล้วส่วน normalization จากคาบที่แล้วต้องแก้ตามคอมเมนต์ก่อนส่งหรือเปล่า',
    cats: ['คำถาม / Q&A', 'เรียน / Academics'], likes: 51 },
  { id: 'p11', important: false, type: 'question', priority: null, role: 'student',
    name: 'Ice Supakorn', meta: 'Engineering ปี 4', time: '7 ชั่วโมงที่แล้ว', initials: 'IS', tint: 3,
    title: 'ปริ้นโปสเตอร์ A0 แถวประตูสวนดอกที่ไหนดี',
    body: 'ต้องใช้พรุ่งนี้เช้า ขอร้านที่เปิดดึกและราคาไม่แรงมาก ถ้าใครเคยปริ้นงานวิจัยช่วยแนะนำด้วย',
    cats: ['คำถาม / Q&A', 'ชีวิตในมอ / Campus life'], likes: 26 },
  { id: 'p7', important: false, type: 'story', priority: null, role: 'student',
    name: 'Mook Chaiyaporn', meta: 'Fine Arts ปี 4', time: '5 ชั่วโมงที่แล้ว', initials: 'MC', tint: 4,
    title: 'พระอาทิตย์ตกที่อ่างแก้วเมื่อวาน',
    body: 'ยืนดูอยู่ 20 นาที ลมเย็นกว่าอาทิตย์ก่อนเยอะ ถ่ายด้วยฟิล์มหมดอายุปี 2019 · shot on expired film.',
    media: [{ type: 'image', label: 'อ่างแก้วตอนเย็น' }, { type: 'image', label: 'ฝั่งตรงข้ามอ่างแก้ว' }],
    cats: ['ชีวิตในมอ / Campus life'],
    likes: 544 },
  { id: 'p8', important: false, type: 'story', priority: null, role: 'student',
    name: 'Bank Lertwong', meta: 'Engineering ปี 1', time: '8 ชั่วโมงที่แล้ว', initials: 'BL', tint: 0,
    title: 'เจอบัตรนักศึกษาตกใกล้หอสมุดกลาง',
    body: 'ชื่อขึ้นต้นด้วย N. รหัส 68… ฝากไว้กับเคาน์เตอร์ยืมคืนชั้น 1 แล้ว เจ้าของไปรับได้เลย แสดงบัตรอื่นยืนยันด้วยนะ',
    cats: ['ของหาย / Lost & Found'], likes: 295 },
  { id: 'p9', important: false, type: 'market', priority: null, role: 'student',
    name: 'Aree Boon', meta: 'Economics ปี 3', time: 'เมื่อวาน', initials: 'AB', tint: 3,
    title: 'ขายจักรยานแม่บ้าน 1,200 บาท ใช้มาปีเดียว',
    body: 'สีครีม ตะกร้าหน้ายังดี เบรกเพิ่งเปลี่ยน รับของที่หอ 40 ปี ต่อรองได้ถ้ารับวันนี้',
    media: [{ type: 'image', label: 'จักรยานมุมหน้า' }, { type: 'image', label: 'ตะกร้าและเบรก' }, { type: 'video', label: 'วิดีโอทดลองปั่น' }],
    cats: ['ซื้อขาย / Marketplace'],
    likes: 45 },
  { id: 'p10', important: false, type: 'story', priority: null, role: 'student',
    name: 'Tar Panyawat', meta: 'Mass Communication ปี 2', time: 'เมื่อวาน', initials: 'TP', tint: 5,
    title: 'ดราม่าคิวร้านข้าวมันไก่หน้ามอ ใครเจอเหมือนกันบ้าง',
    body: 'ต่อคิว 20 นาทีแล้วมีคนลัดคิวหน้าตาเฉย เถียงกันเสียงดังหน้าร้านเลย ใครมีคลิปช่วยลงให้ดูหน่อย',
    cats: ['ชีวิตในมอ / Campus life'], likes: 898, reports: 3 },
];

// 100-comment thread: generated so the deep-thread scroll case is real, not faked with filler.
const THREAD_NAMES: [string, string][] = [
  ['Ploy Sriwan', 'PS'], ['Thanwisit Angsachon', 'TA'], ['Fah Intira', 'FI'], ['Win Thanakorn', 'WT'],
  ['June Kanyarat', 'JK'], ['Ice Supakorn', 'IS'], ['Prim Nattaya', 'PN'], ['Mint Araya', 'MA'],
  ['Golf Chaiwat', 'GC'], ['Nat Wongchai', 'NW'], ['Bank Lertwong', 'BL'], ['Aree Boon', 'AB'],
  ['Tar Panyawat', 'TP'], ['Mook Chaiyaporn', 'MC'], ['Earth Siriwat', 'ES'], ['Beam Ratchanon', 'BR'],
  ['Pin Kultida', 'PK'], ['Nice Warisara', 'NV'], ['Poom Techin', 'PT'], ['Gun Atthaphon', 'GA'],
];
const THREAD_TEXTS = [
  'ลงชื่อแล้วครับ ขอบคุณที่เปิดรอบเพิ่ม',
  'ถ้ายังไม่ผ่านวิชาบังคับก่อน ลงได้ไหมครับ',
  'ระบบขึ้นว่าเต็มแล้วตั้งแต่เมื่อเช้า ยังนับคิวสำรองอยู่หรือเปล่า',
  'ขอถามเรื่องกลุ่ม Lab ครับ จะจัดใหม่ทั้งหมดหรือแทรกในกลุ่มเดิม',
  'รอบพิเศษนี้เรียนคาบเดียวกับรอบปกติไหมครับ',
  'เพิ่งเห็นประกาศ ขอบคุณที่แจ้งในนี้ ไม่ได้เช็คเมลเลย',
  'ถ้าลงชื่อแล้วเปลี่ยนใจต้องแจ้งใครครับ',
  'สำหรับนักศึกษาปี 4 ที่ต้องใช้จบ มีลำดับก่อนไหมครับ',
  'ยืนยันแล้วว่าเข้าได้ ขอบคุณอาจารย์มากครับ',
  'ที่นั่งเหลือเท่าไหร่แล้วครับ อยากรู้ก่อนชวนเพื่อนมาลง',
  'ขอลิงก์ระบบอีกครั้งได้ไหมครับ กดจากประกาศเดิมแล้วไม่ขึ้น',
  'ปิดรับ 16:00 วันศุกร์นี้ใช่ไหมครับ ไม่ใช่เที่ยงคืน',
  'ถ้าติดสอบวิชาอื่นเวลาเดียวกันจะขอย้ายกลุ่มได้ไหม',
  'รอบพิเศษใช้เกณฑ์ให้คะแนนเดียวกับรอบปกติไหมครับ',
  'ขอบคุณครับ ตอนนี้ลงได้แล้ว ระบบแค่ช้าตอนแรก',
  'มีหนังสือหรือเอกสารที่ต้องอ่านก่อนคาบแรกไหมครับ',
  'เพื่อนที่เป็นนักศึกษาข้ามคณะลงได้หรือเปล่าครับ',
  'ถ้าลงแล้วเกินหน่วยกิตสูงสุดจะติดที่ระบบไหมครับ',
  'ขอถามว่ารอบพิเศษมีสอบกลางภาคแยกหรือรวมกับรอบปกติ',
  'ลงชื่อเป็นคนที่ 37 พอดี ลุ้นว่าจะได้',
  'ห้องเรียนใช้ RB5-301 เหมือนที่ประกาศก่อนหน้าไหมครับ',
  'ขอบคุณที่ตอบในความเห็นทุกวัน อ่านแล้วเข้าใจขึ้นเยอะ',
  'ถ้าอยากถอนภายหลังจะกระทบเกรดไหมครับ',
  'สำหรับคนที่เคยเรียนแล้วไม่ผ่าน ต้องลงรอบนี้เลยหรือรอเทอมหน้า',
  'ประกาศนี้ส่งเข้าเมลด้วยไหมครับ เผื่อเพื่อนที่ไม่ได้เข้าแอป',
];

const p12Thread: Comment[] = Array.from({ length: 100 }, (_, i) => {
  const [a, initials] = THREAD_NAMES[i % THREAD_NAMES.length];
  const mins = 245 - i * 2;
  const byStaff = i % 17 === 5;
  return {
    id: `t${i + 1}`,
    a: byStaff ? 'อาจารย์ปรีดา ว.' : a,
    r: byStaff ? 'staff' : 'student',
    i: byStaff ? 'ปว' : initials,
    t: i % 6,
    time: mins >= 60 ? `${Math.floor(mins / 60)} ชั่วโมง` : `${Math.max(mins, 1)} นาที`,
    text: THREAD_TEXTS[i % THREAD_TEXTS.length],
    likes: Math.max(0, 48 - (i % 13) * 4 + (i % 5) * 3),
    replies: i % 9 === 3 ? [{
      id: `t${i + 1}r1`, a: 'อาจารย์ปรีดา ว.', i: 'ปว', t: 3,
      time: `${Math.max(Math.floor(mins / 60), 1)} ชั่วโมง`,
      text: 'ตอบรวมไว้ในความเห็นด้านล่างนะครับ ถ้ายังไม่ชัดเจนเมลมาได้เลย',
    }] : [],
  };
});

export const COMMENTS: Record<string, Comment[]> = {
  p1: [
    { id: 'k1', a: 'Fah Intira', r: 'student', i: 'FI', t: 4, time: '12 นาที', text: 'ขอบคุณที่แจ้งล่วงหน้า ครั้งก่อนน้ำหยุดแบบไม่บอกเลย', likes: 18, replies: [
      { id: 'k1r1', a: 'สำนักงานหอพักนักศึกษา มช.', i: 'หอ', t: 5, time: '8 นาที', text: 'ต่อไปจะประกาศล่วงหน้าอย่างน้อย 48 ชั่วโมงทุกครั้งครับ' }] },
    { id: 'k2', a: 'Win Thanakorn', r: 'student', i: 'WT', t: 1, time: '6 นาที', text: 'อาคาร 3 กับ 4 เท่านั้นใช่ไหมครับ อาคาร 5 ปกติ', likes: 3, replies: [] },
  ],
  p2: [{ id: 'k3', a: 'June Kanyarat', r: 'student', i: 'JK', t: 2, time: '40 นาที', text: 'วิ่งรอบอ่างแก้วเลื่อนไปพรุ่งนี้ดีกว่า วันนี้คอแห้งมาก', likes: 9, replies: [] }],
  p3: [{ id: 'k4', a: 'Prim Nattaya', r: 'student', i: 'PN', t: 3, time: '20 ชั่วโมง', text: 'RB5-301 อยู่ตึกไหนครับ เพิ่งย้ายมาเทอมนี้', likes: 5, replies: [] }],
  p5: [
    { id: 'k5', a: 'Thanwisit Angsachon', r: 'student', i: 'TA', t: 0, time: '2 ชั่วโมง', text: 'ส่งช้าได้แต่หัก 10% ต่อวันตามที่แจ้งใน Mango ส่วน normalization ต้องแก้ตามคอมเมนต์ก่อนส่งรอบใหม่', likes: 24, replies: [
      { id: 'k5r1', a: 'Ploy Sriwan', i: 'PS', t: 1, time: '1 ชั่วโมง', text: 'ขอบคุณมาก กำลังจะแก้ 3NF พอดี' }] },
    { id: 'k6', a: 'Parinthorn Saengwiman', r: 'student', i: 'PW', t: 2, time: '1 ชั่วโมง', text: 'ถ้าไม่แน่ใจให้เมลถามอาจารย์ก่อน อย่าเดาเอง', likes: 11, replies: [] },
  ],
  p11: [{ id: 'k13', a: 'Golf Chaiwat', r: 'student', i: 'GC', t: 1, time: '5 ชั่วโมง', text: 'ร้านตรงข้ามประตูสวนดอกเปิดถึงเที่ยงคืน A0 ประมาณ 180 บาท', likes: 7, replies: [] }],
  p7: [{ id: 'k10', a: 'Mint Araya', r: 'student', i: 'MA', t: 5, time: '2 ชั่วโมง', text: 'สีฟิล์มหมดอายุสวยแบบนี้ตั้งใจหรือฟลุ๊คครับ', likes: 8, replies: [] }],
  p9: [{ id: 'k11', a: 'Nat Wongchai', r: 'student', i: 'NW', t: 1, time: 'เมื่อวาน', text: 'ยังอยู่ไหมครับ ขอดูรูปเฟรมใกล้ ๆ', likes: 2, replies: [] }],
  p10: [{ id: 'k12', a: 'Earth Siriwat', r: 'mod', i: 'ES', t: 2, time: '20 ชั่วโมง', text: 'โพสต์นี้มีรายงานเข้ามา 3 ครั้ง กำลังตรวจสอบว่าเข้าข่ายการคุกคามหรือไม่ ขอความร่วมมืองดโพสต์คลิปที่เห็นใบหน้าบุคคลอื่น', likes: 64, replies: [] }],
  p12: p12Thread,
};
