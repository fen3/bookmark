/* ============================================================
 * 星愿卡牌 v0.1
 * 纯前端卡牌养成小游戏：抽卡 → 养成 → 编队 → 战斗 → 资源
 * 所有数值集中在下方配置区，改动后刷新即可生效。
 * ============================================================ */
'use strict';

/* ============================================================
 * 一、配置区
 * ============================================================ */

const SAVE_KEY = 'cardGame';
const VERSION = 1;

const SOFT_PITY = 50;          // 累计抽数软保底（必出 4★）
const BASE_LEVEL_CAP = 20;     // 初始等级上限
const LEVEL_CAP_PER_STAR = 5;  // 每颗星提升的等级上限
const STAR_COST = [1, 2, 4, 8];// 升星所需碎片（0→1星格，最多 4 次升星）
const DUP_SHARDS = { 1: 1, 2: 2, 3: 3, 4: 5 }; // 重复卡转化的碎片数
const MAX_STAR = 4;            // 内部星级 0-4，展示为 1-5 星

const RARITY = {
    1: { name: '普通' },
    2: { name: '稀有' },
    3: { name: '史诗' },
    4: { name: '传说' }
};

// 卡牌配置（只读）。skill 目前为展示文本，战斗按战力结算。
const CARDS = [
    { id: 'fire', name: '火史莱姆', rarity: 1, emoji: '🔥', atk: 8, hp: 40, skill: '喷吐火星，灼热但很可爱。' },
    { id: 'water', name: '水泡泡', rarity: 1, emoji: '💧', atk: 7, hp: 45, skill: '鼓起泡泡，替同伴挡下一击。' },
    { id: 'grass', name: '草叶精', rarity: 1, emoji: '🌿', atk: 8, hp: 42, skill: '在草地里几乎无法被发现。' },
    { id: 'rock', name: '石墩墩', rarity: 1, emoji: '🪨', atk: 6, hp: 50, skill: '很硬，非常硬，硬得有点过分。' },
    { id: 'wind', name: '风团子', rarity: 1, emoji: '🌪️', atk: 9, hp: 36, skill: '转起来时会把自己也吹晕。' },
    { id: 'bug', name: '小甲虫', rarity: 1, emoji: '🐛', atk: 7, hp: 44, skill: '壳很亮，梦想是长出一对翅膀。' },

    { id: 'ice', name: '冰精灵', rarity: 2, emoji: '❄️', atk: 14, hp: 55, skill: '呼出的寒气能把水洼冻成镜子。' },
    { id: 'wolf', name: '影狼', rarity: 2, emoji: '🐺', atk: 16, hp: 50, skill: '从阴影里出击，只留下脚印。' },
    { id: 'mushroom', name: '毒蘑菇', rarity: 2, emoji: '🍄', atk: 13, hp: 58, skill: '看起来很好吃，千万别尝。' },
    { id: 'bat', name: '夜蝠', rarity: 2, emoji: '🦇', atk: 15, hp: 48, skill: '夜里视力极好，白天全靠撞。' },
    { id: 'cat', name: '招财猫', rarity: 2, emoji: '🐱', atk: 12, hp: 60, skill: '据说摸一摸它的爪子会有好运。' },

    { id: 'thunder', name: '雷鸟', rarity: 3, emoji: '⚡', atk: 22, hp: 70, skill: '振翅时云层会发出低鸣。' },
    { id: 'knight', name: '见习骑士', rarity: 3, emoji: '🛡️', atk: 20, hp: 78, skill: '誓言还没背熟，但盾举得很稳。' },
    { id: 'witch', name: '森林女巫', rarity: 3, emoji: '🧙‍♀️', atk: 24, hp: 62, skill: '药水瓶里装的大概不是药。' },
    { id: 'golem', name: '岩石巨人', rarity: 3, emoji: '🗿', atk: 18, hp: 90, skill: '走一步，地面抖三抖。' },

    { id: 'dragon', name: '幼龙', rarity: 4, emoji: '🐉', atk: 35, hp: 100, skill: '还不会喷火，打喷嚏倒是很响。' },
    { id: 'phoenix', name: '不死鸟', rarity: 4, emoji: '🦅', atk: 38, hp: 88, skill: '每一次坠落，都是为了再飞一次。' },
    { id: 'reaper', name: '死神侍从', rarity: 4, emoji: '💀', atk: 33, hp: 105, skill: '加班太多，已经开始讨厌夜晚。' }
];

const CARD_MAP = Object.fromEntries(CARDS.map(c => [c.id, c]));

// 关卡配置（只读）。线性解锁，首通奖励只发一次。
const STAGES = [
    { id: 1, name: '新手草原', power: 120, firstReward: { gem: 5 }, reward: { coin: 100, ticket: 1 } },
    { id: 2, name: '幽暗森林', power: 260, firstReward: { gem: 5 }, reward: { coin: 140, ticket: 1 } },
    { id: 3, name: '碎石矿洞', power: 420, firstReward: { gem: 5 }, reward: { coin: 180, ticket: 1 } },
    { id: 4, name: '潮汐海湾', power: 650, firstReward: { gem: 10 }, reward: { coin: 230, ticket: 1 } },
    { id: 5, name: '熔岩裂谷', power: 950, firstReward: { gem: 10 }, reward: { coin: 280, ticket: 1 } },
    { id: 6, name: '天空回廊', power: 1300, firstReward: { gem: 10 }, reward: { coin: 340, ticket: 1 } },
    { id: 7, name: '星陨遗址', power: 1800, firstReward: { gem: 15 }, reward: { coin: 420, ticket: 2 } },
    { id: 8, name: '深渊王座', power: 2400, firstReward: { gem: 20 }, reward: { coin: 500, ticket: 2 } }
];

// 每日任务
const TASKS = [
    { key: 'draw', icon: '🔮', title: '抽卡 1 次', reward: { coin: 50 } },
    { key: 'levelUp', icon: '⬆️', title: '升级卡牌 1 次', reward: { ticket: 1 } },
    { key: 'battle', icon: '⚔️', title: '完成 1 次战斗', reward: { coin: 100 } }
];

/* ============================================================
 * 二、工具函数
 * ============================================================ */

const $ = sel => document.querySelector(sel);

function pad2(n) { return String(n).padStart(2, '0'); }

function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fmt(n) {
    return Math.round(Number(n) || 0).toLocaleString('zh-CN');
}

function clampInt(v, min, max, def) {
    const n = Math.floor(Number(v));
    if (!Number.isFinite(n)) return def;
    return Math.min(max, Math.max(min, n));
}

function stars(n) {
    const filled = Math.min(5, Math.max(0, n));
    return '★'.repeat(filled) + '☆'.repeat(5 - filled);
}

function levelCap(card) {
    return BASE_LEVEL_CAP + card.star * LEVEL_CAP_PER_STAR;
}

