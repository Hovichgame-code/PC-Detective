const BASE_REWARD = 100;

const state = {
  cases: [],
  currentCase: null,
  difficulty: "latwy",
  score: 0,
  exp: 0,
  money: 0,
  repairProgress: 0,
  computerHealth: 100,
  caseEarnings: BASE_REWARD,
  completedSteps: new Set(),
  startTime: Date.now(),
  finishedSeconds: 0,
  caseFinished: false,
  timerId: null,
  soundEnabled: true,
  audioContext: null,
};

const ranks = [
  { name: "Początkujący Technik", exp: 0 },
  { name: "Młodszy Technik", exp: 120 },
  { name: "Technik", exp: 280 },
  { name: "Starszy Technik", exp: 520 },
  { name: "Specjalista Sprzętowy", exp: 820 },
  { name: "Ekspert Diagnostyki", exp: 1200 },
];

const knowledge = [
  {
    title: "Jak czytać zgłoszenie",
    text: "Mail klienta zwykle zawiera ważne wskazówki, ale nie zawsze używa technicznego języka. Szukaj zależności: kiedy problem występuje, co zmieniło się przed awarią i czy komputer uruchamia się do systemu.",
    tips: ["Porównaj mail z listą objawów.", "Nie wymieniaj części bez potwierdzenia.", "Najpierw wybieraj testy najmniej ryzykowne."],
  },
  {
    title: "Procesor",
    text: "Procesor wykonuje obliczenia i steruje pracą programów. Gdy się przegrzewa, komputer może zwalniać, zawieszać się albo wyłączać, ponieważ płyta główna chroni sprzęt przed uszkodzeniem.",
    tips: ["Sprawdź temperatury w spoczynku i pod obciążeniem.", "Zwróć uwagę na spadki taktowania.", "Po demontażu chłodzenia sprawdź pastę i docisk radiatora."],
  },
  {
    title: "Pamięć RAM",
    text: "RAM przechowuje dane używane przez uruchomione programy. Uszkodzona lub źle osadzona pamięć powoduje losowe błędy, restarty, zawieszanie i problemy z uruchomieniem komputera.",
    tips: ["Testuj kości pojedynczo.", "Sprawdź, czy zatrzaski slotu są domknięte.", "Błędy po rozbudowie często wskazują na niezgodność taktowania lub profilu XMP."],
  },
  {
    title: "Karta graficzna",
    text: "Karta graficzna odpowiada za obraz i obliczenia graficzne. Jej problemy objawiają się brakiem obrazu, artefaktami, czarnym ekranem albo restartami podczas gier.",
    tips: ["Sprawdź przewód monitora i właściwe wyjście obrazu.", "Dociśnij kartę w slocie PCI-E.", "Skontroluj dodatkowe zasilanie karty."],
  },
  {
    title: "Dysk SSD i HDD",
    text: "Dyski przechowują system i pliki. SSD zwykle psuje się inaczej niż HDD: SSD może znikać z BIOS-u lub gubić dane, a HDD często daje odgłosy, wolny odczyt i błędy powierzchni.",
    tips: ["Sprawdź SMART.", "Przetestuj przewód SATA lub slot M.2.", "Przy podejrzeniu awarii najpierw zabezpiecz dane."],
  },
  {
    title: "Płyta główna",
    text: "Płyta główna łączy wszystkie podzespoły. Awarie płyty potrafią udawać problemy RAM, CPU albo zasilania, dlatego warto obserwować diody diagnostyczne, sygnały BIOS i zachowanie portów.",
    tips: ["Zresetuj ustawienia BIOS tylko wtedy, gdy ma to sens.", "Sprawdź kondensatory i gniazda.", "Diagnozuj płytę po wykluczeniu prostszych przyczyn."],
  },
  {
    title: "Zasilacz",
    text: "Zasilacz dostarcza energię do komputera. Zbyt słaby lub uszkodzony model może działać przy lekkiej pracy, ale zawodzić pod obciążeniem karty graficznej lub procesora.",
    tips: ["Nagły restart bez błędu systemu często wskazuje na zasilanie.", "Sprawdź przewody PCI-E i EPS.", "Nie testuj podejrzanego zasilacza na drogich częściach."],
  },
  {
    title: "Układ chłodzenia",
    text: "Chłodzenie odprowadza ciepło z procesora, karty graficznej i obudowy. Kurz, uszkodzony wentylator, źle założony radiator albo stara pasta szybko prowadzą do przegrzewania.",
    tips: ["Nie uruchamiaj długo komputera bez chłodzenia.", "Po wymianie pasty wykonaj test temperatur.", "Sprawdź kierunek przepływu powietrza w obudowie."],
  },
  {
    title: "Pieniądze i ryzyko",
    text: "Za naprawiony komputer zarabiasz 100 zł. Każda błędna decyzja odejmuje losowo od 10 do 30 zł od tego zlecenia. Saldo może spaść poniżej zera, więc kolejne poprawne naprawy pomagają odrobić stratę.",
    tips: ["Im mniej strzelania, tym większy zysk.", "Zły krok może obniżyć stan komputera.", "Komputer ze stanem 0% jest uznany za zepsuty."],
  },
];

