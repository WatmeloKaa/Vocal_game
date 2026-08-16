// 教程专属模拟数据
const mockSongs = {
    target: { song: "66ccff", 歌姬: "洛天依", author: "考拉", play_count: 1000000, publish_date: "12/7/2012", feature: ["流行"], SH标签: "无", 门番标签: "无" },
    attack: { song: "Attack!", 歌姬: "洛天依/乐正绫/言和/乐正龙牙/徵羽摩柯/墨清弦", author: "洛天依", play_count: 1160000, publish_date: "6/6/2019", feature: ["摇滚"], SH标签: "无", 门番标签: "无" },
    zhuo: { song: "灼之花", 歌姬: "洛天依", author: "爹", play_count: 500000, publish_date: "1/1/2020", feature: ["流行"], SH标签: "无", 门番标签: "无" }
};
const dailyTarget = mockSongs.target;

// DOM 元素
let tutoStep = 1;
const guessInput = document.getElementById('guess-input');
const guessBtn = document.getElementById('guess-btn');
const resultsBoard = document.getElementById('results-board');
const autocompleteList = document.getElementById('autocomplete-list');
const tutoOverlay = document.getElementById('tuto-overlay');
const tutoDialog = document.getElementById('tuto-dialog');
const tutoText = document.getElementById('tuto-text');
const tutoNextBtn = document.getElementById('tuto-next-btn');
const inputWrapper = document.getElementById('tuto-input-wrapper');

// 初始化教程
window.onload = () => {
    tutoOverlay.style.display = 'block';
    tutoDialog.style.display = 'block';
    tutoText.innerHTML = "欢迎来到实验教学关卡！<br><br>为了带你熟悉颜色规则，本局的目标歌曲已锁定为 <b>《66ccff》</b>。<br><br>现在，请你在下方的搜索框中搜索 <b style='color:#ffcc00;'>Attack!</b> 并点击【猜！】";
    tutoNextBtn.style.display = 'none';
    inputWrapper.style.zIndex = '2005'; 
};

// 自动补全拦截（加入 66ccff）
guessInput.addEventListener('input', function() {
    const val = this.value.trim().toLowerCase();
    autocompleteList.innerHTML = ''; 
    if (!val) { autocompleteList.style.display = 'none'; return; }

    let matches = [];
    if ("attack!".includes(val)) matches.push("Attack!");
    if ("灼之花".includes(val) || "zhuozhihua".includes(val)) matches.push("灼之花");
    if ("66ccff".includes(val)) matches.push("66ccff"); // 允许搜索正解

    if (matches.length > 0) {
        autocompleteList.style.display = 'block';
        matches.forEach(name => {
            const item = document.createElement('div');
            item.textContent = name;
            item.onclick = () => {
                guessInput.value = name;
                autocompleteList.style.display = 'none';
            };
            autocompleteList.appendChild(item);
        });
    } else {
        autocompleteList.style.display = 'none';
    }
});

// 猜按钮拦截
guessBtn.addEventListener('click', () => {
    const val = guessInput.value.trim().toLowerCase();
    
    if (tutoStep === 1) {
        if (val !== 'attack!') {
            alert("请先按照教程搜索【Attack!】哦！"); return;
        }
        renderResultRow(mockSongs.attack, dailyTarget);
        guessInput.value = "";
        autocompleteList.style.display = 'none';
        showStep2();
    } else if (tutoStep === 3) {
        if (val !== '灼之花') {
            alert("请按照教程搜索【灼之花】哦！"); return;
        }
        renderResultRow(mockSongs.zhuo, dailyTarget);
        guessInput.value = "";
        autocompleteList.style.display = 'none';
        showStep4();
    } else if (tutoStep === 5) {
        if (val !== '66ccff') {
            alert("请按照教程搜索目标曲目【66ccff】哦！"); return;
        }
        renderResultRow(mockSongs.target, dailyTarget);
        guessInput.value = "";
        autocompleteList.style.display = 'none';
        showStep6();
    }
});

// 教程步骤
function showStep2() {
    tutoStep = 2;
    inputWrapper.style.zIndex = '1000'; // 放回底层
    tutoOverlay.style.display = 'block';
    tutoDialog.style.display = 'block';

    const firstRow = resultsBoard.firstChild;
    highlightElements(firstRow, [1, 4]); // 1是歌姬，4是日期

    tutoText.innerHTML = "看，出现颜色提示了！<br><br><b>歌姬框（黄色）：</b>代表【Attack!】的众多演唱者中，包含了目标歌曲的歌姬（洛天依）。<br><br><b>日期框（灰色）：</b>代表两者发布年份相差较远。<br><span style='color:#818384; font-size:14px'>（如果同为2012年发布则会显示黄色）</span>";
    tutoNextBtn.style.display = 'block';
    tutoNextBtn.textContent = "下一步";
    tutoNextBtn.onclick = showStep3;
}

function showStep3() {
    tutoStep = 3;
    removeHighlights();
    tutoOverlay.style.display = 'none';
    inputWrapper.style.zIndex = '2005';
    tutoText.innerHTML = "现在，请继续在搜索框中搜索 <b style='color:#538d4e'>灼之花</b>，看看完全匹配时是什么样！";
    tutoNextBtn.style.display = 'none';
}