function statOf(id) {
    const cfg = CARD_MAP[id];
    const c = state.cards[id];
    if (!cfg || !c) return { atk: 0, hp: 0, power: 0 };
    const atk = Math.floor(cfg.atk * (1 + 0.12 * (c.level - 1)) * (1 + 0.5 * c.star));
    const hp = Math.floor(cfg.hp * (1 + 0.10 * (c.level - 1)) * (1 + 0.4 * c.star));
    return { atk, hp, power: atk * 2 + hp };
}

function teamPower() {
    return state.team.reduce((sum, id) => sum + (id && state.cards[id] ? statOf(id).power : 0), 0);
}

function ownedIds() {
    return Object.keys(state.cards).filter(id => CARD_MAP[id]);
}

function rewardText(reward) {
    const parts = [];
    if (reward.coin) parts.push(`🪙 ${fmt(reward.coin)}`);
    if (reward.gem) parts.push(`💎 ${fmt(reward.gem)}`);
    if (reward.ticket) parts.push(`🎟️ ${fmt(reward.ticket)}`);
    return parts.join(' · ') || '无';
}

function isStageUnlocked(stage) {
    if (state.unlockedAll) return true;
    if (stage.id === 1) return true;
    return state.clearedStages.includes(stage.id - 1);
}

/* ============================================================
 * 三、存档
 * ============================================================ */

let storageOK = true;
let saveTimer = null;
let suppressSave = false;

function freshState() {
    const s = {
        version: VERSION,
        coins: 1000,
        gems: 10,
        tickets: 0,
        pity: 0,
        seq: 4,
        cards: {},
        team: [null, null, null],
        clearedStages: [],
        unlockedAll: false,
        lastSignDate: '',
        daily: { date: todayStr(), draw: false, levelUp: false, battle: false, claimed: {} },
        settings: {}
    };
    ['fire', 'water', 'grass'].forEach((id, i) => {
        s.cards[id] = { level: 1, star: 0, shards: 0, isNew: true, obtainedAt: i + 1 };
        s.team[i] = id;
    });
    return s;
}

function normalizeState(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new Error('invalid save');
    }
    const base = freshState();

    // 卡牌
    const cards = {};
    if (raw.cards && typeof raw.cards === 'object' && !Array.isArray(raw.cards)) {
        for (const id of Object.keys(raw.cards)) {
            const cfg = CARD_MAP[id];
            const rc = raw.cards[id];
            if (!cfg || !rc || typeof rc !== 'object') continue;
            const star = clampInt(rc.star, 0, MAX_STAR, 0);
            const cap = BASE_LEVEL_CAP + star * LEVEL_CAP_PER_STAR;
            cards[id] = {
                level: clampInt(rc.level, 1, cap, 1),
                star,
                shards: clampInt(rc.shards, 0, 99999999, 0),
                isNew: !!rc.isNew,
                obtainedAt: clampInt(rc.obtainedAt, 0, 1e15, 0)
            };
        }
    } else {
        for (const id of Object.keys(base.cards)) cards[id] = { ...base.cards[id] };
    }

    // 编队：最多 3 张、不可重复；缺失时使用默认队伍
    let team = [null, null, null];
    if (Array.isArray(raw.team)) {
        const used = new Set();
        raw.team.slice(0, 3).forEach((id, i) => {
            if (typeof id === 'string' && cards[id] && !used.has(id)) {
                team[i] = id;
                used.add(id);
            }
        });
    } else {
        base.team.forEach((id, i) => {
            if (id && cards[id]) team[i] = id;
        });
    }

    // 关卡进度
    const cleared = [];
    if (Array.isArray(raw.clearedStages)) {
        raw.clearedStages.forEach(v => {
            const n = Number(v);
            if (STAGES.some(s => s.id === n) && !cleared.includes(n)) cleared.push(n);
        });
    }

    // 每日任务：跨天重置
    const daily = { date: todayStr(), draw: false, levelUp: false, battle: false, claimed: {} };
    if (raw.daily && typeof raw.daily === 'object' && raw.daily.date === daily.date) {
        ['draw', 'levelUp', 'battle'].forEach(k => { daily[k] = !!raw.daily[k]; });
        if (raw.daily.claimed && typeof raw.daily.claimed === 'object') {
            ['draw', 'levelUp', 'battle'].forEach(k => { daily.claimed[k] = !!raw.daily.claimed[k]; });
        }
    }

    let seq = clampInt(raw.seq, 1, 1e15, 1);
    Object.values(cards).forEach(c => { seq = Math.max(seq, c.obtainedAt + 1); });

    return {
        version: VERSION,
        coins: clampInt(raw.coins, 0, 1e12, base.coins),
        gems: clampInt(raw.gems, 0, 1e12, base.gems),
        tickets: clampInt(raw.tickets, 0, 1e12, base.tickets),
        pity: clampInt(raw.pity, 0, SOFT_PITY, 0),
        seq,
        cards,
        team,
        clearedStages: cleared,
        unlockedAll: !!raw.unlockedAll,
        lastSignDate: typeof raw.lastSignDate === 'string' ? raw.lastSignDate : '',
        daily,
        settings: raw.settings && typeof raw.settings === 'object' ? raw.settings : {}
    };
}

function save() {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(writeSave, 150);
}

function writeSave() {
    if (suppressSave) return;
    if (saveTimer) {
        clearTimeout(saveTimer);
        saveTimer = null;
    }
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (e) {
        if (storageOK) {
            storageOK = false;
            toast('无法写入本地存储，进度可能丢失');
        }
    }
}

function ensureDaily() {
    const today = todayStr();
    if (state.daily.date !== today) {
        state.daily = { date: today, draw: false, levelUp: false, battle: false, claimed: {} };
        save();
    }
}

function markDaily(key) {
    ensureDaily();
    if (key in state.daily && !state.daily[key]) state.daily[key] = true;
}

/* ============================================================
 * 四、界面状态
 * ============================================================ */

let state;
let currentTab = 'gacha';
let activeSheetId = null;
let confirmCb = null;
let toastTimer = null;
let lastRes = null;
let lastTapTimes = [];
const ui = { sort: 'rarity', filter: 0 };

/* ============================================================
 * 五、渲染：顶部资源、日常条、Tab
 * ============================================================ */

function renderRes() {
    const values = { coins: state.coins, gems: state.gems, tickets: state.tickets };
    const ids = { coins: '#resCoins', gems: '#resGems', tickets: '#resTickets' };
    Object.keys(values).forEach(key => {
        const el = $(ids[key]);
        if (!el) return;
        el.textContent = fmt(values[key]);
        if (lastRes && lastRes[key] !== values[key]) {
            const chip = el.closest('.res');
            chip.classList.remove('bump');
            void chip.offsetWidth;
            chip.classList.add('bump');
            setTimeout(() => chip.classList.remove('bump'), 340);
        }
    });
    lastRes = values;
}