const elements = {
  views: document.querySelectorAll(".view"),
  navButtons: document.querySelectorAll(".nav-button"),
  viewLinks: document.querySelectorAll("[data-view-link]"),
  startGameButton: document.querySelector("#start-game-button"),
  difficultyButtons: document.querySelectorAll(".difficulty-button"),
  caseSelect: document.querySelector("#case-select"),
  caseId: document.querySelector("#case-id"),
  caseTitle: document.querySelector("#case-title"),
  caseClient: document.querySelector("#case-client"),
  caseMail: document.querySelector("#case-mail"),
  symptomsList: document.querySelector("#symptoms-list"),
  diagnosisOptions: document.querySelector("#diagnosis-options"),
  repairOptions: document.querySelector("#repair-options"),
  repairSection: document.querySelector("#repair-section"),
  diagnosisSection: document.querySelector("#diagnosis-section"),
  feedback: document.querySelector("#feedback"),
  progressBar: document.querySelector("#repair-progress"),
  progressValue: document.querySelector("#progress-value"),
  healthProgress: document.querySelector("#health-progress"),
  healthValue: document.querySelector("#health-value"),
  healthDescription: document.querySelector("#health-description"),
  riskLevel: document.querySelector("#risk-level"),
  stageLabel: document.querySelector("#stage-label"),
  scoreValue: document.querySelector("#score-value"),
  expValue: document.querySelector("#exp-value"),
  rankValue: document.querySelector("#rank-value"),
  moneyValue: document.querySelector("#money-value"),
  caseEarningsValue: document.querySelector("#case-earnings-value"),
  profileRank: document.querySelector("#profile-rank"),
  profileExp: document.querySelector("#profile-exp"),
  profileScore: document.querySelector("#profile-score"),
  profileMoney: document.querySelector("#profile-money"),
  timer: document.querySelector("#timer"),
  report: document.querySelector("#report"),
  reportContent: document.querySelector("#report-content"),
  saveReportButton: document.querySelector("#save-report-button"),
  knowledgeGrid: document.querySelector("#knowledge-grid"),
  rankingList: document.querySelector("#ranking-list"),
  clearProgressButton: document.querySelector("#clear-progress-button"),
  soundToggle: document.querySelector("#sound-toggle"),
};

async function init() {
  loadProgress();
  bindEvents();
  renderKnowledge();
  await loadCases();
  renderCasesForDifficulty();
  updateStats();
  renderRanking();
  startTimer();
}

function bindEvents() {
  document.addEventListener("click", (event) => {
    if (event.target.closest("button")) {
      playSound("click");
    }
  });

  elements.navButtons.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.view));
  });

  elements.viewLinks.forEach((button) => {
    button.addEventListener("click", () => showView(button.dataset.viewLink));
  });

  elements.startGameButton.addEventListener("click", () => showView("game"));

  elements.soundToggle.addEventListener("change", () => {
    state.soundEnabled = elements.soundToggle.checked;
    saveProgress();
  });

  elements.difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.difficulty = button.dataset.difficulty;
      elements.difficultyButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderCasesForDifficulty();
    });
  });

  elements.caseSelect.addEventListener("change", () => {
    const selectedCase = state.cases.find((item) => item.id === elements.caseSelect.value);
    if (selectedCase) {
      startCase(selectedCase);
    }
  });

  elements.saveReportButton.addEventListener("click", saveReport);
  elements.clearProgressButton.addEventListener("click", clearProgress);
}

