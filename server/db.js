// เชื่อมต่อฐานข้อมูล SQLite และสร้างตาราง + ข้อมูลตัวอย่างครั้งแรก
const path = require('path');
// ใช้ SQLite ที่มากับ Node.js (node:sqlite) ไม่ต้องติดตั้ง/คอมไพล์แพ็กเกจเพิ่ม
const { DatabaseSync } = require('node:sqlite');

const db = new DatabaseSync(path.join(__dirname, 'english.db'));
db.exec('PRAGMA journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS words (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    word        TEXT NOT NULL,
    meaning     TEXT NOT NULL,
    part_of_speech TEXT DEFAULT 'noun',
    example     TEXT DEFAULT '',
    level       TEXT DEFAULT 'easy',
    learned     INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS grammar (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    structure   TEXT NOT NULL,
    explanation TEXT NOT NULL,
    example     TEXT DEFAULT '',
    level       TEXT DEFAULT 'easy',
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    score       INTEGER NOT NULL,
    total       INTEGER NOT NULL,
    created_at  TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// ใส่ข้อมูลตัวอย่างระดับ IELTS (Band 6.5–8) ถ้าตารางยังว่าง
if (db.prepare('SELECT COUNT(*) AS c FROM words').get().c === 0) {
  const ins = db.prepare('INSERT INTO words (word, meaning, part_of_speech, example, level) VALUES (?,?,?,?,?)');
  [
    ['exacerbate', 'ทำให้ (ปัญหา) แย่ลง รุนแรงขึ้น', 'verb', 'Rapid urbanisation has exacerbated air pollution in many developing countries.', 'hard'],
    ['mitigate', 'บรรเทา ลดความรุนแรง', 'verb', 'Governments should implement stricter regulations to mitigate the effects of climate change.', 'medium'],
    ['detrimental', 'เป็นอันตราย ส่งผลเสีย', 'adjective', 'Excessive screen time can be detrimental to children\'s cognitive development.', 'medium'],
    ['ubiquitous', 'มีอยู่ทั่วไป พบได้ทุกที่', 'adjective', 'Smartphones have become ubiquitous in modern society.', 'hard'],
    ['proliferation', 'การแพร่กระจายอย่างรวดเร็ว', 'noun', 'The proliferation of social media has transformed the way people consume news.', 'hard'],
    ['alleviate', 'บรรเทา ทำให้เบาลง', 'verb', 'Investing in public transport could alleviate traffic congestion in major cities.', 'medium'],
    ['unprecedented', 'ไม่เคยเกิดขึ้นมาก่อน', 'adjective', 'The pandemic caused unprecedented disruption to global supply chains.', 'medium'],
    ['substantial', 'มาก จำนวนมาก มีนัยสำคัญ', 'adjective', 'There has been a substantial increase in the number of students studying abroad.', 'medium'],
    ['inevitable', 'หลีกเลี่ยงไม่ได้', 'adjective', 'Some degree of job loss is inevitable as automation becomes more widespread.', 'medium'],
    ['scrutinise', 'ตรวจสอบอย่างละเอียด', 'verb', 'Researchers must scrutinise their data carefully before drawing conclusions.', 'hard'],
    ['compelling', 'น่าเชื่อถือ หนักแน่น โน้มน้าวได้ดี', 'adjective', 'There is compelling evidence that regular exercise improves mental health.', 'medium'],
    ['disparity', 'ความเหลื่อมล้ำ ความแตกต่าง', 'noun', 'The disparity between urban and rural incomes continues to widen.', 'hard'],
    ['sustainable', 'ยั่งยืน', 'adjective', 'Cities need more sustainable approaches to waste management.', 'easy'],
    ['undermine', 'บ่อนทำลาย ทำให้อ่อนแอลง', 'verb', 'Corruption can seriously undermine public trust in government institutions.', 'hard'],
    ['fluctuate', 'ผันผวน ขึ้นลงไม่แน่นอน', 'verb', 'The price of oil fluctuated considerably between 2010 and 2020.', 'medium'],
    ['plummet', 'ลดลงอย่างฮวบฮาบ', 'verb', 'Sales plummeted to their lowest level in a decade in the final quarter.', 'medium'],
    ['consensus', 'ความเห็นพ้องต้องกัน ฉันทามติ', 'noun', 'There is a growing consensus among scientists that human activity drives global warming.', 'medium'],
    ['indispensable', 'ขาดไม่ได้ จำเป็นอย่างยิ่ง', 'adjective', 'The internet has become an indispensable tool for education.', 'hard'],
    ['curb', 'ควบคุม จำกัด ยับยั้ง', 'verb', 'Higher taxes on sugary drinks may help curb childhood obesity.', 'medium'],
    ['ramification', 'ผลกระทบที่ตามมา (มักไม่คาดคิด)', 'noun', 'Policymakers must consider the long-term ramifications of reducing education funding.', 'hard'],
    ['advocate', 'สนับสนุน / ผู้สนับสนุน', 'verb', 'Many health experts advocate a ban on junk food advertising aimed at children.', 'medium'],
    ['deteriorate', 'เสื่อมลง แย่ลง', 'verb', 'Air quality in the capital has deteriorated significantly over the past decade.', 'medium'],
    ['feasible', 'เป็นไปได้ ทำได้จริง', 'adjective', 'It is not economically feasible to provide free public transport in every city.', 'medium'],
    ['profound', 'ลึกซึ้ง รุนแรง (ผลกระทบ)', 'adjective', 'The internet has had a profound impact on the way people communicate.', 'medium'],
    ['contentious', 'เป็นที่ถกเถียง', 'adjective', 'Whether animals should be used in medical research remains a contentious issue.', 'hard'],
    ['incentive', 'แรงจูงใจ สิ่งจูงใจ', 'noun', 'Tax breaks could provide an incentive for companies to adopt greener practices.', 'easy'],
    ['impose', 'บังคับใช้ กำหนด (ภาษี กฎ)', 'verb', 'Some countries have imposed heavy taxes on cigarettes to discourage smoking.', 'medium'],
    ['deplete', 'ทำให้ลดลง ใช้จนหมด', 'verb', 'Overfishing has severely depleted fish stocks in many parts of the world.', 'medium'],
    ['paramount', 'สำคัญที่สุด', 'adjective', 'Public safety should be of paramount importance when designing new infrastructure.', 'hard'],
    ['commodity', 'สินค้า สิ่งที่มีค่า', 'noun', 'In the digital age, personal data has become a valuable commodity.', 'medium'],
    ['eradicate', 'กำจัดให้หมดสิ้น', 'verb', 'International cooperation is essential if we are to eradicate extreme poverty.', 'hard'],
    ['tangible', 'จับต้องได้ เป็นรูปธรรม', 'adjective', 'The new policy has yet to produce any tangible benefits for local residents.', 'medium'],
    ['surge', 'การพุ่งขึ้นอย่างรวดเร็ว / พุ่งขึ้น', 'noun', 'There was a sharp surge in online shopping during the lockdown period.', 'easy'],
    ['adverse', 'ไม่พึงประสงค์ เป็นผลเสีย', 'adjective', 'Long working hours can have adverse effects on both physical and mental health.', 'medium'],
    ['cohesion', 'ความสามัคคี ความเป็นหนึ่งเดียว', 'noun', 'Community events can strengthen social cohesion in diverse neighbourhoods.', 'hard'],
    ['inequity', 'ความไม่เป็นธรรม', 'noun', 'Unequal access to healthcare is a major source of inequity in society.', 'hard'],
    ['facilitate', 'อำนวยความสะดวก ทำให้ง่ายขึ้น', 'verb', 'Technology can facilitate collaboration between students in different countries.', 'medium'],
    ['stagnant', 'หยุดนิ่ง ไม่เติบโต', 'adjective', 'Wages have remained stagnant while the cost of living continues to rise.', 'medium'],
    ['catalyst', 'ตัวเร่ง สิ่งกระตุ้นให้เกิดการเปลี่ยนแปลง', 'noun', 'The financial crisis acted as a catalyst for major banking reforms.', 'hard'],
    ['ambiguous', 'กำกวม ตีความได้หลายแบบ', 'adjective', 'The wording of the new regulation is ambiguous and open to misinterpretation.', 'medium'],
    ['discrepancy', 'ความไม่สอดคล้องกัน ความแตกต่าง (ของข้อมูล)', 'noun', 'There is a notable discrepancy between the official figures and independent estimates.', 'hard'],
    ['empirical', 'เชิงประจักษ์ อิงจากการทดลอง/สังเกต', 'adjective', 'There is little empirical evidence to support the claim that video games cause violence.', 'hard'],
    ['hinder', 'ขัดขวาง ทำให้ล่าช้า', 'verb', 'A lack of funding has hindered progress in medical research.', 'medium'],
    ['inherent', 'ที่มีอยู่ในตัว โดยธรรมชาติ', 'adjective', 'There are inherent risks in relying too heavily on a single source of energy.', 'hard'],
    ['jeopardise', 'ทำให้ตกอยู่ในอันตราย เสี่ยงต่อการสูญเสีย', 'verb', 'Overfishing could jeopardise the livelihoods of coastal communities.', 'hard'],
    ['lucrative', 'ทำกำไรได้มาก', 'adjective', 'Tourism has become a lucrative industry for many island nations.', 'medium'],
    ['marginalise', 'ทำให้เป็นคนชายขอบ ถูกกีดกัน', 'verb', 'Rapid digitalisation risks marginalising elderly people who lack technological skills.', 'hard'],
    ['pivotal', 'สำคัญยิ่ง เป็นจุดเปลี่ยน', 'adjective', 'Teachers play a pivotal role in shaping young people\'s attitudes.', 'medium'],
    ['prevalent', 'แพร่หลาย พบได้บ่อย', 'adjective', 'Obesity is becoming increasingly prevalent among teenagers in developed countries.', 'medium'],
    ['viable', 'ใช้การได้ มีโอกาสสำเร็จ', 'adjective', 'Solar power is now a viable alternative to fossil fuels in many regions.', 'medium'],
    ['vulnerable', 'เปราะบาง เสี่ยงต่อการได้รับอันตราย', 'adjective', 'Low-lying coastal cities are particularly vulnerable to rising sea levels.', 'easy'],
  ].forEach(r => ins.run(...r));
}

if (db.prepare('SELECT COUNT(*) AS c FROM grammar').get().c === 0) {
  const ins = db.prepare('INSERT INTO grammar (title, structure, explanation, example, level) VALUES (?,?,?,?,?)');
  [
    ['Inversion (Negative Adverbials)', 'Not only / Rarely / Seldom / Never + aux + S + V', 'กลับตำแหน่งกริยาช่วยกับประธานเมื่อขึ้นต้นด้วยคำปฏิเสธหรือคำที่มีความหมายจำกัด เพื่อเน้นและทำให้ประโยคเป็นทางการ ใช้ใน Writing Task 2 ช่วยเพิ่มคะแนน Grammatical Range', 'Not only does pollution harm the environment, but it also poses serious health risks.', 'hard'],
    ['Mixed Conditionals', 'If + S + had + V3, S + would + V1 (now)', 'ผสมเงื่อนไขต่างช่วงเวลา: เงื่อนไขในอดีตที่ส่งผลถึงปัจจุบัน หรือกลับกัน', 'If governments had invested in renewable energy earlier, we would not be facing such a severe crisis today.', 'hard'],
    ['Cleft Sentences', 'It is/was + X + that/who ... | What + S + V + is ...', 'แยกประโยคเพื่อเน้นข้อมูลส่วนใดส่วนหนึ่ง ทำให้ข้อโต้แย้งชัดและหนักแน่นขึ้น', 'It is the lack of affordable housing that drives young people out of major cities.', 'medium'],
    ['Participle Clauses', 'V-ing / V3 ..., S + V', 'ย่ออนุประโยคโดยใช้ V-ing (ความหมายกระทำ) หรือ V3 (ถูกกระทำ) ช่วยให้ประโยคกระชับและดูเป็นวิชาการ ประธานของทั้งสองส่วนต้องเป็นตัวเดียวกัน', 'Having analysed the data, the researchers concluded that the policy had failed.', 'medium'],
    ['Passive Reporting Structures', 'It is said/believed/argued that ... | S + is thought + to V', 'ใช้รายงานความคิดเห็นหรือข้อเท็จจริงโดยไม่ต้องระบุผู้พูด เหมาะกับงานเขียนวิชาการที่ต้องการความเป็นกลาง', 'It is widely believed that technology has made people less sociable.', 'medium'],
    ['Subjunctive (Mandative)', 'S + recommend/insist/suggest + that + S + V1 (bare)', 'หลังกริยาแสดงการแนะนำ ยืนกราน หรือเรียกร้อง ใช้กริยารูปไม่ผัน (ไม่เติม s แม้ประธานเอกพจน์) ให้น้ำเสียงเป็นทางการ', 'Experts recommend that every child have access to free primary education.', 'hard'],
    ['Concession (Advanced)', 'Although / Albeit / Notwithstanding / While + clause/phrase', 'แสดงการยอมรับอีกฝ่ายก่อนโต้แย้ง สำคัญมากในเรียงความแบบ discuss both views หรือ agree/disagree', 'While some argue that zoos protect endangered species, others believe they are inherently cruel.', 'medium'],
    ['Nominalisation', 'Verb/Adjective → Noun phrase', 'เปลี่ยนกริยาหรือคุณศัพท์เป็นคำนาม ทำให้ภาษาเป็นวิชาการและกระชับ ใช้มากใน Writing Task 1 และ 2', 'The rapid expansion of cities has led to a significant decline in green spaces.', 'medium'],
    ['Modal Perfect (Speculation)', 'S + must/might/could/should + have + V3', 'คาดเดาหรือวิจารณ์เหตุการณ์ในอดีต: must have = น่าจะแน่นอน, should have = ควรจะทำแต่ไม่ได้ทำ', 'The authorities should have anticipated the impact of the new tax on low-income families.', 'medium'],
    ['Future Perfect Continuous', 'S + will have been + V-ing', 'พูดถึงการกระทำที่ต่อเนื่องจนถึงจุดหนึ่งในอนาคต เน้นระยะเวลา มักใช้กับ by + เวลา', 'By 2030, the government will have been developing this project for over two decades.', 'hard'],
    ['Conditional Inversion', 'Had + S + V3 | Should + S + V1 | Were + S + to V', 'ละ if แล้วกลับตำแหน่งกริยาช่วย ให้ประโยคเงื่อนไขเป็นทางการมากขึ้น', 'Had the government acted sooner, the crisis could have been avoided.', 'hard'],
    ['Third Conditional', 'If + S + had + V3, S + would have + V3', 'สมมติสิ่งที่ตรงข้ามกับความจริงในอดีต ใช้วิเคราะห์เหตุและผลของเหตุการณ์ที่ผ่านมา', 'If stricter safety measures had been introduced, fewer accidents would have occurred.', 'medium'],
    ['Second Conditional (formal "were")', 'If + S + were/V2, S + would + V1', 'สมมติสิ่งที่ไม่จริงในปัจจุบัน ในภาษาทางการใช้ were กับทุกประธาน', 'If public transport were free, more people would leave their cars at home.', 'medium'],
    ['Non-defining Relative Clauses', 'N, which/who + V ..., ...', 'ให้ข้อมูลเพิ่มเติมที่ไม่จำเป็นต่อความหมายหลัก ต้องมีจุลภาคคั่น และห้ามใช้ that', 'Renewable energy, which is becoming cheaper every year, could replace coal entirely.', 'medium'],
    ['Reduced Relative Clauses', 'N + V-ing / V3 (ละ who/which + be)', 'ลดรูปอนุประโยคคุณศัพท์ให้สั้นลง ทำให้ประโยคกระชับแบบงานวิชาการ', 'Students living in rural areas often have limited access to the internet.', 'medium'],
    ['Comparative Correlatives', 'The + comparative ..., the + comparative ...', 'แสดงว่าสิ่งหนึ่งเปลี่ยน อีกสิ่งก็เปลี่ยนตามกันไป', 'The more time children spend outdoors, the healthier they tend to be.', 'medium'],
    ['Hedging Language', 'S + tend to / appear to / may + V | It could be argued that ...', 'ทำให้ข้ออ้างฟังระมัดระวังและเป็นวิชาการ ไม่สรุปเกินหลักฐาน ช่วยให้ดูเป็นผู้เขียนที่มีวิจารณญาณ', 'It could be argued that social media has done more harm than good to democracy.', 'medium'],
    ['Causative', 'S + have/get + object + V3', 'บอกว่าให้ผู้อื่นทำบางอย่างให้ เน้นสิ่งที่ถูกทำมากกว่าผู้ลงมือ', 'Many companies now have their customer service handled by AI systems.', 'easy'],
    ['Wish / If only', 'S + wish + S + V2 / had + V3', 'แสดงความเสียใจหรือความปรารถนาที่ตรงข้ามกับความจริง (V2 = ปัจจุบัน, had V3 = อดีต) ใช้บ่อยใน Speaking', 'I wish I had started learning English at a younger age.', 'medium'],
    ['Gerund as Subject', 'V-ing (+ object) + V ...', 'ใช้กริยาเติม ing เป็นประธานของประโยค ช่วยเปิดประโยคแบบหลากหลายแทน It is ...', 'Reducing meat consumption is one of the most effective ways to cut emissions.', 'easy'],
    ['Prepositional Relative Clauses', 'N + preposition + which/whom + S + V', 'ย้ายบุพบทมาไว้หน้า which/whom ทำให้เป็นทางการกว่าการวางบุพบทไว้ท้ายประโยค', 'The extent to which technology affects learning remains unclear.', 'hard'],
    ['So / Such ... that', 'so + adj/adv + that | such + (a) + adj + N + that', 'แสดงเหตุและผลที่มีระดับสูง: มาก...จนกระทั่ง', 'The demand for housing is so high that prices have doubled in five years.', 'easy'],
    ['Despite / In spite of', 'Despite / In spite of + N / V-ing, S + V', 'แสดงความขัดแย้ง ตามด้วยคำนามหรือ V-ing เท่านั้น ห้ามตามด้วยประโยคเต็ม', 'Despite significant investment, the scheme failed to reduce unemployment.', 'easy'],
    ['Contrast with Whereas', 'S + V, whereas + S + V', 'เปรียบเทียบสองสิ่งที่ตรงข้ามกัน เหมาะมากกับ Writing Task 1 เวลาเทียบข้อมูลสองกลุ่ม', 'Car ownership rose sharply in urban areas, whereas it remained stable in rural regions.', 'easy'],
    ['Present Perfect Continuous', 'S + has/have been + V-ing', 'การกระทำที่เริ่มในอดีตและยังต่อเนื่องถึงปัจจุบัน เน้นระยะเวลาหรือแนวโน้ม', 'The number of remote workers has been rising steadily since 2020.', 'medium'],
    ['Past Perfect', 'S + had + V3', 'เหตุการณ์ที่เกิดก่อนอีกเหตุการณ์ในอดีต ใช้ใน Task 1 เมื่อบรรยายลำดับเวลา', 'By 2015, the population of the city had already exceeded ten million.', 'medium'],
    ['Emphatic "do"', 'S + do/does/did + V1', 'ใช้ do/does/did หน้ากริยาแท้เพื่อเน้นย้ำหรือโต้แย้งความเชื่อที่ว่าตรงกันข้าม', 'Although online learning has drawbacks, it does offer greater flexibility.', 'medium'],
    ['Only after / Only when Inversion', 'Only after/when/by + ... + aux + S + V', 'ขึ้นต้นด้วย Only + วลีบอกเวลา/วิธีการ แล้วกลับกริยาช่วยในประโยคหลัก', 'Only when governments cooperate will climate change be effectively addressed.', 'hard'],
    ['No sooner ... than / Hardly ... when', 'No sooner had + S + V3 + than ... | Hardly had + S + V3 + when ...', 'เหตุการณ์หนึ่งเกิดตามอีกเหตุการณ์ทันที ใช้ inversion ทำให้เป็นทางการ', 'No sooner had the policy been introduced than it faced strong public opposition.', 'hard'],
    ['Linking Adverbials', 'S + V. Consequently / Moreover / Nevertheless, S + V.', 'คำเชื่อมระหว่างประโยคช่วยให้ย่อหน้ามี Coherence & Cohesion ดีขึ้น เช่น Consequently (ผลคือ), Moreover (นอกจากนี้), Nevertheless (อย่างไรก็ตาม)', 'Many factories closed in the region. Consequently, unemployment reached record levels.', 'easy'],
  ].forEach(r => ins.run(...r));
}

module.exports = db;
