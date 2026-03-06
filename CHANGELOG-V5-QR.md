# Tool Management V5 - QR Workflow Fix Changelog

## สรุปการแก้ไขทั้ง 10 ข้อตามเอกสาร

---

### 1. Tool Component Registration → QR Generation (ข้อ 1-2)

**ไฟล์:** `src/pages/RegisterToolCodeQR.tsx`

**ก่อน:** กด Generate QR → แค่ save ข้อมูล + redirect ไป `/qr-generator` → ต้องกด "Generate All" อีกที

**หลัง:** กด Generate QR → **save + generate QR ทันทีในขั้นตอนเดียว** → redirect ไป `/qr-generator` พร้อม QR ที่สร้างเสร็จแล้ว

**Duplicate Detection (ข้อ 2):**
- เช็ค **ทุก column** (toolCode, lineNo, set, machineNo, model, toolLife, processNo, toolType, qtyToolNew, makerToolNew)
- ถ้าข้อมูลซ้ำ 100% AND มี QR อยู่แล้ว → **block** พร้อมแจ้งเตือน "ข้อมูลซ้ำ 100% กรุณาลบรายการซ้ำก่อน"
- ถ้ามี column ใดต่างกัน → ถือเป็น component ใหม่ → สร้าง QR No. ใหม่

---

### 2. Assembly QR Auto-Generation (ข้อ 3)

**ไฟล์:** `src/pages/QRGeneratorPage.tsx`

- เมื่อ Generate QR สร้าง Component QR เรียบร้อยแล้ว
- ปุ่ม "สร้าง Assembly QR" ใน `/qr-generator` ให้เลือก components แล้วรวมเป็น Assembly
- Assembly มี QR No. เดียว + QR Code เดียว

---

### 3. Bug #1 Fixed: QR ไม่ค้างที่ Pending อีกต่อไป (ข้อ 4)

**สาเหตุ:** `handleGenerateQR()` เดิมแค่ save + navigate ไม่ได้เรียก `generateQRCodes()`

**แก้ไข:** ตอนนี้ `handleGenerateQR()`:
1. Save ข้อมูลลง toolLists
2. เรียก `generateQRCodes(id)` ทันทีสำหรับทุกรายการที่ save
3. Navigate ไป `/qr-generator` — QR พร้อมใช้ทันที

---

### 4. Bug #2 Fixed: Tool Life ไม่ถูกตัดอีกต่อไป (ข้อ 4)

**แก้ไขใน QRLabel component + Print template:**
- เปลี่ยน Tool Life area เป็น `word-break: break-all; line-height: 1.1`
- ลด font size จาก 16px → 13px ใน preview
- ลด font size จาก 12pt → 9pt ใน print template
- ข้อความยาวจะตัดบรรทัดแทนที่จะถูกซ่อน

---

### 5. Print Individual QR (ข้อ 5) — ใหม่

**ไฟล์:** `src/pages/QRGeneratorPage.tsx`

ทุก QR card มีปุ่ม:
```
[Edit] [Print QR] [PNG] [Delete]
```
- **Print QR** — เปิดหน้าต่างพิมพ์สำหรับ QR card นั้นตัวเดียว (ขนาด 90mm × 55mm)
- **PNG** — ดาวน์โหลด label เป็นไฟล์ PNG

---

### 6. QR Date Rule (ข้อ 6)

**ก่อน:** แสดง `new Date()` (วันที่ปัจจุบัน)

**หลัง:** แสดง `createdAt` จาก toolList record (วันที่สร้าง QR)

ทุกที่ที่แสดงวันที่ใน label (preview, print single, print all, download PNG) ใช้ `createdAt`

---

### 7. Delete QR Function (ข้อ 7)

**ไฟล์:** `src/pages/QRGeneratorPage.tsx`

ทุก QR card มีปุ่ม **Delete** สีแดง

---

### 8. Role Permission (ข้อ 8)

**กฎ:**
- **Visitor** → ไม่เห็นปุ่ม Delete
- **Staff** → เห็นปุ่ม Delete + ลบได้
- **Admin** → เห็นปุ่ม Delete + ลบได้

**Code:** `const canDelete = user?.role === 'ADMIN' || user?.role === 'STAFF';`

---

### 9. Delete Safety (ข้อ 9)

**Confirmation popup:**
> "ต้องการลบ QR Code ของ **{toolCode}** ({qrValue}) หรือไม่?
> การลบจะถาวรไม่สามารถกู้คืนได้"

**Safety check:**
- ก่อนลบ → ตรวจสอบว่า QR No. ถูกใช้ใน Tool Transaction (เบิก-จ่าย) หรือไม่
- ถ้าถูกใช้แล้ว → **block ลบ** พร้อมแจ้ง "ไม่สามารถลบได้: QR นี้ถูกใช้ในประวัติเบิก-จ่ายแล้ว"
- ถ้าไม่ถูกใช้ → ลบจาก database + ลบ QR card

---

### 10. QR Number Uniqueness (ป้องกันซ้ำ)

**กลไก 3 ชั้น:**
1. `generateToolQRCode()` ใช้ format `QR-{Line}-{ToolCode}-{YYYYMMDD}-{SEQ}` โดย SEQ auto-increment จาก existing QR codes
2. Full-row duplicate check ก่อน save (ทุก column เหมือนกัน 100% → block)
3. `checkDuplicateKanban()` เช็คว่ารายการมี QR อยู่แล้วหรือยัง

---

## วิธี Upload

```bash
tar xzf V5-Part1.tar.gz -C Tool-management-V5/
tar xzf V5-Part2.tar.gz -C Tool-management-V5/
cd Tool-management-V5
git add .
git commit -m "fix: QR workflow - immediate gen, delete, print single, date rule, role perm"
git push
```

## ไฟล์ที่แก้ไข

| ไฟล์ | สถานะ | รายละเอียด |
|------|--------|-----------|
| src/pages/QRGeneratorPage.tsx | เขียนใหม่ทั้งหมด | Print individual, Delete QR, Role check, Date rule, Safety check, Tool Life fix |
| src/pages/RegisterToolCodeQR.tsx | แก้ไข | QR generate ทันที, full-row duplicate detection |