async function loadCases() {
  try {
    const response = await fetch("cases.json");
    state.cases = await response.json();
  } catch (error) {
    elements.feedback.textContent =
      "Nie udało się wczytać pliku cases.json. Sprawdź, czy plik znajduje się obok index.html.";
  }
}

function showView(viewName) {
  elements.views.forEach((view) => view.classList.remove("is-visible"));
  document.querySelector(`#view-${viewName}`).classList.add("is-visible");

  elements.navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === viewName);
  });
}

function renderCasesForDifficulty() {
  const availableCases = state.cases.filter((item) => item.difficulty === state.difficulty);
  elements.caseSelect.innerHTML = "";

  availableCases.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = `${item.id} - ${item.title}`;
    elements.caseSelect.append(option);
  });

  if (availableCases.length > 0) {
    startCase(availableCases[0]);
  } else {
    elements.caseTitle.textContent = "Brak zgłoszeń dla tego poziomu";
  }
}

function startCase(caseData) {
  state.currentCase = caseData;
  state.repairProgress = 0;
  state.computerHealth = caseData.initialHealth || 85;
  state.caseEarnings = BASE_REWARD;
  state.completedSteps = new Set();
  state.startTime = Date.now();
  state.finishedSeconds = 0;
  state.caseFinished = false;

  elements.caseId.textContent = `Zgłoszenie ${caseData.id}`;
  elements.caseTitle.textContent = caseData.title;
  elements.caseClient.textContent = caseData.client;
  elements.caseMail.innerHTML = formatMail(caseData);
  elements.riskLevel.textContent = caseData.risk || "standardowe";
  elements.symptomsList.innerHTML = "";
  caseData.symptoms.forEach((symptom) => {
    const item = document.createElement("li");
    item.textContent = symptom;
    elements.symptomsList.append(item);
  });

  elements.diagnosisSection.classList.remove("is-hidden");
  elements.repairSection.classList.add("is-hidden");
  elements.report.classList.add("is-hidden");
  elements.stageLabel.textContent = "Diagnostyka";
  elements.feedback.textContent = "Przeanalizuj mail i objawy, a potem wybierz najbardziej prawdopodobną przyczynę.";
  elements.timer.textContent = "00:00";
  updateProgress();
  updateHealth();
  updateStats();
  renderDiagnosisOptions(caseData);
  renderRepairOptions(caseData, true);
  startTimer();
}

function formatMail(caseData) {
  const body = (caseData.mail || "").replace(/\n/g, "<br />");
  return `
    <div class="mail-line"><strong>Od:</strong> ${caseData.client}</div>
    <div class="mail-line"><strong>Temat:</strong> ${caseData.title}</div>
    <p>${body}</p>
  `;
}

function renderDiagnosisOptions(caseData) {
  elements.diagnosisOptions.innerHTML = "";
  caseData.diagnosisOptions.forEach((option) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.textContent = option;
    button.addEventListener("click", () => chooseDiagnosis(option, button));
    elements.diagnosisOptions.append(button);
  });
}

function chooseDiagnosis(answer, button) {
  if (state.caseFinished) return;

  const isCorrect = answer === state.currentCase.correctAnswer;
  button.classList.add(isCorrect ? "is-correct" : "is-wrong");

  if (isCorrect) {
    state.score += Math.round(state.currentCase.points * 0.45);
    state.exp += 60;
    playSound("success");
    elements.feedback.textContent = `Poprawna diagnoza: ${state.currentCase.diagnosisExplanation}`;
    elements.stageLabel.textContent = "Naprawa";
    elements.repairSection.classList.remove("is-hidden");
    elements.diagnosisOptions.querySelectorAll("button").forEach((item) => {
      item.disabled = true;
      if (item.textContent === state.currentCase.correctAnswer) {
        item.classList.add("is-correct");
      }
    });
    renderRepairOptions(state.currentCase, false);
  } else {
    state.score -= 25;
    state.exp += 10;
    const penalty = applyMoneyPenalty();
    damageComputer(randomInt(4, 10));
    playSound("error");
    elements.feedback.textContent =
      `To nie jest najbardziej prawdopodobna przyczyna. Kara za błędną diagnozę: ${penalty} zł. Stan komputera spadł.`;
    button.disabled = true;
    if (state.computerHealth <= 0) {
      failCase("Komputer został uszkodzony przez zbyt wiele błędnych decyzji diagnostycznych.");
    }
  }

  saveProgress();
  updateStats();
}

