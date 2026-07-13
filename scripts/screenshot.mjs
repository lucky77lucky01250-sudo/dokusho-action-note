import puppeteer from "puppeteer-core";

const URL = "https://dokusho-action-note.vercel.app";

// README用のデモデータ（localStorageに仕込んで撮影する）
const now = Date.now();
const bookId = "demo-book";
const demo = {
  books: [
    {
      id: bookId,
      title: "7つの習慣",
      author: "スティーブン・R・コヴィー",
      coverUrl: null,
      createdAt: now,
    },
  ],
  insights: [
    {
      id: "i1",
      bookId,
      text: "緊急でないが重要なことに時間を使う",
      createdAt: now,
    },
  ],
  actions: [
    {
      id: "a1",
      bookId,
      text: "人の話を最後まで聞く",
      status: "active",
      doneCount: 12,
      lastDoneDate: new Date().toISOString().slice(0, 10),
      createdAt: now,
    },
    {
      id: "a2",
      bookId,
      text: "寝る前に明日の最優先を1つ決める",
      status: "active",
      doneCount: 5,
      lastDoneDate: null,
      createdAt: now,
    },
    {
      id: "a3",
      bookId,
      text: "朝5分だけ読書する",
      status: "stock",
      doneCount: 0,
      lastDoneDate: null,
      createdAt: now,
    },
    {
      id: "a4",
      bookId,
      text: "週1回、家族との時間を先に予定に入れる",
      status: "mastered",
      doneCount: 30,
      lastDoneDate: null,
      createdAt: now,
    },
  ],
};

const browser = await puppeteer.launch({
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });

await page.goto(URL, { waitUntil: "networkidle0" });
await page.evaluate((data) => {
  localStorage.setItem("dokusho-action-note", JSON.stringify(data));
}, demo);
await page.reload({ waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({
  path: "/Users/ryu/dokusho-action-note/docs/screenshot-today.png",
});

// アクションタブ
await page.evaluate(() => {
  const btn = [...document.querySelectorAll("nav button")].find((b) =>
    b.textContent.includes("アクション")
  );
  btn.click();
});
await new Promise((r) => setTimeout(r, 400));
await page.screenshot({
  path: "/Users/ryu/dokusho-action-note/docs/screenshot-actions.png",
});

await browser.close();
console.log("done");