function renderDailyStrip() {
    ensureDaily();
    const el = $('#dailyStrip');
    if (!el) return;
    const canSign = state.lastSignDate !== todayStr();
    const done = TASKS.filter(t => state.daily[t.key]).length;
    const claimable = TASKS.some(t => state.daily[t.key] && !state.daily.claimed[t.key]);
    el.innerHTML = `
        <button class="daily-chip ${canSign ? 'attn' : ''}" type="button" data-action="sign">
            <span>📅</span><span>${canSign ? '今日签到' : '已签到'}</span>
            ${canSign ? '<i class="dot"></i>' : ''}
        </button>
        <button class="daily-chip ${claimable ? 'attn' : ''}" type="button" data-action="daily">
            <span>📋</span><span>每日任务 ${done}/3</span>
            ${claimable ? '<i class="dot"></i>' : ''}
        </button>`;
}

function renderTabs() {
    document.querySelectorAll('#tabbar .tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === currentTab);
    });
}

/* ============================================================
 * 六、渲染：主内容
 * ============================================================ */

function renderView(keepScroll = true) {
    const view = $('#view');
    if (!view) return;
    const top = view.scrollTop;
    const html = {
        gacha: viewGacha,
        library: viewLibrary,
        team: viewTeam,
        stages: viewStages
    }[currentTab] || viewGacha;
    view.innerHTML = html();
    view.scrollTop = keepScroll ? top : 0;
}

function renderAll(keepScroll = true) {
    renderRes();
    renderDailyStrip();
    renderTabs();
    renderView(keepScroll);
}

/* ---------- 抽卡页 ---------- */
function pullCost(count) {
    if (state.tickets >= count) return { type: 'ticket', amount: count };
    if (state.gems >= count * 10) return { type: 'gem', amount: count * 10 };
    return null;
}

function costLabel(count) {
    const cost = pullCost(count);
    if (!cost) return '资源不足';
    return cost.type === 'ticket' ? `${cost.amount} 张抽卡券` : `${cost.amount} 钻石`;
}

function viewGacha() {
    const pityLeft = Math.max(0, SOFT_PITY - state.pity);
    return `
        <section class="gacha-hero">
            <div class="hero-glow"></div>
            <div class="hero-cards"><span>❄️</span><span>⚡</span><span>🛡️</span><span class="hero-main">🐉</span></div>
            <h2>星愿召唤</h2>
            <p>每一次召唤，都可能遇见传说</p>
            <div class="pity">距离 4★ 保底：<b>${pityLeft}</b> 抽</div>
        </section>

        <div class="pull-actions">
            <button class="btn btn-primary ${pullCost(1) ? '' : 'is-poor'}" type="button" data-action="pull1">
                <span>🔮 单抽</span><small>${costLabel(1)}</small>
            </button>
            <button class="btn btn-gold ${pullCost(10) ? '' : 'is-poor'}" type="button" data-action="pull10">
                <span>✨ 十连</span><small>${costLabel(10)}</small>
            </button>
        </div>

        <section class="panel prob">
            <h3>召唤概率</h3>
            <div class="prob-row"><span class="rar r4">4★ 传说</span><b>1%</b></div>
            <div class="prob-row"><span class="rar r3">3★ 史诗</span><b>9%</b></div>
            <div class="prob-row"><span class="rar r2">2★ 稀有</span><b>30%</b></div>
            <div class="prob-row"><span class="rar r1">1★ 普通</span><b>60%</b></div>
            <ul class="rules">
                <li>十连必出至少 1 张 3★ 及以上；若前 9 抽未出，第 10 抽强制从 3–4★ 池中产出。</li>
                <li>累计 50 抽必出 4★，出 4★ 后计数重置。</li>
                <li>重复卡牌自动转化为碎片：1★ +1、2★ +2、3★ +3、4★ +5。</li>
                <li>消耗优先使用抽卡券，抽卡券不足时使用钻石。</li>
            </ul>
        </section>`;
}

/* ---------- 卡库 ---------- */
function sortedOwned() {
    const list = ownedIds();
    list.sort((a, b) => {
        const ca = state.cards[a];
        const cb = state.cards[b];
        const ra = CARD_MAP[a].rarity;
        const rb = CARD_MAP[b].rarity;
        if (ui.sort === 'level') {
            return cb.level - ca.level || rb - ra || b.localeCompare(a);
        }
        if (ui.sort === 'recent') {
            return cb.obtainedAt - ca.obtainedAt || rb - ra;
        }
        return rb - ra || cb.level - ca.level || (ca.obtainedAt - cb.obtainedAt);
    });
    return list;
}

function cardTileHTML(id) {
    const cfg = CARD_MAP[id];
    const c = state.cards[id];
    const s = statOf(id);
    const high = c.star >= 3 ? ' high-star' : '';
    return `
        <button class="card-tile r${cfg.rarity}${high}" type="button" data-action="card" data-id="${id}">
            <span class="rarity-tag">${RARITY[cfg.rarity].name}</span>
            ${c.isNew ? '<span class="new-badge">NEW</span>' : ''}
            <span class="card-emoji">${cfg.emoji}</span>
            <span class="card-name">${cfg.name}</span>
            <span class="card-meta">${stars(c.star + 1)} <span class="lv">Lv.${c.level}</span></span>
            <span class="card-power">战力 <b>${fmt(s.power)}</b></span>
        </button>`;
}

function viewLibrary() {
    const all = ownedIds();
    if (!all.length) {
        return `
            <div class="empty-state">
                <div class="big">🃏</div>
                <p>卡库还空着，去召唤第一张卡牌吧</p>
                <button class="btn btn-primary" type="button" data-action="goGacha">去抽卡</button>
            </div>`;
    }
    const list = sortedOwned().filter(id => !ui.filter || CARD_MAP[id].rarity === ui.filter);
    const options = [4, 3, 2, 1].map(r => `
        <option value="${r}" ${ui.filter === r ? 'selected' : ''}>${r}★ ${RARITY[r].name}</option>`).join('');
    const empty = list.length ? '' : `<div class="empty-state"><div class="big">🔍</div><p>该稀有度下暂无卡牌</p></div>`;
    return `
        <div class="lib-bar">
            <div class="lib-count">共 <b>${all.length}</b> / ${CARDS.length} 张</div>
            <select class="select" data-change="filter">
                <option value="0" ${ui.filter === 0 ? 'selected' : ''}>全部稀有度</option>
                ${options}
            </select>
            <select class="select" data-change="sort">
                <option value="rarity" ${ui.sort === 'rarity' ? 'selected' : ''}>稀有度</option>
                <option value="level" ${ui.sort === 'level' ? 'selected' : ''}>等级</option>
                <option value="recent" ${ui.sort === 'recent' ? 'selected' : ''}>获得时间</option>
            </select>
        </div>
        ${list.length ? `<div class="card-grid">${list.map(cardTileHTML).join('')}</div>` : empty}`;
}

