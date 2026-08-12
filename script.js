let songData = [];
let dailyTarget = null;
let guessCount = 0; 

const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const resultsBoard = document.getElementById('results-board');

// 1. 初始化数据
fetch('vocaloid_data.json')
    .then(response => response.json())
    .then(data => {
        songData = data;
        const dataList = document.getElementById('song-list');
        songData.forEach(song => {
            if (song.title && song.title.trim() !== "无") {
                const option = document.createElement('option');
                option.value = song.title.trim(); 
                dataList.appendChild(option);
            }
        });
        setRandomTarget();
    })
    .catch(error => console.error("读取数据失败：", error));

function setRandomTarget() {
    const index = Math.floor(Math.random() * songData.length);
    dailyTarget = songData[index];
    console.log("🤫 答案是：", dailyTarget.title.trim());
}

// 2. 交互逻辑
guessBtn.addEventListener('click', () => {
    const userGuessTitle = guessInput.value.trim();
    if (userGuessTitle === "") { alert("请输入歌曲名！"); return; }

    const guessSong = songData.find(s => s.title.trim() === userGuessTitle);
    if (!guessSong) { alert("曲库里没找到，请从下拉列表选择！"); return; }

    guessCount++;
    renderResultRow(guessSong, dailyTarget);
    guessInput.value = ""; 

    if (guessSong.title.trim() === dailyTarget.title.trim()) {
        setTimeout(() => alert(`🎉 恭喜通关！共猜了 ${guessCount} 次！\n刷新网页即可开启新的一局！`), 500);
    }
});

// 3. 核心：渲染七宫格与状态比对
function renderResultRow(guess, target) {
    const row = document.createElement('div');
    row.className = 'result-row';

    // (1) 曲名 (白底黑字)
    row.appendChild(createBox(guess.title.trim(), 'name-box'));

    // (2) 歌姬 (统一颜色：完全一致绿，部分一致橙，毫无交集灰)
    const gSinger = guess.歌姬 || "未知";
    const tSinger = target.歌姬 || "未知";
    const singerStatus = getSingerStatus(gSinger, tSinger);
    row.appendChild(createBox(gSinger, singerStatus));

    // (3) P主
    const authorStatus = (guess.author === target.author) ? 'correct-box' : 'incorrect-box';
    row.appendChild(createBox(guess.author, authorStatus));

    // (4) 播放量 (核心修改：引入 50w 阈值)
    const gPlayWan = Math.ceil(Number(guess.play_count) / 10000);
    const tPlayWan = Math.ceil(Number(target.play_count) / 10000);
    let playColor = 'incorrect-box'; // 默认底色改为灰色
    let playText = gPlayWan + "万";
    
    if (gPlayWan === tPlayWan) {
        playColor = 'correct-box'; // 完全猜中：绿色
    } else {
        // 判断箭头方向
        if (tPlayWan > gPlayWan) {
            playText += " ⬆️";
        } else {
            playText += " ⬇️";
        }
        
        // 计算绝对值差，如果差距小于等于 50 万，则变成橙色
        const diff = Math.abs(tPlayWan - gPlayWan);
        if (diff <= 50) {
            playColor = 'close-box'; // 接近：橙色
        } else {
            playColor = 'incorrect-box'; // 偏离太多：灰色
        }
    }
    row.appendChild(createBox(playText, playColor));

    // (5) 投稿日期
    const gDate = parseCustomDate(guess.publish_date);
    const tDate = parseCustomDate(target.publish_date);
    let dateColor = 'incorrect-box';
    let dateText = guess.publish_date;
    
    if (gDate.getTime() === tDate.getTime()) {
        dateColor = 'correct-box';
    } else if (tDate > gDate) {
        dateColor = 'close-box'; 
        dateText += " ⬆️";
    } else {
        dateColor = 'close-box';
        dateText += " ⬇️";
    }
    row.appendChild(createBox(dateText, dateColor));

    // (6) SH 属性
    const gSH = getSHTag(guess);
    const tSH = getSHTag(target);
    const shColor = (gSH === tSH) ? 'correct-box' : 'incorrect-box';
    row.appendChild(createBox(gSH, shColor));

    // (7) 门番属性
    const gMf = (guess.门番标签 && guess.门番标签 !== "无") ? "门番" : "无";
    const tMf = (target.门番标签 && target.门番标签 !== "无") ? "门番" : "无";
    const mfColor = (gMf === tMf) ? 'correct-box' : 'incorrect-box';
    row.appendChild(createBox(gMf, mfColor));

    resultsBoard.prepend(row);
}

// --- 辅助逻辑函数 ---

function createBox(text, className) {
    const box = document.createElement('div');
    box.textContent = text;
    box.className = `attr-box ${className}`;
    return box;
}

// 核心：智能匹配歌姬名称
function getSingerStatus(guessSinger, targetSinger) {
    if (guessSinger === "未知" || targetSinger === "未知" || guessSinger === "无" || targetSinger === "无") return 'incorrect-box';

    if (guessSinger === targetSinger) return 'correct-box'; 

    const splitRegex = /[,，、\s&+\/]/; 
    const gSet = new Set(guessSinger.split(splitRegex).filter(s => s.trim() !== ''));
    const tSet = new Set(targetSinger.split(splitRegex).filter(s => s.trim() !== ''));

    let overlap = 0;
    for (let s of gSet) {
        if (tSet.has(s)) overlap++;
    }

    if (overlap === tSet.size && overlap === gSet.size) {
        return 'correct-box'; 
    }
    
    if (overlap > 0) {
        // 修改点：为了统一视觉，将 partial-box (黄色) 统一替换为 close-box (橙色)
        return 'close-box'; 
    }

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
        if (parts.length === 3) {
            return new Date(parts[2], parts[1] - 1, parts[0]);
        }
    }
    return new Date(dateStr);
}