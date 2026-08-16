let songData = [];
let dailyTarget = null;
let guessCount = 0; 
let isGameOver = false;

const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const resultsBoard = document.getElementById('results-board');
const autocompleteList = document.getElementById('autocomplete-list');
const surrenderBtn = document.getElementById('surrender-btn'); 

// 弹窗相关 DOM
const endModal = document.getElementById('end-modal');
const btnRestart = document.getElementById('btn-restart');
const btnCloseModal = document.getElementById('btn-close-modal');

// 🛡️ 安全获取显示名称
function getSafeName(songObj) {
    if (!songObj) return "";
    return (songObj.song || songObj.title || "").toString().trim();
}

// 1. 初始化数据
fetch('vocaloid_data.json')
    .then(response => response.json())
    .then(data => {
        songData = data;
        setRandomTarget();
    })
    .catch(error => console.error("读取数据失败：", error));

function setRandomTarget() {
    const index = Math.floor(Math.random() * songData.length);
    dailyTarget = songData[index];
    console.log("🤫 答案是：", getSafeName(dailyTarget)); 
}

// 2. 智能模糊搜索逻辑
guessInput.addEventListener('input', function() {
    if (isGameOver) return; 
    const val = this.value.trim();
    autocompleteList.innerHTML = ''; 
    
    if (!val) {
        autocompleteList.style.display = 'none';
        return;
    }

    const matchedSongs = songData.filter(s => {
        const shortName = getSafeName(s);
        const fullName = (s.title || "").toString().trim();
        
        if (shortName === "无" || shortName === "") return false;

        const searchStr = val.toLowerCase();
        if (shortName.toLowerCase().includes(searchStr) || fullName.toLowerCase().includes(searchStr)) {
            return true;
        }

        if (typeof PinyinMatch !== 'undefined') {
            if (PinyinMatch.match(shortName, val)) {
                return true;
            }
        }
        return false;
    });

    if (matchedSongs.length === 0) {
        autocompleteList.style.display = 'none';
        return;
    }

    autocompleteList.style.display = 'block';
    
    const uniqueNames = new Set();
    let count = 0;
    
    for (let i = 0; i < matchedSongs.length; i++) {
        if (count >= 8) break; 
        
        const sName = getSafeName(matchedSongs[i]);
        
        if (!uniqueNames.has(sName)) {
            uniqueNames.add(sName);
            count++;
            
            const item = document.createElement('div');
            item.textContent = sName;
            
            item.addEventListener('click', function() {
                guessInput.value = sName;
                autocompleteList.innerHTML = '';
                autocompleteList.style.display = 'none';
            });
            autocompleteList.appendChild(item);
        }
    }
});

document.addEventListener('click', function (e) {
    if (e.target !== guessInput) {
        autocompleteList.style.display = 'none';
    }
});

// 3. 游戏比对交互逻辑
guessBtn.addEventListener('click', () => {
    if (isGameOver) {
        showEndGameModal(guessCount > 0 && getSafeName(resultsBoard.firstChild) === getSafeName(dailyTarget));
        return; 
    }

    const userGuessTitle = guessInput.value.trim();
    if (userGuessTitle === "") { alert("请输入歌曲名！"); return; }

    const guessSong = songData.find(s => getSafeName(s) === userGuessTitle);
    
    if (!guessSong) { alert("曲库里没找到，请从给出的提示列表中选择！"); return; }

    guessCount++;
    renderResultRow(guessSong, dailyTarget);
    
    guessInput.value = ""; 
    autocompleteList.innerHTML = '';
    autocompleteList.style.display = 'none';

    const gName = getSafeName(guessSong);
    const tName = getSafeName(dailyTarget);

    if (gName === tName) {
        isGameOver = true;
        surrenderBtn.style.display = 'none'; 
        setTimeout(() => showEndGameModal(true), 600); 
    }
});