/* ---------- 编队 ---------- */
function viewTeam() {
    const power = teamPower();
    const slots = state.team.map((id, i) => {
        if (!id || !state.cards[id]) {
            return `
                <button class="team-slot" type="button" data-action="slot" data-index="${i}">
                    <span class="slot-plus">+</span>
                    <span class="slot-empty-text">空位</span>
                </button>`;
        }
        const cfg = CARD_MAP[id];
        const c = state.cards[id];
        const s = statOf(id);
        return `
            <button class="team-slot filled r${cfg.rarity} ${c.star >= 3 ? 'high-star' : ''}" type="button" data-action="slot" data-index="${i}">
                <span class="slot-emoji">${cfg.emoji}</span>
                <span class="slot-name">${cfg.name}</span>
                <span class="slot-meta">Lv.${c.level}</span>
                <span class="slot-stars">${stars(c.star + 1)}</span>
                <span class="slot-power">战力 ${fmt(s.power)}</span>
            </button>`;
    }).join('');

    return `
        <div class="section-title"><h2>出战队伍</h2><span>3 张卡牌</span></div>
        <section class="panel team-panel">
            <div class="team-head">
                <b>队伍编成</b>
                <span class="total-power">总战力<b>${fmt(power)}</b></span>
            </div>
            <div class="team-slots">${slots}</div>
            <div class="team-actions">
                <button class="btn btn-ghost" type="button" data-action="autoTeam">⚡ 一键上阵最强 3 张</button>
            </div>
        </section>
        <p class="team-tip">点击空位或已上阵卡牌即可更换，同一张卡牌不能重复上阵。<br>队伍总战力越高，副本的胜率越高。</p>`;
}

/* ---------- 副本 ---------- */
function viewStages() {
    const power = teamPower();
    const cleared = state.clearedStages.length;
    const list = STAGES.map(stage => {
        const unlocked = isStageUnlocked(stage);
        const isCleared = state.clearedStages.includes(stage.id);
        const diff = power >= stage.power ? '可挑战' : '战力不足';
        return `
            <div class="stage-card ${unlocked ? '' : 'locked'}">
                <div class="stage-top">
                    <span class="stage-no">${pad2(stage.id)}</span>
                    <div class="stage-info">
                        <div class="stage-name">${stage.name}</div>
                        <div class="stage-sub">推荐战力 <span class="p">${fmt(stage.power)}</span> · ${unlocked ? diff : '未解锁'}</div>
                    </div>
                    ${isCleared ? '<span class="clear-tag">已通关</span>' : (unlocked ? '' : '<span class="lock-tag">🔒</span>')}
                </div>
                <div class="stage-foot">
                    <div class="stage-reward">
                        <span class="first-gem">首通 ${isCleared ? '已领' : `+${stage.firstReward.gem}💎`}</span>
                        <span>重复 🪙${fmt(stage.reward.coin)} 🎟️${stage.reward.ticket}</span>
                    </div>
                    ${unlocked
                        ? `<button class="btn-challenge" type="button" data-action="challenge" data-id="${stage.id}">挑战</button>`
                        : `<span class="stage-sub">通关上一关解锁</span>`}
                </div>
            </div>`;
    }).join('');

    return `
        <div class="section-title"><h2>副本</h2><span>已通关 ${cleared}/${STAGES.length}</span></div>
        <div class="stage-summary">
            <span>队伍总战力</span>
            <span>${power ? `<b>${fmt(power)}</b>` : '尚未编队'}</span>
        </div>
        <div class="stage-list">${list}</div>
        <p class="hint-text">战斗自动结算，双方战力在 ±10% 范围内浮动，我方不低于敌方即获胜。<br>失败不扣资源，还会获得少量安慰金币。</p>`;
}

/* ============================================================
 * 七、轻提示 & 弹层
 * ============================================================ */

function toast(msg) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1900);
}

function lockScroll() {
    const root = $('#modalRoot');
    document.body.classList.toggle('modal-open', !!(root && root.children.length));
}

function openModal(html, opts = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay' + (opts.center ? ' center' : '');
    if (opts.kind) overlay.dataset.kind = opts.kind;
    overlay.innerHTML = `<div class="modal ${opts.modalClass || ''}">${html}</div>`;
    overlay.addEventListener('click', ev => {
        if (ev.target === overlay) closeModal();
    });
    $('#modalRoot').appendChild(overlay);
    lockScroll();
    requestAnimationFrame(() => overlay.classList.add('show'));
    return overlay;
}

function closeModal() {
    const root = $('#modalRoot');
    const last = root && root.lastElementChild;
    if (!last) return;
    if (last.dataset.kind === 'card') activeSheetId = null;
    last.classList.remove('show');
    last.style.pointerEvents = 'none';
    setTimeout(() => {
        last.remove();
        lockScroll();
    }, 190);
}

function closeAllModals() {
    const root = $('#modalRoot');
    if (!root) return;
    while (root.firstElementChild) root.firstElementChild.remove();
    activeSheetId = null;
    lockScroll();
}

function replaceTopModal(kind, html) {
    const root = $('#modalRoot');
    const last = root && root.lastElementChild;
    if (last && last.dataset.kind === kind) {
        const modal = last.querySelector('.modal');
        if (modal) modal.innerHTML = html;
    }
}

function showConfirm({ title, message, okText = '确认', danger = false, onOk }) {
    confirmCb = onOk || null;
    openModal(`
        <div class="m-body">
            <h3 class="confirm-title">${title}</h3>
            <p class="confirm-msg">${message}</p>
        </div>
        <div class="m-foot">
            <button class="btn btn-ghost" type="button" data-action="confirmCancel">取消</button>
            <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" type="button" data-action="confirmOk">${okText}</button>
        </div>`, { center: true, kind: 'confirm' });
}

/* ============================================================
 * 八、抽卡
 * ============================================================ */

function rollRarity() {
    const r = Math.random() * 100;
    if (r < 1) return 4;
    if (r < 10) return 3;
    if (r < 40) return 2;
    return 1;
}

function drawOne(minRarity = 1) {
    let rarity;
    if (state.pity >= SOFT_PITY - 1) {
        rarity = 4;
    } else {
        rarity = rollRarity();
        if (rarity < minRarity) {
            rarity = minRarity >= 4 ? 4 : (Math.random() < 0.9 ? 3 : 4);
        }
    }
    state.pity = rarity === 4 ? 0 : state.pity + 1;

    const pool = CARDS.filter(c => c.rarity === rarity);
    const cfg = pool[Math.floor(Math.random() * pool.length)];

    if (state.cards[cfg.id]) {
        const add = DUP_SHARDS[rarity];
        state.cards[cfg.id].shards += add;
        return { id: cfg.id, rarity, isNew: false, shards: add };
    }
    state.cards[cfg.id] = {
        level: 1,
        star: 0,
        shards: 0,
        isNew: true,
        obtainedAt: ++state.seq
    };
    return { id: cfg.id, rarity, isNew: true, shards: 0 };
}