function renderRepairOptions(caseData, disabled) {
  elements.repairOptions.innerHTML = "";
  const options = [
    ...caseData.repairSteps.map((step, index) => ({ ...step, correctIndex: index })),
    ...caseData.wrongRepairSteps.map((label) => ({ label, wrong: true })),
  ].sort((a, b) => a.label.localeCompare(b.label, "pl"));

  options.forEach((step) => {
    const button = document.createElement("button");
    button.className = "choice-button";
    button.textContent = step.label;
    button.disabled = disabled;
    button.addEventListener("click", () => chooseRepairStep(step, button));
    elements.repairOptions.append(button);
  });
}

function chooseRepairStep(step, button) {
  if (state.caseFinished) return;

  if (step.wrong) {
    state.score -= 20;
    state.exp += 5;
    const penalty = applyMoneyPenalty();
    damageComputer(randomInt(8, 18));
    playSound("error");
    button.classList.add("is-wrong");
    button.disabled = true;
    elements.feedback.textContent =
      `To działanie nie usuwa przyczyny awarii. Strata na zleceniu: ${penalty} zł. Komputer jest w gorszym stanie.`;
    updateStats();
    saveProgress();
    if (state.computerHealth <= 0) {
      failCase("Komputer został zepsuty podczas naprawy. Zlecenie zakończone porażką.");
    }
    return;
  }

  const expectedStep = state.completedSteps.size;
  if (step.correctIndex !== expectedStep) {
    state.score -= 15;
    const penalty = applyMoneyPenalty();
    damageComputer(randomInt(5, 12));
    playSound("error");
    button.classList.add("is-wrong");
    elements.feedback.textContent =
      `Ten krok jest potrzebny, ale nie teraz. Kara za złą kolejność: ${penalty} zł.`;
    updateStats();
    saveProgress();
    if (state.computerHealth <= 0) {
      failCase("Komputer nie wytrzymał chaotycznej naprawy. Zlecenie zakończone porażką.");
    }
    return;
  }

  state.completedSteps.add(step.correctIndex);
  state.repairProgress = Math.min(100, state.repairProgress + step.progress);
  state.computerHealth = Math.min(100, state.computerHealth + (step.healthBoost || 4));
  state.score += Math.round(state.currentCase.points * 0.18);
  state.exp += 45;
  playSound("success");
  button.classList.add("is-correct");
  button.disabled = true;
  elements.feedback.textContent = step.explanation;
  updateProgress();
  updateHealth();
  updateStats();
  saveProgress();

  if (state.repairProgress >= 100) {
    finishCase();
  }
}

function applyMoneyPenalty() {
  const penalty = randomInt(10, 30);
  state.caseEarnings -= penalty;
  return penalty;
}

function damageComputer(amount) {
  state.computerHealth = Math.max(0, state.computerHealth - amount);
  updateHealth();
}

function updateProgress() {
  elements.progressBar.style.width = `${state.repairProgress}%`;
  elements.progressValue.textContent = state.repairProgress;
}

function updateHealth() {
  elements.healthProgress.style.width = `${state.computerHealth}%`;
  elements.healthValue.textContent = `${state.computerHealth}%`;
  elements.healthProgress.classList.toggle("is-danger", state.computerHealth <= 30);
  elements.healthDescription.textContent = getHealthDescription();
}

function getHealthDescription() {
  if (state.computerHealth <= 0) return "Komputer jest zepsuty. Tego zlecenia nie da się już uratować.";
  if (state.computerHealth <= 30) return "Stan krytyczny. Kolejny błąd może całkiem zepsuć komputer.";
  if (state.computerHealth <= 60) return "Stan pogorszony. Pracuj ostrożnie i unikaj strzelania.";
  return "Stan stabilny. Poprawne kroki mogą go jeszcze poprawić.";
}