// 4. 渲染八宫格与状态比对
function renderResultRow(guess, target) {
    const row = document.createElement('div');
    row.className = 'result-row';

    row.appendChild(createBox(getSafeName(guess), 'name-box'));

    const gSinger = (guess.歌姬 || "未知").toString();
    const tSinger = (target.歌姬 || "未知").toString();
    row.appendChild(createBox(gSinger, getSingerStatus(gSinger, tSinger)));

    const authorStatus = (guess.author === target.author) ? 'correct-box' : 'incorrect-box';
    row.appendChild(createBox(guess.author || "未知", authorStatus));

    const gPlayWan = Math.ceil(Number(guess.play_count || 0) / 10000);
    const tPlayWan = Math.ceil(Number(target.play_count || 0) / 10000);
    let playColor = 'incorrect-box'; 
    let playText = gPlayWan + "万";
    
    if (gPlayWan === tPlayWan) {
        playColor = 'correct-box'; 
    } else {
        playText += (tPlayWan > gPlayWan) ? " ⬆️" : " ⬇️";
        if (Math.abs(tPlayWan - gPlayWan) <= 50) playColor = 'close-box'; 
    }
    row.appendChild(createBox(playText, playColor));

    // (5) 投稿日期 (已修复年份匹配)
    const gDate = parseCustomDate(guess.publish_date);
    const tDate = parseCustomDate(target.publish_date);
    let dateColor = 'incorrect-box';
    let dateText = guess.publish_date || "未知";
    
    if (gDate.getTime() === tDate.getTime()) {
        dateColor = 'correct-box';
    } else {
        if (tDate > gDate) {
            dateText += " ⬆️";
        } else {
            dateText += " ⬇️";
        }
        if (gDate.getFullYear() === tDate.getFullYear()) {
            dateColor = 'close-box'; 
        } else {
            dateColor = 'incorrect-box';
        }
    }
    row.appendChild(createBox(dateText, dateColor));

    const gFeature = getFeatureArray(guess.feature);
    const tFeature = getFeatureArray(target.feature);
    row.appendChild(createBox(gFeature.join("/"), getFeatureStatus(gFeature, tFeature)));

    const gSH = getSHTag(guess);
    const tSH = getSHTag(target);
    row.appendChild(createBox(gSH, (gSH === tSH) ? 'correct-box' : 'incorrect-box'));

    const gMf = (guess.门番标签 && guess.门番标签 !== "无") ? "门番" : "无";
    const tMf = (target.门番标签 && target.门番标签 !== "无") ? "门番" : "无";
    row.appendChild(createBox(gMf, (gMf === tMf) ? 'correct-box' : 'incorrect-box'));

    resultsBoard.prepend(row);
}

// 5. 投降/结算弹窗控制
surrenderBtn.addEventListener('click', () => {
    if (!dailyTarget || isGameOver) return;
    isGameOver = true;
    surrenderBtn.style.display = 'none';
    showEndGameModal(false);
});

function showEndGameModal(isWin) {
    if (!dailyTarget) return;
    document.getElementById('modal-title').textContent = isWin ? "🎉 恭喜通关！" : "🎯 正确答案";
    document.getElementById('modal-subtitle').textContent = isWin ? `太强了，你一共猜了 ${guessCount} 次！` : "很遗憾，本局未能猜中，下次再接再厉~";
    document.getElementById('modal-song-name').textContent = getSafeName(dailyTarget);
    document.getElementById('m-singer').textContent = dailyTarget.歌姬 || "未知";
    document.getElementById('m-author').textContent = dailyTarget.author || "未知";
    const playCount = Math.ceil(Number(dailyTarget.play_count || 0) / 10000);
    document.getElementById('m-play').textContent = playCount + "万";
    document.getElementById('m-date').textContent = dailyTarget.publish_date || "未知";
    const features = getFeatureArray(dailyTarget.feature);
    document.getElementById('m-feature').textContent = features.join("/");
    document.getElementById('m-sh').textContent = getSHTag(dailyTarget);
    const mf = (dailyTarget.门番标签 && dailyTarget.门番标签 !== "无") ? "门番" : "无";
    document.getElementById('m-mf').textContent = mf;
    endModal.style.display = 'flex';
}

btnRestart.addEventListener('click', () => { location.reload(); });
btnCloseModal.addEventListener('click', () => {
    endModal.style.display = 'none';
    guessInput.value = "";
    guessInput.placeholder = "游戏已结束，点击上方【投降】旁空白处可刷新";
    guessInput.disabled = true;
});

// --- 辅助逻辑函数 ---
function createBox(text, className) {
    const box = document.createElement('div');
    box.textContent = text;
    box.className = `attr-box ${className}`;
    return box;
}

function getFeatureArray(feat) {
    if (!feat || feat === "无" || (Array.isArray(feat) && feat.length === 0)) return ["无"];
    return Array.isArray(feat) ? feat : [feat];
}

function getFeatureStatus(gFeatArray, tFeatArray) {
    const gStr = [...gFeatArray].sort().join();
    const tStr = [...tFeatArray].sort().join();
    if (gStr === tStr) return 'correct-box'; 
    let hasOverlap = false;
    for (let f of gFeatArray) {
        if (tFeatArray.includes(f) && f !== "无") {
            hasOverlap = true; break;
        }
    }
    if (hasOverlap) return 'close-box'; 
    return 'incorrect-box'; 
}

function getSingerStatus(guessSinger, targetSinger) {
    if (guessSinger === "未知" || targetSinger === "未知" || guessSinger === "无" || targetSinger === "无") return 'incorrect-box';
    if (guessSinger === targetSinger) return 'correct-box'; 
    const splitRegex = /[,，、\s&+\/]/; 
    const gSet = new Set(guessSinger.split(splitRegex).filter(s => s.trim() !== ''));
    const tSet = new Set(targetSinger.split(splitRegex).filter(s => s.trim() !== ''));
    let overlap = 0;
    for (let s of gSet) { if (tSet.has(s)) overlap++; }
    if (overlap === tSet.size && overlap === gSet.size) return 'correct-box'; 
    if (overlap > 0) return 'close-box'; 
    return 'incorrect-box'; 
}

function getSHTag(song) {
    if (song.SH标签 === "SH曲") return "SH曲";
    if (song.SH诅咒标签 === "SH诅咒") return "SH诅咒";
    return "无";
}

function parseCustomDate(dateStr) {
    if (!dateStr || dateStr === "无") return new Date(0); 
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
}