function doPull(count) {
    const cost = pullCost(count);
    if (!cost) {
        toast(`抽卡券或钻石不足：需要 ${count} 券 或 ${count * 10} 钻石`);
        return;
    }
    if (cost.type === 'ticket') state.tickets -= cost.amount;
    else state.gems -= cost.amount;

    const results = [];
    let gotHigh = false;
    for (let i = 0; i < count; i++) {
        let minRarity = 1;
        if (count === 10 && i === 9 && !gotHigh) minRarity = 3;
        const result = drawOne(minRarity);
        if (result.rarity >= 3) gotHigh = true;
        results.push(result);
    }

    markDaily('draw');
    save();
    renderAll();
    showPullResults(results, count);
}

function showPullResults(results, count) {
    const freshCount = results.filter(r => r.isNew).length;
    const shardCount = results.length - freshCount;
    const highCount = results.filter(r => r.rarity >= 3).length;
    const summary = `新卡 ${freshCount} · 碎片 ${shardCount}${highCount ? ` · ${highCount} 张 3★+` : ''}`;

    if (count === 1) {
        const r = results[0];
        const cfg = CARD_MAP[r.id];
        openModal(`
            <div class="m-head">
                <div><h3>召唤结果</h3><small>${RARITY[r.rarity].name} · ${r.isNew ? '首次获得' : '重复转化'}</small></div>
                <button class="icon-btn" type="button" data-action="close" aria-label="关闭">✕</button>
            </div>
            <div class="m-body">
                <div class="result-single r${r.rarity}">
                    <div class="rs-emoji">${cfg.emoji}</div>
                    <div class="rs-name">${cfg.name}</div>
                    <div class="rs-tag">${RARITY[r.rarity].name} · ${stars(1)}</div>
                    ${r.isNew
                        ? '<div class="rs-badge new">NEW 新卡入库</div>'
                        : `<div class="rs-badge shard">重复卡 · 转化为 ${r.shards} 碎片</div>`}
                </div>
            </div>
            <div class="m-foot"><button class="btn btn-gold" type="button" data-action="close">收下</button></div>`,
            { center: true, kind: 'result' });
        return;
    }

    const items = results.map((r, i) => {
        const cfg = CARD_MAP[r.id];
        return `
            <div class="result-item r${r.rarity}" style="animation-delay:${i * 65}ms">
                <span class="ri-emoji">${cfg.emoji}</span>
                <span class="ri-body">
                    <span class="ri-name">${cfg.name}</span>
                    <span class="ri-sub ${r.isNew ? 'new' : 'shard'}">${RARITY[r.rarity].name} · ${r.isNew ? 'NEW' : `+${r.shards} 碎片`}</span>
                </span>
            </div>`;
    }).join('');

    openModal(`
        <div class="m-head">
            <div><h3>十连召唤</h3><small>${summary}</small></div>
            <button class="icon-btn" type="button" data-action="close" aria-label="关闭">✕</button>
        </div>
        <div class="m-body tight">
            <div class="result-grid">${items}</div>
        </div>
        <div class="m-foot">
            <button class="btn btn-ghost" type="button" data-action="skipAnim">跳过动画</button>
            <button class="btn btn-gold" type="button" data-action="close">收下</button>
        </div>`, { center: true, kind: 'result' });
}

/* ============================================================
 * 九、卡牌详情与养成
 * ============================================================ */

function cardSheetHTML(id) {
    const cfg = CARD_MAP[id];
    const c = state.cards[id];
    if (!cfg || !c) return '';
    const s = statOf(id);
    const cap = levelCap(c);
    const lvCost = 100 * c.level;
    const lvMax = c.level >= cap;
    const starCost = c.star < MAX_STAR ? STAR_COST[c.star] : null;
    const poorLv = !lvMax && state.coins < lvCost;
    const poorStar = starCost !== null && c.shards < starCost;

    return `
        <div class="m-head">
            <div><h3>${cfg.emoji} ${cfg.name}</h3><small>Lv.${c.level} / ${cap} · ${stars(c.star + 1)}</small></div>
            <button class="icon-btn" type="button" data-action="close" aria-label="关闭">✕</button>
        </div>
        <div class="m-body">
            <div class="detail-hero r${cfg.rarity}">
                <div class="detail-emoji">${cfg.emoji}</div>
                <div class="detail-name">${cfg.name}</div>
                <div class="detail-tags"><span class="rt">${RARITY[cfg.rarity].name}</span><span>Lv.${c.level}</span></div>
                <div class="detail-stars">${stars(c.star + 1)}</div>
            </div>

            <div class="stat-grid">
                <div class="stat"><span>攻击</span><b>${fmt(s.atk)}</b></div>
                <div class="stat"><span>生命</span><b>${fmt(s.hp)}</b></div>
                <div class="stat hero-stat"><span>战力</span><b>${fmt(s.power)}</b></div>
            </div>

            <div class="shard-line"><span>升星碎片</span><b>${fmt(c.shards)}</b></div>

            <div class="upgrade-row">
                <button class="btn btn-gold ${poorLv ? 'is-poor' : ''}" type="button" data-action="levelup" data-id="${id}">
                    <span>${lvMax ? '已满级' : '升级'}</span>
                    <small>${lvMax ? `上限 Lv.${cap}` : `${lvCost} 金币`}</small>
                </button>
                <button class="btn btn-primary ${poorStar ? 'is-poor' : ''}" type="button" data-action="starup" data-id="${id}">
                    <span>${starCost === null ? '已满星' : '升星'}</span>
                    <small>${starCost === null ? '5★ 上限' : `${starCost} 碎片`}</small>
                </button>
            </div>

            <div class="skill-box"><b>技能</b>${cfg.skill || '暂无技能'}</div>
            <p class="hint-text">升级消耗 100 × 当前等级金币；每升 1 星，等级上限 +5。</p>
        </div>
        <div class="m-foot">
            <button class="btn btn-ghost" type="button" data-action="close">关闭</button>
        </div>`;
}

function openCardDetail(id) {
    if (!state.cards[id]) return;
    if (state.cards[id].isNew) {
        state.cards[id].isNew = false;
        save();
        renderView(true);
    }
    activeSheetId = id;
    openModal(cardSheetHTML(id), { kind: 'card', modalClass: 'sheet-detail' });
}

function refreshCardSheet() {
    if (!activeSheetId) return;
    replaceTopModal('card', cardSheetHTML(activeSheetId));
}

function levelUpCard(id) {
    const c = state.cards[id];
    if (!c) return;
    const cap = levelCap(c);
    if (c.level >= cap) {
        toast(`已达等级上限 Lv.${cap}，升星可继续提升`);
        return;
    }
    const cost = 100 * c.level;
    if (state.coins < cost) {
        toast('金币不足');
        return;
    }
    state.coins -= cost;
    c.level += 1;
    markDaily('levelUp');
    save();
    renderRes();
    renderDailyStrip();
    renderView(true);
    refreshCardSheet();
    toast(`升级成功！Lv.${c.level} · 战力 ${fmt(statOf(id).power)}`);
}