function updateStats() {
  const rank = getRank();
  elements.scoreValue.textContent = state.score;
  elements.expValue.textContent = state.exp;
  elements.rankValue.textContent = rank;
  elements.moneyValue.textContent = formatMoney(state.money);
  elements.caseEarningsValue.textContent = formatMoney(state.caseEarnings);
  elements.profileScore.textContent = state.score;
  elements.profileExp.textContent = state.exp;
  elements.profileRank.textContent = rank;
  elements.profileMoney.textContent = formatMoney(state.money);
}

function getRank() {
  return ranks.reduce((current, rank) => (state.exp >= rank.exp ? rank.name : current), ranks[0].name);
}

function finishCase() {
  state.caseFinished = true;
  state.finishedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  clearInterval(state.timerId);
  const bonus = Math.max(0, 60 - state.finishedSeconds);
  state.score += bonus;
  state.exp += 80;
  state.money += state.caseEarnings;
  playSound("finish");
  elements.stageLabel.textContent = "Zakończono";
  elements.feedback.textContent =
    `Zgłoszenie rozwiązane. Zarobek z tego komputera: ${formatMoney(state.caseEarnings)}.`;
  disableCaseButtons();

  const result = createResult("Naprawiono");
  saveRanking(result);
  renderReport(result);
  updateStats();
  saveProgress();
  renderRanking();
}

const FAIL_PENALTY = 70;

function failCase(reason) {
  state.caseFinished = true;
  state.finishedSeconds = Math.floor((Date.now() - state.startTime) / 1000);
  clearInterval(state.timerId);

  state.money += state.caseEarnings;

  state.money -= FAIL_PENALTY;

  state.score -= 40;

  playSound("error");
  elements.stageLabel.textContent = "Komputer zepsuty";
  elements.feedback.textContent =
    `${reason} Kara za zniszczenie komputera: -70 zł. Rozliczenie: ${formatMoney(state.caseEarnings)}.`;

  disableCaseButtons();
  const result = createResult("Zepsuto");
  saveRanking(result);
  renderReport(result);
  updateStats();
  saveProgress();
  renderRanking();
}

function createResult(status) {
  return {
    caseId: state.currentCase.id,
    title: state.currentCase.title,
    diagnosis: state.currentCase.correctAnswer,
    status,
    score: state.score,
    exp: state.exp,
    money: state.money,
    caseEarnings: state.caseEarnings,
    health: state.computerHealth,
    rank: getRank(),
    time: formatTime(state.finishedSeconds),
    date: new Date().toLocaleString("pl-PL"),
  };
}

function disableCaseButtons() {
  elements.diagnosisOptions.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
  elements.repairOptions.querySelectorAll("button").forEach((button) => {
    button.disabled = true;
  });
}

function renderReport(result) {
  elements.report.classList.remove("is-hidden");
  elements.reportContent.innerHTML = `
    <p><strong>Status:</strong> ${result.status}</p>
    <p><strong>Problem:</strong> ${result.title}</p>
    <p><strong>Przyczyna awarii:</strong> ${result.diagnosis}</p>
    <p><strong>Czas rozwiązania:</strong> ${result.time}</p>
    <p><strong>Stan komputera:</strong> ${result.health}%</p>
    <p><strong>Zarobek z tego zlecenia:</strong> ${formatMoney(result.caseEarnings)}</p>
    <p><strong>Saldo po zleceniu:</strong> ${formatMoney(result.money)}</p>
    <p><strong>Aktualne punkty:</strong> ${result.score}</p>
    <p><strong>Ranga:</strong> ${result.rank}</p>
    <p><strong>Ocena końcowa:</strong> ${getGrade(result.time, result.status)}</p>
  `;
}

function getGrade(time, status) {
  if (status === "Zepsuto") return "Zlecenie wymaga poprawy";
  const [minutes, seconds] = time.split(":").map(Number);
  const total = minutes * 60 + seconds;
  if (total <= 90 && state.caseEarnings >= 90) return "Wzorowa praca serwisowa";
  if (total <= 180) return "Bardzo dobra diagnoza";
  return "Poprawnie wykonana naprawa";
}

