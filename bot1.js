diff --git a/C:\Users\PC\Documents\Playground\xai-spy-bot-fixed.js b/C:\Users\PC\Documents\Playground\xai-spy-bot-fixed.js
new file mode 100644
--- /dev/null
+++ b/C:\Users\PC\Documents\Playground\xai-spy-bot-fixed.js
@@ -0,0 +1,832 @@
+// ================================================================
+// XAI SPY GAME BOT - WOLF Live Platform
+// بوت لعبة الجاسوس لمنصة WOLF Live
+// ================================================================
+
+const WolfClient = require("wolf.js");
+const fs = require("fs");
+const path = require("path");
+
+// ------------------------------------------------
+// إعداد البوت / Bot Configuration
+// ------------------------------------------------
+const EMAIL = "scodoublet@yahoo.com";
+const PASSWORD = "12345";
+
+const POINTS_FILE = path.join(__dirname, "points.json");
+
+// ------------------------------------------------
+// قائمة الفواكه السرية / Secret Fruits List
+// ------------------------------------------------
+const fruits = [
+  "تفاح", "برتقال", "موز", "فراولة", "عنب", "كرز", "بطيخ", "مانجو", "أناناس", "خوخ",
+  "تين", "رمان", "جوافة", "كمثرى", "ليمون", "يوسفي", "مشمش", "شمام", "توت بري", "جوز الهند",
+  "أفوكادو", "برقوق", "فاكهة العاطفة", "توت", "لايمون", "توت العليق الأسود", "توت أزرق",
+  "جوز دراق", "بابايا", "كيوي", "ليمون أخضر", "تمر", "إجاص", "نارنج", "جريب فروت",
+  "توت العليق", "توت أسود", "دوريان", "فاكهة التنين", "جاك فروت", "رامبوتان", "ليتشي",
+  "كارامبولا", "سالاك", "كاكاو", "سفارجل", "بندق", "لوز", "كستناء", "صنوبر",
+  "أكاي", "أسيرولا", "أكي", "مانجو أفريقي", "أكيبي", "فراولة جبال الألب", "أماناتسو",
+  "أمارا", "أمباريلا", "تفاح أمبروزيا", "شمام أمبروزيا", "أملا", "أناناتو", "أنونا",
+  "تفاحة أمريكية", "مايابل", "أرونيا", "باذنجان أفريقي", "باشن فروت", "بيل بيري",
+  "بيغني", "بيلبيري", "بيلمبي", "بلاك أبل", "بلاك تشيري", "بلاك كورانت", "بلاك مولبيري",
+  "بلاك راسبيري", "بلاك سابوت", "بلاكبيري", "بلود أورانج", "بلو باسيون فروت", "بلو بيري",
+  "بريد فروت", "بروش تشيري", "بوذا هاند", "بورديكين بلوم", "بوشيل أند بيري", "جيلي بين",
+  "باتر فروت", "كاكتوس بير", "كالاباش", "كالامانسي", "كامو كامو", "كانيستيل", "كانتالوب",
+  "كيب غوسبيري", "كارا كارا", "كرامبولا", "كاريسا", "كاسكارا", "كاشو أبل", "كاتمون",
+  "كافيار لايم", "سيدار باي تشيري", "سيمليديك", "تشيمبيداك", "سييلون غوسبيري",
+  "تشاريتتشويلو", "تشايوتي", "تشيريمويا", "تشيري بلوم", "تشيكو فروت", "تشوكولات فروت",
+  "تشوكبيري", "تشوكتشيري", "سيترون", "كليمنتين", "كلودبيري", "كلستر فيغ", "كوكي أبل",
+  "كوكو دي مير", "كوكو بلوم", "كوكونات", "كوفي تشيري", "كورنيليان تشيري", "كراب أبل",
+  "كرانبيري", "كروبيري", "كومكوات", "كوبواكو", "كورانت", "كاستارد أبل", "داباي",
+  "دامسون", "دامسون بلوم", "دانغل بيري", "دارلينغ بلوم", "ديت", "ديت بلوم",
+  "دافيدسونز بلوم", "ديد مانز فينغرز", "ديكايزنيا", "دوبل كوكونات", "دراكونتو ميلون",
+  "دراغون فروت", "دوكو"
+];
+
+// ------------------------------------------------
+// حالة اللعبة / Game State
+// ------------------------------------------------
+let gameState = {
+  active: false,
+  autoMode: false,
+  language: "ar",
+  creatorId: null,
+  groupId: null,
+  players: [],
+  spyId: null,
+  secretFruit: null,
+  phase: "idle", // 'idle' | 'joining' | 'voting' | 'result' | 'waiting_continue'
+  timers: []
+};
+
+// ------------------------------------------------
+// نظام النقاط / Points System
+// ------------------------------------------------
+function loadPoints() {
+  try {
+    if (!fs.existsSync(POINTS_FILE)) {
+      fs.writeFileSync(POINTS_FILE, "{}", "utf8");
+      return {};
+    }
+    const raw = fs.readFileSync(POINTS_FILE, "utf8");
+    return JSON.parse(raw);
+  } catch (e) {
+    console.error("[Points] Error loading points:", e.message);
+    return {};
+  }
+}
+
+function savePoints(data) {
+  try {
+    fs.writeFileSync(POINTS_FILE, JSON.stringify(data, null, 2), "utf8");
+  } catch (e) {
+    console.error("[Points] Error saving points:", e.message);
+  }
+}
+
+function getPlayerPoints(userId) {
+  const db = loadPoints();
+  return db[userId] ? db[userId].totalPoints : 0;
+}
+
+function updatePlayerPoints(userId, nickname, delta) {
+  const db = loadPoints();
+  if (!db[userId]) db[userId] = { nickname, totalPoints: 0 };
+  db[userId].nickname = nickname;
+  db[userId].totalPoints = (db[userId].totalPoints || 0) + delta;
+  savePoints(db);
+}
+
+function getTopPlayers(limit = 10) {
+  const db = loadPoints();
+  return Object.entries(db)
+    .map(([id, val]) => ({
+      id,
+      nickname: val.nickname,
+      totalPoints: val.totalPoints || 0
+    }))
+    .sort((a, b) => b.totalPoints - a.totalPoints)
+    .slice(0, limit);
+}
+
+function getGlobalRank(userId) {
+  const db = loadPoints();
+  const sorted = Object.entries(db)
+    .map(([id, val]) => ({ id, totalPoints: val.totalPoints || 0 }))
+    .sort((a, b) => b.totalPoints - a.totalPoints);
+  const idx = sorted.findIndex((p) => p.id == userId);
+  return idx === -1 ? null : idx + 1;
+}
+
+// ------------------------------------------------
+// دوال مساعدة / Helper Functions
+// ------------------------------------------------
+function getRandomFruit() {
+  return fruits[Math.floor(Math.random() * fruits.length)];
+}
+
+function getRandomSpy(players) {
+  return players[Math.floor(Math.random() * players.length)].id;
+}
+
+function clearTimers() {
+  gameState.timers.forEach((t) => clearTimeout(t));
+  gameState.timers = [];
+}
+
+function resetGame() {
+  clearTimers();
+  gameState = {
+    active: false,
+    autoMode: false,
+    language: "ar",
+    creatorId: null,
+    groupId: null,
+    players: [],
+    spyId: null,
+    secretFruit: null,
+    phase: "idle",
+    timers: []
+  };
+}
+
+function buildPlayersList(players, language) {
+  const header = language === "en" ? "🕵️ Players List:" : "🕵️ قائمة اللاعبين:";
+  const lines = players.map((p, i) => `${i + 1}- ${p.id} | ${p.nickname}`);
+  return `${header}\n${lines.join("\n")}`;
+}
+
+async function sendGroupMessage(client, groupId, message) {
+  try {
+    await client.messaging.sendMessage("group", groupId, message);
+  } catch (e) {
+    console.error("[Send] Group message error:", e.message);
+  }
+}
+
+async function sendPrivateMessage(client, userId, message) {
+  try {
+    await client.messaging.sendMessage("private", userId, message);
+  } catch (e) {
+    console.error("[Send] Private message error:", e.message);
+  }
+}
+
+// ------------------------------------------------
+// إنشاء لعبة جديدة / New Game Handler
+// ------------------------------------------------
+async function handleNewGame(client, message, language) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+
+  if (gameState.active) {
+    const msg = language === "en"
+      ? "❌ A game is already running. End it first with !spy end"
+      : "❌ يوجد لعبة نشطة بالفعل. أنهِها أولاً بـ !جاسوس انهاء";
+    return sendGroupMessage(client, groupId, msg);
+  }
+
+  resetGame();
+  gameState.active = true;
+  gameState.language = language;
+  gameState.creatorId = sourceId;
+  gameState.groupId = groupId;
+  gameState.phase = "joining";
+
+  console.log(`[Game] New game created by ${sourceId} in group ${groupId} (lang: ${language})`);
+
+  const msg = language === "en"
+    ? "/me Come on, sweeties, we've started the game. Join with: !spy join"
+    : '/me يلا يا حلوين بدينا اللعبه انظموا للعبه بالأمر هذا "!جاسوس انظم" او "!جس انظم"';
+  await sendGroupMessage(client, groupId, msg);
+
+  const t = setTimeout(async () => {
+    if (gameState.active && gameState.phase === "joining" && gameState.groupId === groupId) {
+      console.log("[Timer] Auto-closing due to inactivity (joining phase)");
+      const closeMsg = language === "en"
+        ? "/me Game closed due to inactivity ⏰"
+        : "/me تم إغلاق اللعبة تلقائياً بسبب عدم النشاط ⏰";
+      await sendGroupMessage(client, groupId, closeMsg);
+      resetGame();
+    }
+  }, 5 * 60 * 1000);
+  gameState.timers.push(t);
+}
+
+// ------------------------------------------------
+// الانضمام للعبة / Join Game Handler
+// ------------------------------------------------
+async function handleJoin(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const language = gameState.language;
+
+  if (!gameState.active || gameState.phase !== "joining") {
+    const msg = language === "en"
+      ? "❌ No game is currently accepting players."
+      : "❌ لا توجد لعبة تقبل لاعبين الآن.";
+    return sendGroupMessage(client, groupId, msg);
+  }
+
+  if (gameState.players.find((p) => p.id === sourceId)) {
+    const msg = language === "en"
+      ? "❌ You have already joined the game."
+      : "❌ أنت منضم بالفعل في اللعبة.";
+    return sendGroupMessage(client, groupId, msg);
+  }
+
+  let nickname = `User_${sourceId}`;
+  try {
+    const profile = await client.subscriber.getById(sourceId);
+    if (profile && profile.nickname) nickname = profile.nickname;
+  } catch (e) {
+    console.error("[Join] Error fetching profile:", e.message);
+  }
+
+  const savedPoints = getPlayerPoints(sourceId);
+  gameState.players.push({
+    id: sourceId,
+    nickname,
+    points: savedPoints,
+    hasVoted: false,
+    vote: null,
+    hasBet: false,
+    betTarget: null,
+    betAmount: 0,
+    waitingForBet: false
+  });
+
+  console.log(`[Join] ${nickname} (${sourceId}) joined the game`);
+
+  const msg = language === "en"
+    ? `✅ ${nickname} has joined the game! Total players: ${gameState.players.length}`
+    : `✅ ${nickname} انضم للعبة! عدد اللاعبين: ${gameState.players.length}`;
+  await sendGroupMessage(client, groupId, msg);
+}
+
+// ------------------------------------------------
+// بدء اللعبة / Start Game Handler
+// ------------------------------------------------
+async function handleStart(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const language = gameState.language;
+
+  if (!gameState.active) {
+    return sendGroupMessage(client, groupId, language === "en" ? "❌ No active game." : "❌ لا توجد لعبة نشطة.");
+  }
+  if (sourceId !== gameState.creatorId) {
+    return sendGroupMessage(client, groupId, language === "en" ? "❌ Only the game creator can start." : "❌ فقط منشئ اللعبة يمكنه البدء.");
+  }
+  if (gameState.phase !== "joining") {
+    return sendGroupMessage(client, groupId, language === "en" ? "❌ Game already started." : "❌ اللعبة بدأت بالفعل.");
+  }
+  if (gameState.players.length < 2) {
+    return sendGroupMessage(client, groupId, language === "en" ? "❌ Need at least 2 players to start." : "❌ يجب وجود لاعبين على الأقل للبدء.");
+  }
+
+  await startRound(client, groupId, language);
+}
+
+// ------------------------------------------------
+// بدء جولة جديدة
+// ------------------------------------------------
+async function startRound(client, groupId, language) {
+  clearTimers();
+  gameState.phase = "voting";
+  gameState.secretFruit = getRandomFruit();
+  gameState.spyId = getRandomSpy(gameState.players);
+
+  gameState.players = gameState.players.map((p) => ({
+    ...p,
+    hasVoted: false,
+    vote: null,
+    hasBet: false,
+    betTarget: null,
+    betAmount: 0,
+    waitingForBet: false
+  }));
+
+  console.log(`[Round] Starting round. Fruit: ${gameState.secretFruit}, Spy: ${gameState.spyId}`);
+
+  for (const player of gameState.players) {
+    if (player.id !== gameState.spyId) {
+      const pm = language === "en"
+        ? `The secret word is: ${gameState.secretFruit} 🍎`
+        : `كلمة السر هي: ${gameState.secretFruit} 🍎`;
+      await sendPrivateMessage(client, player.id, pm);
+    }
+  }
+
+  const spyMsg = language === "en"
+    ? "You're the spy. Mislead others and avoid being discovered 🥴"
+    : "إنت الجاسوس، لفّها عليهم وخليهم ما يكتشفونك 🥴";
+  await sendPrivateMessage(client, gameState.spyId, spyMsg);
+
+  const listMsg = buildPlayersList(gameState.players, language);
+  await sendGroupMessage(client, groupId, listMsg);
+
+  const voteInstructions = language === "en"
+    ? "🗳️ Vote for who you think is the spy! Send the player's number."
+    : "🗳️ صوّت لمن تعتقد أنه الجاسوس! أرسل رقم اللاعب.";
+  await sendGroupMessage(client, groupId, voteInstructions);
+
+  const tNoVote = setTimeout(async () => {
+    if (gameState.active && gameState.phase === "voting") {
+      const hasAnyVote = gameState.players.some((p) => p.hasVoted);
+      if (!hasAnyVote) {
+        console.log("[Timer] No votes received, closing game");
+        const msg = language === "en"
+          ? "/me Game closed: no one voted ⏰"
+          : "/me تم إغلاق اللعبة: لم يصوّت أحد ⏰";
+        await sendGroupMessage(client, groupId, msg);
+        resetGame();
+      }
+    }
+  }, 5 * 60 * 1000);
+  gameState.timers.push(tNoVote);
+
+  const tKickNonVoters = setTimeout(async () => {
+    if (gameState.active && gameState.phase === "voting") {
+      const nonVoters = gameState.players.filter((p) => !p.hasVoted);
+      if (nonVoters.length > 0 && gameState.players.some((p) => p.hasVoted)) {
+        console.log(`[Timer] Kicking ${nonVoters.length} non-voters`);
+        const kickNames = nonVoters.map((p) => p.nickname).join(", ");
+        const kickMsg = language === "en"
+          ? `/me Kicking players who didn't vote: ${kickNames}`
+          : `/me طرد اللاعبين الذين لم يصوتوا: ${kickNames}`;
+        await sendGroupMessage(client, groupId, kickMsg);
+        gameState.players = gameState.players.filter((p) => p.hasVoted);
+        if (gameState.players.length >= 1) {
+          await revealSpy(client, groupId, language);
+        } else {
+          await sendGroupMessage(client, groupId, language === "en" ? "/me No votes remain, game ended." : "/me لا أصوات متبقية، انتهت اللعبة.");
+          resetGame();
+        }
+      }
+    }
+  }, 4 * 60 * 1000);
+  gameState.timers.push(tKickNonVoters);
+}
+
+// ------------------------------------------------
+// معالجة التصويت والمراهنة
+// ------------------------------------------------
+async function handleVoteAndBet(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const content = (message.body || message.content || "").trim();
+  const language = gameState.language;
+
+  if (!gameState.active || gameState.phase !== "voting") return;
+
+  const player = gameState.players.find((p) => p.id === sourceId);
+  if (!player) return;
+
+  if (player.waitingForBet) {
+    const amount = parseInt(content, 10);
+    if (isNaN(amount) || amount < 0) return;
+
+    const maxBet = player.points;
+    const actualBet = Math.min(amount, maxBet);
+    player.betAmount = actualBet;
+    player.hasBet = true;
+    player.waitingForBet = false;
+
+    const targetIndex = gameState.players.findIndex((p) => p.id === player.betTarget) + 1;
+    const targetName = gameState.players.find((p) => p.id === player.betTarget)?.nickname || "?";
+
+    const betConfirm = language === "en"
+      ? `/me You bet ${actualBet} points on player #${targetIndex} (${targetName}) 🎲`
+      : `/me راهنت بـ ${actualBet} نقطة على اللاعب رقم ${targetIndex} (${targetName}) 🎲`;
+    await sendGroupMessage(client, groupId, betConfirm);
+
+    await checkVotingComplete(client, groupId, language);
+    return;
+  }
+
+  const voteNum = parseInt(content, 10);
+  if (isNaN(voteNum) || voteNum < 1 || voteNum > gameState.players.length) return;
+  if (player.hasVoted) return;
+
+  const targetPlayer = gameState.players[voteNum - 1];
+  if (!targetPlayer) return;
+
+  player.hasVoted = true;
+  player.vote = targetPlayer.id;
+
+  console.log(`[Vote] ${player.nickname} voted for ${targetPlayer.nickname}`);
+
+  const voteAck = language === "en"
+    ? `/me ${player.nickname} voted for player #${voteNum} (${targetPlayer.nickname}) ✅`
+    : `/me ${player.nickname} صوّت على اللاعب رقم ${voteNum} (${targetPlayer.nickname}) ✅`;
+  await sendGroupMessage(client, groupId, voteAck);
+
+  player.betTarget = targetPlayer.id;
+  player.waitingForBet = true;
+  const betPrompt = language === "en"
+    ? "/me Send the amount of points you are betting (0 to skip)"
+    : "/me ارسل كمية النقاط الي بتراهن فيها (0 للتخطي)";
+  await sendGroupMessage(client, groupId, betPrompt);
+}
+
+// ------------------------------------------------
+// التحقق من اكتمال التصويت
+// ------------------------------------------------
+async function checkVotingComplete(client, groupId, language) {
+  const allDone = gameState.players.every((p) => p.hasVoted && !p.waitingForBet);
+  if (allDone) {
+    await revealSpy(client, groupId, language);
+  }
+}
+
+// ------------------------------------------------
+// كشف الجاسوس وحساب النقاط
+// ------------------------------------------------
+async function revealSpy(client, groupId, language) {
+  clearTimers();
+  gameState.phase = "result";
+
+  const spy = gameState.players.find((p) => p.id === gameState.spyId);
+  if (!spy) {
+    await sendGroupMessage(client, groupId, "⚠️ Error: spy not found.");
+    resetGame();
+    return;
+  }
+
+  const revealMsg = language === "en"
+    ? `/alert This is the traitor:\n${spy.id} | ${spy.nickname}`
+    : `/alert هذا هو الخاين البواق:\n${spy.id} | ${spy.nickname}`;
+  await sendGroupMessage(client, groupId, revealMsg);
+
+  const secretMsg = language === "en"
+    ? `🍎 The secret word was: ${gameState.secretFruit}`
+    : `🍎 كلمة السر كانت: ${gameState.secretFruit}`;
+  await sendGroupMessage(client, groupId, secretMsg);
+
+  for (const player of gameState.players) {
+    if (player.vote === gameState.spyId) {
+      player.points += 1;
+      updatePlayerPoints(player.id, player.nickname, 1);
+    }
+    if (player.id === gameState.spyId) {
+      const detectedBy = gameState.players.filter((p) => p.vote === gameState.spyId && p.id !== gameState.spyId).length;
+      if (detectedBy > 0) {
+        const penalty = -detectedBy;
+        player.points += penalty;
+        updatePlayerPoints(player.id, player.nickname, penalty);
+      }
+    }
+  }
+
+  for (const bettor of gameState.players) {
+    if (!bettor.hasBet || bettor.betAmount <= 0) continue;
+    const target = gameState.players.find((p) => p.id === bettor.betTarget);
+    if (!target) continue;
+
+    const bettorCorrect = bettor.vote === gameState.spyId;
+
+    if (bettorCorrect) {
+      bettor.points += bettor.betAmount * 2;
+      target.points -= bettor.betAmount;
+      updatePlayerPoints(bettor.id, bettor.nickname, bettor.betAmount * 2);
+      updatePlayerPoints(target.id, target.nickname, -bettor.betAmount);
+    } else {
+      bettor.points -= bettor.betAmount * 2;
+      target.points += bettor.betAmount;
+      updatePlayerPoints(bettor.id, bettor.nickname, -(bettor.betAmount * 2));
+      updatePlayerPoints(target.id, target.nickname, bettor.betAmount);
+    }
+  }
+
+  const pointsSummary = gameState.players
+    .map((p) => `${p.nickname}: ${p.points >= 0 ? "+" : ""}${p.points} 📊`)
+    .join("\n");
+  const summaryHeader = language === "en" ? "📊 Round Summary:\n" : "📊 ملخص الجولة:\n";
+  await sendGroupMessage(client, groupId, summaryHeader + pointsSummary);
+
+  if (gameState.autoMode) {
+    await sendGroupMessage(client, groupId, language === "en" ? "/me Starting new round automatically... 🔄" : "/me جولة جديدة تبدأ تلقائياً... 🔄");
+    setTimeout(() => {
+      startRound(client, groupId, language).catch((err) => {
+        console.error("[Round] Auto-start error:", err.message);
+      });
+    }, 3000);
+  } else {
+    gameState.phase = "waiting_continue";
+    const continueMsg = language === "en"
+      ? "/me Send 1 to continue, or 2 to end the game."
+      : "/me اذا ودك تكمل اللعبه ارسل رقم 1 او اذا مالك خاطر ارسل رقم 2";
+    await sendGroupMessage(client, groupId, continueMsg);
+  }
+}
+
+// ------------------------------------------------
+// معالجة الاستمرار أو الإنهاء
+// ------------------------------------------------
+async function handleContinue(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const content = (message.body || message.content || "").trim();
+  const language = gameState.language;
+
+  if (!gameState.active || gameState.phase !== "waiting_continue") return;
+  if (sourceId !== gameState.creatorId) return;
+
+  if (content === "1") {
+    await startRound(client, groupId, language);
+  } else if (content === "2") {
+    const byeMsg = language === "en"
+      ? "/me Thanks for playing! Game ended. 👋"
+      : "/me شكراً للعب! انتهت اللعبة. 👋";
+    await sendGroupMessage(client, groupId, byeMsg);
+    resetGame();
+  }
+}
+
+// ------------------------------------------------
+// طرد لاعب / Kick Player Handler
+// ------------------------------------------------
+async function handleKick(client, message, playerNum) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const language = gameState.language;
+
+  if (!gameState.active) return;
+  if (sourceId !== gameState.creatorId) {
+    return sendGroupMessage(client, groupId, language === "en" ? "❌ Only the creator can kick players." : "❌ فقط المنشئ يمكنه طرد اللاعبين.");
+  }
+
+  const idx = parseInt(playerNum, 10) - 1;
+  if (isNaN(idx) || idx < 0 || idx >= gameState.players.length) {
+    return sendGroupMessage(client, groupId, language === "en" ? "❌ Invalid player number." : "❌ رقم لاعب غير صحيح.");
+  }
+
+  const kicked = gameState.players.splice(idx, 1)[0];
+  console.log(`[Kick] ${kicked.nickname} kicked from game`);
+
+  const msg = language === "en"
+    ? `/me ${kicked.nickname} has been kicked from the game.`
+    : `/me تم طرد ${kicked.nickname} من اللعبة.`;
+  await sendGroupMessage(client, groupId, msg);
+}
+
+// ------------------------------------------------
+// ترتيب اللاعبين
+// ------------------------------------------------
+async function handleRank(client, message) {
+  const groupId = message.targetId;
+  const language = gameState.language;
+
+  const top = getTopPlayers(10);
+  if (!top.length) {
+    return sendGroupMessage(client, groupId, language === "en" ? "No ranking data yet." : "لا توجد بيانات ترتيب بعد.");
+  }
+
+  const header = language === "en" ? "🏆 Top 10 Players:\n" : "🏆 أفضل 10 لاعبين في الغرفة:\n";
+  const lines = top.map((p, i) =>
+    `${i + 1}- ${p.id} | ${p.nickname} | ${p.totalPoints} ${language === "en" ? "points" : "نقطة"}`
+  );
+  await sendGroupMessage(client, groupId, header + lines.join("\n"));
+}
+
+// ------------------------------------------------
+// الترتيب العام
+// ------------------------------------------------
+async function handleGeneral(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const language = gameState.language;
+
+  const rank = getGlobalRank(sourceId);
+  const msg = rank !== null
+    ? (language === "en" ? `Your global rank: ${rank} 🌍` : `ترتيبك العام: ${rank} 🌍`)
+    : (language === "en" ? "You have no ranking data yet." : "لا توجد بيانات ترتيب لك بعد.");
+  await sendGroupMessage(client, groupId, msg);
+}
+
+// ------------------------------------------------
+// مجموع النقاط
+// ------------------------------------------------
+async function handleTotal(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const language = gameState.language;
+
+  const pts = getPlayerPoints(sourceId);
+  const msg = language === "en"
+    ? `Your total points: ${pts} ✨`
+    : `مجموع نقاطك: ${pts} نقطة ✨`;
+  await sendGroupMessage(client, groupId, msg);
+}
+
+// ------------------------------------------------
+// الوضع التلقائي
+// ------------------------------------------------
+async function handleAutoMode(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const language = gameState.language;
+
+  if (!gameState.active) return;
+  if (sourceId !== gameState.creatorId) return;
+
+  gameState.autoMode = true;
+  const msg = language === "en"
+    ? "/me Auto mode activated! 🤖 New rounds will start automatically."
+    : "/me تم تفعيل الوضع التلقائي! 🤖 ستبدأ الجولات تلقائياً.";
+  await sendGroupMessage(client, groupId, msg);
+}
+
+// ------------------------------------------------
+// إيقاف الوضع التلقائي
+// ------------------------------------------------
+async function handleStop(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const language = gameState.language;
+
+  if (!gameState.active) return;
+  if (sourceId !== gameState.creatorId) return;
+
+  gameState.autoMode = false;
+  const msg = language === "en"
+    ? "/me Auto mode deactivated. The game will ask before starting a new round."
+    : "/me تم إيقاف الوضع التلقائي. ستسأل اللعبة قبل بدء جولة جديدة.";
+  await sendGroupMessage(client, groupId, msg);
+}
+
+// ------------------------------------------------
+// إنهاء اللعبة
+// ------------------------------------------------
+async function handleEnd(client, message) {
+  const groupId = message.targetId;
+  const sourceId = message.sourceId;
+  const language = gameState.language || "ar";
+
+  if (!gameState.active) return;
+  if (sourceId !== gameState.creatorId) {
+    return sendGroupMessage(client, groupId, language === "en" ? "❌ Only the creator can end the game." : "❌ فقط المنشئ يمكنه إنهاء اللعبة.");
+  }
+
+  const msg = language === "en"
+    ? "/me Game ended by the creator. 🏁"
+    : "/me تم إنهاء اللعبة من قِبل المنشئ. 🏁";
+  await sendGroupMessage(client, groupId, msg);
+  resetGame();
+}
+
+// ------------------------------------------------
+// قائمة المساعدة
+// ------------------------------------------------
+async function handleHelp(client, message, language) {
+  const groupId = message.targetId;
+
+  if (language === "en") {
+    const help = [
+      "/me 🕵️ Spy Game Commands:",
+      `!spy new - start a new game`,
+      `!spy join - join the game`,
+      `!spy start - start the round`,
+      `!spy kick <number> - kick a player`,
+      `!spy rank - show room ranking`,
+      `!spy general or !spy gl - show global rank`,
+      `!spy total - show your points`,
+      `!spy auto - enable auto rounds`,
+      `!spy stop - disable auto rounds`,
+      `!spy end - end game`,
+      `!spy help - show help`
+    ].join("\n");
+    await sendGroupMessage(client, groupId, help);
+  } else {
+    const help = [
+      "/me 🕵️ قائمة أوامر لعبة الجاسوس:",
+      `!جاسوس جديد أو !جس جديد - بدء لعبة جديدة`,
+      `!جاسوس انظم أو !جس انظم - الانضمام للعبة`,
+      `!جاسوس بدء أو !جس بدء - بدء اللعبة`,
+      `!جاسوس طرد <رقم> - طرد لاعب`,
+      `!جاسوس ترتيب أو !جس ترتيب - ترتيب اللاعبين`,
+      `!جاسوس عام أو !جس عام - الترتيب العام`,
+      `!جاسوس مجموع أو !جس مجموع - مجموع نقاطك`,
+      `!جاسوس تلقائي أو !جس تلقائي - تفعيل التلقائي`,
+      `!جاسوس توقف أو !جس توقف - إيقاف التلقائي`,
+      `!جاسوس انهاء أو !جس انهاء - إنهاء اللعبة`,
+      `!جاسوس مساعده/مساعدة أو !جس مساعده/مساعدة - المساعدة`
+    ].join("\n");
+    await sendGroupMessage(client, groupId, help);
+  }
+}
+
+// ------------------------------------------------
+// معالج الرسائل الرئيسي
+// ------------------------------------------------
+async function onMessage(client, message) {
+  if (!message.targetId) return;
+
+  const body = (message.body || message.content || "").trim();
+  if (!body) return;
+
+  const lower = body.toLowerCase();
+
+  if (body === "!جاسوس جديد" || body === "!جس جديد") return handleNewGame(client, message, "ar");
+  if (lower === "!spy new") return handleNewGame(client, message, "en");
+
+  if (body === "!جاسوس انظم" || body === "!جس انظم" || lower === "!spy join") return handleJoin(client, message);
+
+  if (body === "!جاسوس بدء" || body === "!جس بدء" || lower === "!spy start") return handleStart(client, message);
+
+  const kickArMatch = body.match(/^!(?:جاسوس|جس) طرد (\d+)$/);
+  if (kickArMatch) return handleKick(client, message, kickArMatch[1]);
+  const kickEnMatch = lower.match(/^!spy kick (\d+)$/);
+  if (kickEnMatch) return handleKick(client, message, kickEnMatch[1]);
+
+  if (body === "!جاسوس ترتيب" || body === "!جس ترتيب" || lower === "!spy rank") return handleRank(client, message);
+  if (body === "!جاسوس عام" || body === "!جس عام" || lower === "!spy general" || lower === "!spy gl") return handleGeneral(client, message);
+  if (body === "!جاسوس مجموع" || body === "!جس مجموع" || lower === "!spy total") return handleTotal(client, message);
+
+  if (body === "!جاسوس تلقائي" || body === "!جس تلقائي" || lower === "!spy auto") return handleAutoMode(client, message);
+  if (body === "!جاسوس توقف" || body === "!جس توقف" || lower === "!spy stop") return handleStop(client, message);
+
+  if (body === "!جاسوس انهاء" || body === "!جس انهاء" || lower === "!spy end") return handleEnd(client, message);
+
+  if (
+    body === "!جاسوس مساعده" ||
+    body === "!جاسوس مساعدة" ||
+    body === "!جس مساعده" ||
+    body === "!جس مساعدة"
+  ) return handleHelp(client, message, "ar");
+  if (lower === "!spy help") return handleHelp(client, message, "en");
+
+  if (gameState.active) {
+    if (gameState.phase === "voting") {
+      await handleVoteAndBet(client, message);
+    } else if (gameState.phase === "waiting_continue") {
+      await handleContinue(client, message);
+    }
+  }
+}
+
+// ------------------------------------------------
+// مؤقت مغادرة القناة (أسبوع من عدم النشاط)
+// ------------------------------------------------
+let inactivityTimer = null;
+
+function resetInactivityTimer(client) {
+  if (inactivityTimer) clearTimeout(inactivityTimer);
+  inactivityTimer = setTimeout(async () => {
+    console.log("[Inactivity] One week without activity. Shutting down bot...");
+    try {
+      if (typeof client.disconnect === "function") await client.disconnect();
+    } catch (e) {
+      console.error("[Inactivity] Error disconnecting:", e.message);
+    }
+    process.exit(0);
+  }, 7 * 24 * 60 * 60 * 1000);
+}
+
+// ------------------------------------------------
+// تهيئة وتشغيل البوت
+// ------------------------------------------------
+async function main() {
+  console.log("[Bot] Starting XAI Spy Game Bot...");
+
+  const client = new WolfClient();
+
+  client.on("ready", async () => {
+    console.log("[Bot] ✅ Bot is ready and connected!");
+    resetInactivityTimer(client);
+  });
+
+  client.on("message", async (message) => {
+    try {
+      resetInactivityTimer(client);
+      if (message.isGroup === true) {
+        await onMessage(client, message);
+      }
+    } catch (err) {
+      console.error("[Message] Unhandled error:", err.message, err.stack);
+    }
+  });
+
+  client.on("disconnected", () => {
+    console.log("[Bot] ⚠️ Disconnected. Attempting to reconnect...");
+  });
+
+  client.on("error", (err) => {
+    console.error("[Bot] Error:", err.message);
+  });
+
+  try {
+    await client.login(EMAIL, PASSWORD);
+    console.log("[Bot] 🔐 Login initiated...");
+  } catch (err) {
+    console.error("[Bot] ❌ Login failed:", err.message);
+    process.exit(1);
+  }
+}
+
+main().catch((err) => {
+  console.error("[Fatal] Bot crashed:", err.message, err.stack);
+  process.exit(1);
+});
+