function starUpCard(id) {
    const c = state.cards[id];
    if (!c) return;
    if (c.star >= MAX_STAR) {
        toast('已经是满星啦');
        return;
    }
    const cost = STAR_COST[c.star];
    if (c.shards < cost) {
        toast(`碎片不足，还需要 ${cost - c.shards} 个`);
        return;
    }
    c.shards -= cost;
    c.star += 1;
    save();
    renderView(true);
    refreshCardSheet();
    toast(`升星成功！${stars(c.star + 1)} · 等级上限 Lv.${levelCap(c)}`);
}

/* ============================================================
 * 十、编队
 * ============================================================ */

function openTeamPicker(index) {
    const owned = ownedIds();
    if (!owned.length) {
        toast('还没有卡牌，先去抽卡吧');
        return;
    }
    owned.sort((a, b) => statOf(b).power - statOf(a).power);
    const usedElsewhere = new Set(state.team.filter((id, i) => id && i !== index));

    const items = owned.map(id => {
        const cfg = CARD_MAP[id];
        const c = state.cards[id];
        const s = statOf(id);
        const used = usedElsewhere.has(id);
        return `
            <button class="picker-item ${used ? 'used' : ''}" type="button" data-action="assign" data-index="${index}" data-id="${id}">
                <span class="pi-emoji">${cfg.emoji}</span>
                <span class="pi-body">
                    <span class="pi-name">${cfg.name}</span>
                    <span class="pi-sub">Lv.${c.level} · ${stars(c.star + 1)} · ${RARITY[cfg.rarity].name}</span>
                </span>
                <span class="pi-power">${used ? '已上阵' : fmt(s.power)}</span>
            </button>`;
    }).join('');

    const removeBtn = state.team[index]
        ? `<button class="btn btn-sm btn-ghost btn-block" type="button" data-action="removeSlot" data-index="${index}" style="margin-bottom:9px">移除此位卡牌</button>`
        : '';

    openModal(`
        <div class="m-head">
            <div><h3>选择卡牌</h3><small>第 ${index + 1} 位 · 同一张卡不能重复上阵</small></div>
            <button class="icon-btn" type="button" data-action="close" aria-label="关闭">✕</button>
        </div>
        <div class="m-body">
            ${removeBtn}
            ${items}
        </div>`, { kind: 'picker' });
}

function assignTeam(index, id) {
    if (!state.cards[id]) return;
    if (state.team.some((x, i) => x === id && i !== index)) {
        toast('该卡牌已在队伍中');
        return;
    }
    state.team[index] = id;
    save();
    closeModal();
    renderView(true);
    toast(`${CARD_MAP[id].name} 已上阵`);
}

function removeSlot(index) {
    state.team[index] = null;
    save();
    closeModal();
    renderView(true);
}

function autoTeam() {
    const ids = ownedIds()
        .sort((a, b) => statOf(b).power - statOf(a).power)
        .slice(0, 3);
    if (!ids.length) {
        toast('还没有卡牌，先去抽卡吧');
        return;
    }
    state.team = [ids[0] || null, ids[1] || null, ids[2] || null];
    save();
    renderView(true);
    toast('已上阵战力最高的 3 张卡牌');
}

/* ============================================================
 * 十一、战斗
 * ============================================================ */

function challenge(stageId) {
    const stage = STAGES.find(s => s.id === Number(stageId));
    if (!stage) return;
    if (!isStageUnlocked(stage)) {
        toast('通关上一关后解锁');
        return;
    }
    const ids = state.team.filter(id => id && state.cards[id]);
    if (!ids.length) {
        toast('请先编队');
        return;
    }

    const base = teamPower();
    const myRoll = base * (0.9 + Math.random() * 0.2);
    const foeRoll = stage.power * (0.9 + Math.random() * 0.2);
    const win = myRoll >= foeRoll;

    const reward = { coin: 0, gem: 0, ticket: 0 };
    let first = false;

    if (win) {
        reward.coin = stage.reward.coin;
        reward.ticket = stage.reward.ticket;
        if (!state.clearedStages.includes(stage.id)) {
            state.clearedStages.push(stage.id);
            reward.gem = stage.firstReward.gem || 0;
            first = true;
        }
    } else {
        reward.coin = Math.max(10, Math.floor(stage.reward.coin * 0.2));
    }

    state.coins += reward.coin;
    state.gems += reward.gem;
    state.tickets += reward.ticket;
    markDaily('battle');
    save();
    renderAll();

    showBattleResult(stage, {
        win,
        my: Math.round(myRoll),
        foe: Math.round(foeRoll),
        base,
        first,
        reward
    });
}

function showBattleResult(stage, result) {
    const { win, my, foe, base, first, reward } = result;
    const chips = [];
    if (reward.coin) chips.push(`<span class="chip gold">🪙 +${fmt(reward.coin)}</span>`);
    if (reward.gem) chips.push(`<span class="chip gold">💎 +${fmt(reward.gem)}</span>`);
    if (reward.ticket) chips.push(`<span class="chip">🎟️ +${fmt(reward.ticket)}</span>`);

    openModal(`
        <div class="m-head">
            <div><h3>${stage.name}</h3><small>推荐战力 ${fmt(stage.power)} · 队伍 ${fmt(base)}</small></div>
            <button class="icon-btn" type="button" data-action="close" aria-label="关闭">✕</button>
        </div>
        <div class="m-body">
            <div class="battle-result">
                <div class="battle-title ${win ? 'win' : 'lose'}">${win ? '胜 利' : '惜 败'}</div>
                <div class="battle-sub">${win ? '队伍凯旋，奖励已入账' : '队伍撤退，获得少量安慰金币'}</div>
                <div class="vs-box">
                    <div class="vs-side mine"><span>我方战力</span><b>${fmt(my)}</b></div>
                    <div class="vs-mid">VS</div>
                    <div class="vs-side foe"><span>敌方战力</span><b>${fmt(foe)}</b></div>
                </div>
                <div class="reward-chips">${chips.join('')}</div>
                ${first ? '<p class="hint-text">首次通关奖励已发放</p>' : ''}
                <p class="hint-text">双方战力在 ±10% 内浮动，本次结果已结算</p>
            </div>
        </div>
        <div class="m-foot">
            <button class="btn btn-ghost" type="button" data-action="close">返回</button>
            <button class="btn btn-primary" type="button" data-action="retry" data-id="${stage.id}">再来一次</button>
        </div>`, { center: true, kind: 'battle' });
}

/* ============================================================
 * 十二、签到与每日任务
 * ============================================================ */