function saveReport() {
  const reportText = elements.reportContent.innerText;
  const blob = new Blob([`Raport PC Detective\n\n${reportText}`], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `raport-${state.currentCase.id}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

function startTimer() {
  clearInterval(state.timerId);
  state.timerId = setInterval(() => {
    if (state.caseFinished) return;
    const seconds = Math.floor((Date.now() - state.startTime) / 1000);
    elements.timer.textContent = formatTime(seconds);
  }, 1000);
}

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function formatMoney(value) {
  return `${value} zł`;
}

function renderKnowledge() {
  elements.knowledgeGrid.innerHTML = "";
  knowledge.forEach((item) => {
    const card = document.createElement("article");
    card.className = "knowledge-card";
    const tips = item.tips.map((tip) => `<li>${tip}</li>`).join("");
    card.innerHTML = `<h3>${item.title}</h3><p>${item.text}</p><ul>${tips}</ul>`;
    elements.knowledgeGrid.append(card);
  });
}

function saveRanking(result) {
  const ranking = getRanking();
  ranking.push(result);
  ranking.sort((a, b) => b.money - a.money || b.score - a.score);
  localStorage.setItem("pcDetectiveRanking", JSON.stringify(ranking.slice(0, 10)));
}

function getRanking() {
  return JSON.parse(localStorage.getItem("pcDetectiveRanking") || "[]");
}

function renderRanking() {
  const ranking = getRanking();
  elements.rankingList.innerHTML = "";

  if (ranking.length === 0) {
    elements.rankingList.innerHTML =
      '<article class="ranking-item">Brak wyników. Rozwiąż pierwsze zgłoszenie, aby pojawić się w rankingu.</article>';
    return;
  }

  ranking.forEach((item, index) => {
    const row = document.createElement("article");
    row.className = "ranking-item";
    row.innerHTML = `
      <strong>${index + 1}. ${item.rank}</strong>
      <span>${item.title}</span>
      <span>${item.status}</span>
      <span>${formatMoney(item.caseEarnings)}</span>
      <span>Saldo: ${formatMoney(item.money || 0)}</span>
      <span>${item.date}</span>
    `;
    elements.rankingList.append(row);
  });
}

function saveProgress() {
  localStorage.setItem(
    "pcDetectiveProgress",
    JSON.stringify({
      score: state.score,
      exp: state.exp,
      money: state.money,
      soundEnabled: state.soundEnabled,
    }),
  );
}

function loadProgress() {
  const progress = JSON.parse(localStorage.getItem("pcDetectiveProgress") || "{}");
  state.score = progress.score || 0;
  state.exp = progress.exp || 0;
  state.money = progress.money || 0;
  state.soundEnabled = progress.soundEnabled !== false;
  elements.soundToggle.checked = state.soundEnabled;
}

function clearProgress() {
  localStorage.removeItem("pcDetectiveProgress");
  localStorage.removeItem("pcDetectiveRanking");
  state.score = 0;
  state.exp = 0;
  state.money = 0;
  updateStats();
  renderRanking();
}

function playSound(type) {
  if (!state.soundEnabled) return;

  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  if (!state.audioContext) {
    state.audioContext = new AudioContext();
  }

  const now = state.audioContext.currentTime;
  const oscillator = state.audioContext.createOscillator();
  const gain = state.audioContext.createGain();
  const settings = {
    click: { frequency: 540, duration: 0.045, volume: 0.025 },
    success: { frequency: 880, duration: 0.11, volume: 0.04 },
    error: { frequency: 180, duration: 0.16, volume: 0.045 },
    finish: { frequency: 1040, duration: 0.18, volume: 0.05 },
  }[type];

  oscillator.type = type === "error" ? "sawtooth" : "sine";
  oscillator.frequency.setValueAtTime(settings.frequency, now);
  gain.gain.setValueAtTime(settings.volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + settings.duration);
  oscillator.connect(gain);
  gain.connect(state.audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + settings.duration);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

init();