function showStep4() {
    tutoStep = 4;
    inputWrapper.style.zIndex = '1000';
    tutoOverlay.style.display = 'block';
    tutoDialog.style.display = 'block';

    const firstRow = resultsBoard.firstChild;
    highlightElements(firstRow, [1]); // 突出显示歌姬

    tutoText.innerHTML = "漂亮！<br><br><b>歌姬框（绿色）：</b>代表【灼之花】和目标歌曲完全一致，都是洛天依独唱！";
    tutoNextBtn.style.display = 'block';
    tutoNextBtn.textContent = "下一步";
    tutoNextBtn.onclick = showStep5;
}

// 新增步骤：让玩家搜 66ccff
function showStep5() {
    tutoStep = 5;
    removeHighlights();
    tutoOverlay.style.display = 'none';
    inputWrapper.style.zIndex = '2005';
    tutoText.innerHTML = "颜色规律掌握得差不多了！<br><br>现在，请直接输入并猜出真正的目标歌曲：<b style='color:#538d4e'>66ccff</b>";
    tutoNextBtn.style.display = 'none';
}

// 新增步骤：展示全绿效果并过渡到表头
function showStep6() {
    tutoStep = 6;
    inputWrapper.style.zIndex = '1000';
    tutoOverlay.style.display = 'block';
    tutoDialog.style.display = 'block';

    const firstRow = resultsBoard.firstChild;
    // 直接把第一行整行高亮
    firstRow.style.position = "relative";
    firstRow.style.zIndex = "2001";
    firstRow.classList.add('tutorial-highlight');

    tutoText.innerHTML = "🎉 完美！<br><br>当你看到<b>全绿</b>的八宫格时，就代表你准确无误地找到了目标曲目！<br><br>在正式开始游戏前，让我们最后认识一下顶部的那些属性表头吧。";
    tutoNextBtn.style.display = 'block';
    tutoNextBtn.textContent = "认识表头";
    tutoNextBtn.onclick = showStep7;
}

// 新增步骤：介绍表头
function showStep7() {
    tutoStep = 7;
    removeHighlights();
    
    // 取消第一行的特殊样式
    const firstRow = resultsBoard.firstChild;
    firstRow.style.position = "";
    firstRow.style.zIndex = "";

    // 高亮顶部表头
    const header = document.querySelector('.grid-header');
    header.style.position = "relative";
    header.style.zIndex = "2001";
    header.style.backgroundColor = "#121213"; // 给个背景色防止透明穿透
    header.style.padding = "10px";
    header.style.borderRadius = "8px";
    header.classList.add('tutorial-highlight');

    tutoText.innerHTML = `
        <div style="font-size: 15px; text-align: left; line-height: 1.8;">
            <b style="color:#d7dadc">P主：</b> 视频的发布老师。<br>
            <b style="color:#d7dadc">播放量：</b> 黄色为播放量比较接近，灰色会差更多。<br>
            <b style="color:#d7dadc">投稿日期：</b> 黄色为同一年发布，灰色为不同。<br>
            <b style="color:#d7dadc">标签：</b> 歌曲的风格或流派。<br>
            <b style="color:#d7dadc">SH：</b> SH是歌曲的特殊荣誉。当连续三周进入周刊前三时自动获得，SH诅咒则为前两周进入周刊第三周未能进入。
            <b style="color:#d7dadc">门番：</b> 同样为一种特殊荣誉。
        </div>
        <br><div style="text-align:center; color:#ffcc00; font-weight:bold;">你已准备就绪！</div>
    `;
    tutoNextBtn.style.display = 'block';
    tutoNextBtn.textContent = "✅ 完成并开始游戏";
    tutoNextBtn.onclick = () => { window.location.href = 'index.html'; };
}

// 辅助：圈出元素
function highlightElements(rowDiv, indices) {
    const boxes = rowDiv.querySelectorAll('.attr-box');
    indices.forEach(i => {
        if(boxes[i]) boxes[i].classList.add('tutorial-highlight');
    });
}

function removeHighlights() {
    document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
    });
}

// --- 渲染引擎（同主游戏，保证效果一致） ---
function getSafeName(songObj) { return (songObj.song || songObj.title || "").toString().trim(); }
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
        if (tFeatArray.includes(f) && f !== "无") { hasOverlap = true; break; }
    }
    return hasOverlap ? 'close-box' : 'incorrect-box'; 
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
function getSHTag(song) { return song.SH标签 === "SH曲" ? "SH曲" : (song.SH诅咒标签 === "SH诅咒" ? "SH诅咒" : "无"); }
function parseCustomDate(dateStr) {
    if (!dateStr || dateStr === "无") return new Date(0); 
    if (dateStr.includes('/')) {
        const parts = dateStr.split('/');
        if (parts.length === 3) return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    return new Date(dateStr);
}

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

    const gDate = parseCustomDate(guess.publish_date);
    const tDate = parseCustomDate(target.publish_date);
    let dateColor = 'incorrect-box';
    let dateText = guess.publish_date || "未知";
    if (gDate.getTime() === tDate.getTime()) {
        dateColor = 'correct-box';
    } else {
        dateText += (tDate > gDate) ? " ⬆️" : " ⬇️";
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