function signToday() {
    if (state.lastSignDate === todayStr()) {
        toast('今天已经签到过啦');
        return;
    }
    state.lastSignDate = todayStr();
    state.gems += 20;
    state.coins += 100;
    save();
    renderRes();
    renderDailyStrip();
    replaceTopModal('daily', dailyHTML());
    toast('签到成功：💎 20 · 🪙 100');
}

function claimTask(key) {
    ensureDaily();
    const task = TASKS.find(t => t.key === key);
    if (!task) return;
    if (!state.daily[key]) {
        toast('任务还未完成');
        return;
    }
    if (state.daily.claimed[key]) {
        toast('奖励已领取');
        return;
    }
    state.daily.claimed[key] = true;
    state.coins += task.reward.coin || 0;
    state.gems += task.reward.gem || 0;
    state.tickets += task.reward.ticket || 0;
    save();
    renderRes();
    renderDailyStrip();
    replaceTopModal('daily', dailyHTML());
    toast(`领取成功：${rewardText(task.reward)}`);
}

function dailyHTML() {
    ensureDaily();
    const canSign = state.lastSignDate !== todayStr();
    const rows = TASKS.map(t => {
        const completed = !!state.daily[t.key];
        const claimed = !!state.daily.claimed[t.key];
        let btn = '';
        if (claimed) btn = '<button class="task-btn done" type="button" data-action="noop">已领取</button>';
        else if (completed) btn = `<button class="task-btn ready" type="button" data-action="claim" data-key="${t.key}">领取</button>`;
        else btn = '<button class="task-btn" type="button" data-action="noop">未完成</button>';
        return `
            <div class="task-row">
                <span class="task-icon">${t.icon}</span>
                <div class="task-info">
                    <b>${t.title}</b>
                    <small class="reward">奖励 ${rewardText(t.reward)}</small>
                </div>
                ${btn}
            </div>`;
    }).join('');

    return `
        <div class="m-head">
            <div><h3>每日日常</h3><small>按本地日期 0 点重置</small></div>
            <button class="icon-btn" type="button" data-action="close" aria-label="关闭">✕</button>
        </div>
        <div class="m-body">
            <div class="sign-card">
                <span class="sign-icon">📅</span>
                <div class="sign-info">
                    <b>${canSign ? '今日签到' : '今日已签到'}</b>
                    <small>奖励：💎 20 · 🪙 100</small>
                </div>
                <button class="btn btn-sm ${canSign ? 'btn-gold' : 'btn-ghost'}" type="button" data-action="sign">${canSign ? '领取' : '已领取'}</button>
            </div>
            <div class="task-list">${rows}</div>
            <p class="hint-text">任务完成进度会自动记录，跨天刷新后重新开始。</p>
        </div>`;
}

/* ============================================================
 * 十三、调试面板
 * ============================================================ */

function debugHTML() {
    return `
        <div class="m-head">
            <div><h3>调试面板</h3><small>仅本机生效 · 关闭后恢复正常 UI</small></div>
            <button class="icon-btn" type="button" data-action="close" aria-label="关闭">✕</button>
        </div>
        <div class="m-body">
            <div class="debug-section">
                <h4>资源</h4>
                <div class="debug-grid">
                    <button class="btn btn-ghost" type="button" data-action="cheat" data-cheat="coins">+1000 🪙</button>
                    <button class="btn btn-ghost" type="button" data-action="cheat" data-cheat="gems">+100 💎</button>
                    <button class="btn btn-ghost" type="button" data-action="cheat" data-cheat="tickets">+10 🎟️</button>
                    <button class="btn btn-ghost" type="button" data-action="cheat" data-cheat="all">全部 +1 组</button>
                </div>
            </div>
            <div class="debug-section">
                <h4>卡牌与关卡</h4>
                <div class="debug-grid">
                    <button class="btn btn-ghost" type="button" data-action="cheat" data-cheat="level10">全员 10 级</button>
                    <button class="btn btn-ghost" type="button" data-action="cheat" data-cheat="maxstar">全员满星</button>
                    <button class="btn btn-ghost" type="button" data-action="cheat" data-cheat="unlock">解锁全部关卡</button>
                    <button class="btn btn-ghost" type="button" data-action="cheat" data-cheat="resetpity">保底计数清零</button>
                </div>
            </div>
            <div class="debug-section">
                <h4>存档</h4>
                <div class="debug-grid">
                    <button class="btn btn-ghost" type="button" data-action="export">导出存档</button>
                    <button class="btn btn-ghost" type="button" data-action="importForm">导入存档</button>
                </div>
                <div id="debugIO"></div>
                <button class="btn btn-danger btn-block" type="button" data-action="resetSave" style="margin-top:8px">重置存档</button>
            </div>
            <div class="debug-section">
                <h4>STATE JSON</h4>
                <pre class="debug-json">${JSON.stringify(state, null, 2)}</pre>
            </div>
        </div>`;
}

function openDebug() {
    openModal(debugHTML(), { kind: 'debug' });
}

function refreshDebug() {
    replaceTopModal('debug', debugHTML());
}

function cheat(kind) {
    if (kind === 'coins') state.coins += 1000;
    else if (kind === 'gems') state.gems += 100;
    else if (kind === 'tickets') state.tickets += 10;
    else if (kind === 'all') {
        state.coins += 1000;
        state.gems += 100;
        state.tickets += 10;
    } else if (kind === 'level10') {
        Object.values(state.cards).forEach(c => {
            c.level = Math.min(levelCap(c), Math.max(c.level, 10));
        });
    } else if (kind === 'maxstar') {
        Object.values(state.cards).forEach(c => { c.star = MAX_STAR; });
    } else if (kind === 'unlock') {
        state.unlockedAll = true;
    } else if (kind === 'resetpity') {
        state.pity = 0;
    }
    save();
    renderAll();
    refreshDebug();
    toast('调试操作已生效');
}

function fillExport() {
    const box = $('#debugIO');
    if (!box) return;
    box.innerHTML = `
        <div class="io-box">
            <textarea class="io-area" id="exportArea" readonly></textarea>
            <div class="io-actions">
                <button class="btn btn-sm btn-ghost" type="button" data-action="selectExport">全选</button>
                <button class="btn btn-sm btn-gold" type="button" data-action="copyExport">复制 JSON</button>
            </div>
        </div>`;
    const area = $('#exportArea');
    area.value = JSON.stringify(state);
    area.focus();
    area.select();
}

function copyExport() {
    const area = $('#exportArea');
    if (!area) return;
    area.focus();
    area.select();
    const done = () => toast('已复制到剪贴板');
    const fail = () => toast('已选中，请长按手动复制');
    try {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(area.value).then(done).catch(() => {
                if (document.execCommand('copy')) done();
                else fail();
            });
        } else if (document.execCommand('copy')) {
            done();
        } else {
            fail();
        }
    } catch (e) {
        fail();
    }
}

function fillImport() {
    const box = $('#debugIO');
    if (!box) return;
    box.innerHTML = `
        <div class="io-box">
            <textarea class="io-area" id="importArea" placeholder="在此粘贴存档 JSON..."></textarea>
            <div class="io-actions">
                <button class="btn btn-sm btn-ghost" type="button" data-action="clearImport">清空</button>
                <button class="btn btn-sm btn-danger" type="button" data-action="doImport">覆盖导入</button>
            </div>
        </div>`;
    $('#importArea').focus();
}

function doImport() {
    const area = $('#importArea');
    if (!area) return;
    const text = area.value.trim();
    if (!text) {
        toast('请先粘贴存档 JSON');
        return;
    }
    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (e) {
        toast('JSON 解析失败，请检查内容');
        return;
    }
    let next;
    try {
        next = normalizeState(parsed);
    } catch (e) {
        toast('存档格式不正确');
        return;
    }
    showConfirm({
        title: '确认导入存档？',
        message: '导入后会覆盖当前全部进度，且无法撤销。',
        okText: '覆盖导入',
        danger: true,
        onOk() {
            state = next;
            writeSave();
            closeAllModals();
            renderAll(false);
            toast('导入成功');
        }
    });
}

function resetSave() {
    showConfirm({
        title: '重置存档？',
        message: '金币、钻石、卡牌、编队与关卡进度都会被清空。\n此操作无法撤销，建议先导出备份。',
        okText: '确认重置',
        danger: true,
        onOk() {
            suppressSave = true;
            if (saveTimer) {
                clearTimeout(saveTimer);
                saveTimer = null;
            }
            try {
                localStorage.removeItem(SAVE_KEY);
            } catch (e) { /* ignore */ }
            location.reload();
        }
    });
}

/* ============================================================
 * 十四、事件绑定
 * ============================================================ */

function switchTab(tab) {
    if (!['gacha', 'library', 'team', 'stages'].includes(tab)) return;
    currentTab = tab;
    closeAllModals();
    renderTabs();
    renderView(false);
}

function bindEvents() {
    document.addEventListener('click', ev => {
        const el = ev.target.closest('[data-action]');
        if (!el) return;
        const action = el.dataset.action;

        switch (action) {
            case 'tab':
                switchTab(el.dataset.tab);
                break;
            case 'pull1':
                doPull(1);
                break;
            case 'pull10':
                doPull(10);
                break;
            case 'card':
                openCardDetail(el.dataset.id);
                break;
            case 'levelup':
                levelUpCard(el.dataset.id);
                break;
            case 'starup':
                starUpCard(el.dataset.id);
                break;
            case 'slot':
                openTeamPicker(Number(el.dataset.index));
                break;
            case 'assign':
                assignTeam(Number(el.dataset.index), el.dataset.id);
                break;
            case 'removeSlot':
                removeSlot(Number(el.dataset.index));
                break;
            case 'autoTeam':
                autoTeam();
                break;
            case 'challenge':
                challenge(el.dataset.id);
                break;
            case 'retry':
                closeModal();
                setTimeout(() => challenge(el.dataset.id), 180);
                break;
            case 'sign':
                signToday();
                break;
            case 'daily':
                openModal(dailyHTML(), { kind: 'daily' });
                break;
            case 'claim':
                claimTask(el.dataset.key);
                break;
            case 'close':
                closeModal();
                break;
            case 'skipAnim': {
                const grid = document.querySelector('.result-grid');
                if (grid) grid.classList.add('instant');
                el.style.display = 'none';
                break;
            }
            case 'confirmOk': {
                const cb = confirmCb;
                confirmCb = null;
                closeModal();
                if (cb) setTimeout(cb, 40);
                break;
            }
            case 'confirmCancel':
                confirmCb = null;
                closeModal();
                break;
            case 'goGacha':
                switchTab('gacha');
                break;
            case 'cheat':
                cheat(el.dataset.cheat);
                break;
            case 'export':
                fillExport();
                break;
            case 'selectExport': {
                const area = $('#exportArea');
                if (area) {
                    area.focus();
                    area.select();
                }
                break;
            }
            case 'copyExport':
                copyExport();
                break;
            case 'importForm':
                fillImport();
                break;
            case 'clearImport': {
                const area = $('#importArea');
                if (area) area.value = '';
                break;
            }
            case 'doImport':
                doImport();
                break;
            case 'resetSave':
                resetSave();
                break;
            case 'noop':
            default:
                break;
        }
    });

    document.addEventListener('change', ev => {
        const el = ev.target.closest('[data-change]');
        if (!el) return;
        if (el.dataset.change === 'sort') {
            ui.sort = el.value;
            renderView(true);
        } else if (el.dataset.change === 'filter') {
            ui.filter = Number(el.value) || 0;
            renderView(true);
        }
    });

    // 连续点击标题 5 次打开调试面板
    const brand = $('#brand');
    brand.addEventListener('click', () => {
        const now = Date.now();
        lastTapTimes = lastTapTimes.filter(t => now - t < 2500);
        lastTapTimes.push(now);
        if (lastTapTimes.length >= 5) {
            lastTapTimes = [];
            openDebug();
        }
    });

    // 长按资源栏 2 秒打开调试面板
    const bar = $('#resourceBar');
    let pressTimer = null;
    const cancelPress = () => {
        if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
        }
    };
    bar.addEventListener('pointerdown', () => {
        cancelPress();
        pressTimer = setTimeout(() => {
            pressTimer = null;
            openDebug();
        }, 2000);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(name => {
        bar.addEventListener(name, cancelPress);
    });
    bar.addEventListener('contextmenu', e => e.preventDefault());

    // 跨天自动刷新日常状态
    setInterval(() => {
        if (state.daily.date !== todayStr()) {
            ensureDaily();
            renderDailyStrip();
        }
    }, 60000);

    // 关闭/切后台时立即写入存档
    window.addEventListener('pagehide', writeSave);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') writeSave();
    });
}

/* ============================================================
 * 十五、启动
 * ============================================================ */

function showCorruption() {
    const app = $('#app');
    if (!app) return;
    app.innerHTML = `
        <div class="corrupt-screen">
            <div class="big">💾</div>
            <h2>存档损坏</h2>
            <p>本地存档无法读取，可能是数据被截断或格式错误。你可以重置存档，重新开始。</p>
            <button class="btn btn-danger" type="button" id="corruptReset">重置存档</button>
        </div>`;
    $('#corruptReset').addEventListener('click', () => {
        try {
            localStorage.removeItem(SAVE_KEY);
        } catch (e) { /* ignore */ }
        location.reload();
    });
}

function init() {
    let raw = null;
    try {
        raw = localStorage.getItem(SAVE_KEY);
    } catch (e) {
        storageOK = false;
    }

    if (raw) {
        try {
            state = normalizeState(JSON.parse(raw));
        } catch (e) {
            showCorruption();
            return;
        }
    } else {
        state = freshState();
        writeSave();
    }

    ensureDaily();
    bindEvents();
    renderAll();
}

init();
